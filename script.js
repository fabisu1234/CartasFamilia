'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const formulario = $('formulario-acceso');
  const campo = $('clave');
  const entrar = $('entrar');
  const mensaje = $('mensaje-acceso');
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  const rapido = MODO_PRUEBA && new URLSearchParams(location.search).get('rapido') === '1';
  let cartaActual = null;
  let categoriaActual = null;
  let versionActual = '';
  let generacion = 0; // Invalida respuestas y temporizadores al salir.
  let fallos = 0;
  let bloqueadoHasta = 0;
  let relojEspera = null;
  let temporizador = null;
  let temporizadorScroll = null;
  let ocupado = false;
  let escribiendo = false;
  let caracteres = [];
  let posicion = 0;
  let nodoTexto = null;
  let seguirTexto = true;

  // Solo se recuerda que una versión de una carta ya se terminó de leer.
  // Ni contraseña, ni título, ni texto, ni foto pasan por el almacenamiento.
  function claveLectura() { return `navidad:leida:v1:${categoriaActual}:${versionActual}`; }
  function yaLeida() {
    try { return localStorage.getItem(claveLectura()) === '1'; }
    catch { return false; }
  }
  function recordarLectura() {
    try { localStorage.setItem(claveLectura(), '1'); }
    catch { /* La carta funciona también si el navegador bloquea localStorage. */ }
  }
  function mostrarContrasena(mostrar) {
    campo.type = mostrar ? 'text' : 'password';
    $('mostrar-clave').setAttribute('aria-pressed', String(mostrar));
    $('mostrar-clave').setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }
  $('mostrar-clave').addEventListener('click', () => mostrarContrasena(campo.type === 'password'));

  function actualizarEspera() {
    const segundos = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
    if (segundos > 0) {
      entrar.disabled = true;
      mensaje.textContent = TEXTOS.esperando(segundos);
    } else {
      clearInterval(relojEspera);
      relojEspera = null;
      entrar.disabled = ocupado;
      mensaje.textContent = 'Ya puedes probar otra vez 🎄';
    }
  }
  function errorClave() {
    fallos += 1;
    mensaje.textContent = TEXTOS.incorrecta;
    campo.setAttribute('aria-invalid', 'true');
    const tarjeta = $('tarjeta-acceso');
    tarjeta.classList.remove('temblar');
    void tarjeta.offsetWidth;
    tarjeta.classList.add('temblar');
    if (fallos >= 3) {
      // 2, 4, 8… segundos; tope de un minuto para no dejar atrapada a la persona.
      bloqueadoHasta = Date.now() + Math.min(60000, 2000 * 2 ** Math.min(fallos - 3, 5));
      actualizarEspera();
      relojEspera = setInterval(actualizarEspera, 250);
    }
    campo.focus();
    campo.select();
  }

  function validarCarta(carta) {
    if (!carta || ['titulo', 'texto', 'foto', 'pieFoto', 'firma'].some(propiedad => typeof carta[propiedad] !== 'string')) throw new Error('Carta inválida');
    // Solo se aceptan fotos raster embebidas, nunca URLs públicas ni SVG activo.
    if (carta.foto && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(carta.foto)) throw new Error('Foto inválida');
  }
  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (ocupado || Date.now() < bloqueadoHasta || !formulario.reportValidity()) return;
    if (!globalThis.crypto?.subtle) { mensaje.textContent = TEXTOS.sinCrypto; return; }
    const categoria = new FormData(formulario).get('categoria');
    const bloque = globalThis.CONTENIDO_CIFRADO?.[categoria];
    if (!bloque) { mensaje.textContent = TEXTOS.sinContenido; return; }
    const turno = ++generacion;
    ocupado = true;
    entrar.disabled = true;
    campo.readOnly = true;
    formulario.setAttribute('aria-busy', 'true');
    entrar.querySelector('span').textContent = TEXTOS.abriendo;
    mensaje.textContent = '';
    campo.removeAttribute('aria-invalid');
    // El campo se vacía inmediatamente; la contraseña solo vive durante esta operación.
    const promesa = RegaloCrypto.descifrar(bloque, campo.value);
    campo.value = '';
    mostrarContrasena(false);
    let descifrada = null;
    try {
      descifrada = await promesa;
      if (turno !== generacion) return;
      validarCarta(descifrada);
      cartaActual = descifrada;
      categoriaActual = categoria;
      versionActual = bloque.salt; // Un salt nuevo permite animar una nueva edición.
      fallos = 0;
      bloqueadoHasta = 0;
      abrirCarta();
    } catch (error) {
      if (turno !== generacion) return;
      if (error.name === 'OperationError') errorClave();
      else mensaje.textContent = TEXTOS.sinContenido;
    } finally {
      descifrada = null;
      if (turno === generacion) {
        ocupado = false;
        campo.readOnly = false;
        entrar.disabled = Date.now() < bloqueadoHasta;
        entrar.querySelector('span').textContent = TEXTOS.entrar;
        formulario.removeAttribute('aria-busy');
      }
    }
  });

  function sinAnimacion() { return rapido || movimientoReducido.matches; }
  function limpiarTemporizadores() {
    clearTimeout(temporizador);
    clearTimeout(temporizadorScroll);
    temporizador = null;
    temporizadorScroll = null;
  }
  function ponerFoto() {
    if (!cartaActual?.foto || $('foto-antes').childElementCount || $('foto-despues').childElementCount) return;
    const figura = document.createElement('figure');
    figura.className = 'polaroid';
    const imagen = document.createElement('img');
    imagen.src = cartaActual.foto;
    imagen.alt = cartaActual.pieFoto || 'Un recuerdo especial para acompañar esta carta';
    imagen.decoding = 'async';
    imagen.addEventListener('load', () => desplazarHasta(imagen), { once: true });
    figura.append(imagen);
    if (cartaActual.pieFoto) {
      const pie = document.createElement('figcaption');
      pie.textContent = cartaActual.pieFoto;
      figura.append(pie);
    }
    $(FOTO_AL_FINAL ? 'foto-despues' : 'foto-antes').append(figura);
  }
  function desplazarHasta(elemento) {
    if (!seguirTexto || sinAnimacion() || !elemento || document.hidden) return;
    const borde = elemento.getBoundingClientRect().bottom;
    if (borde > innerHeight - 75) window.scrollBy({ top: borde - innerHeight + 100, behavior: 'smooth' });
  }
  function programarScroll() {
    if (temporizadorScroll) return;
    temporizadorScroll = setTimeout(() => {
      temporizadorScroll = null;
      if (escribiendo) desplazarHasta($('texto-carta'));
    }, 220);
  }
  // Leer arriba no debe convertirse en una pelea con el desplazamiento automático.
  window.addEventListener('wheel', evento => { if (evento.deltaY < 0) seguirTexto = false; }, { passive: true });
  let toqueY = 0;
  window.addEventListener('touchstart', evento => { toqueY = evento.touches[0]?.clientY || 0; }, { passive: true });
  window.addEventListener('touchmove', evento => { if ((evento.touches[0]?.clientY || 0) > toqueY + 12) seguirTexto = false; }, { passive: true });
  document.addEventListener('keydown', evento => { if (['PageUp', 'Home', 'ArrowUp'].includes(evento.key)) seguirTexto = false; });

  function abrirCarta() {
    $('pantalla-acceso').hidden = true;
    $('pantalla-carta').hidden = false;
    seguirTexto = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const completa = sinAnimacion() || yaLeida();
    document.body.classList.toggle('sin-animacion', completa);
    $('cerrar-durante').hidden = false;
    $('saltar-animacion').hidden = completa;
    $('carta').hidden = true;
    $('sobre-animado').hidden = completa;
    if (completa) mostrarCarta(false);
    else {
      $('saltar-animacion').focus({ preventScroll: true });
      // Reinicia el sobre al abrir otra carta en la misma sesión del navegador.
      const sobre = $('sobre-animado');
      sobre.style.animation = 'none';
      void sobre.offsetWidth;
      sobre.style.animation = '';
      for (const pieza of sobre.children) {
        pieza.style.animation = 'none';
        void pieza.offsetWidth;
        pieza.style.animation = '';
      }
      temporizador = setTimeout(() => mostrarCarta(true), 2450);
    }
  }
  function mostrarCarta(animar) {
    if (!cartaActual) return;
    limpiarTemporizadores();
    $('sobre-animado').hidden = true;
    $('carta').hidden = false;
    $('titulo-carta').textContent = cartaActual.titulo;
    $('titulo-carta').focus({ preventScroll: true });
    $('foto-antes').replaceChildren();
    $('foto-despues').replaceChildren();
    $('firma').textContent = '';
    $('final-carta').hidden = true;
    $('cerrar-durante').hidden = false;
    $('estado-lectura').textContent = '';
    $('texto-carta').replaceChildren();
    nodoTexto = document.createTextNode('');
    $('texto-carta').append(nodoTexto);
    if (!FOTO_AL_FINAL) ponerFoto();
    if (animar && !sinAnimacion()) iniciarEscritura();
    else completarCarta(false);
  }
  function iniciarEscritura() {
    document.body.classList.remove('sin-animacion');
    // Segmenter conserva emojis compuestos, banderas y tildes combinadas.
    // Array.from al menos conserva los puntos Unicode en navegadores antiguos.
    caracteres = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(cartaActual.texto), trozo => trozo.segment)
      : Array.from(cartaActual.texto);
    posicion = 0;
    escribiendo = true;
    $('texto-carta').classList.add('escribiendo');
    $('saltar-animacion').hidden = false;
    $('repetir-animacion').hidden = true;
    $('texto-carta').setAttribute('aria-busy', 'true');
    $('estado-lectura').textContent = 'Tu carta se está escribiendo. Puedes usar Saltar animación para leerla completa.';
    escribirCaracter();
  }
  function escribirCaracter() {
    if (!escribiendo || !cartaActual || document.hidden) return;
    if (posicion >= caracteres.length) { completarCarta(true); return; }
    const caracter = caracteres[posicion++];
    nodoTexto.appendData(caracter);
    programarScroll();
    let pausa = VELOCIDAD_ESCRITURA;
    if (/[.!?…]/u.test(caracter)) pausa += 230;
    if (caracter === '\n') pausa += 280;
    temporizador = setTimeout(escribirCaracter, pausa);
  }
  function completarCarta(desplazar) {
    if (!cartaActual) return;
    const focoEnSaltar = document.activeElement === $('saltar-animacion');
    limpiarTemporizadores();
    escribiendo = false;
    caracteres = [];
    posicion = 0;
    $('texto-carta').classList.remove('escribiendo');
    $('texto-carta').removeAttribute('aria-busy');
    $('texto-carta').textContent = cartaActual.texto;
    nodoTexto = null;
    if (FOTO_AL_FINAL) ponerFoto();
    $('firma').textContent = cartaActual.firma;
    $('final-carta').hidden = false;
    $('cerrar-durante').hidden = true;
    $('saltar-animacion').hidden = true;
    $('repetir-animacion').hidden = sinAnimacion();
    $('estado-lectura').textContent = 'Tu carta está completa. Feliz Navidad.';
    recordarLectura();
    if (focoEnSaltar) $('titulo-carta').focus({ preventScroll: true });
    if (desplazar) desplazarHasta($('firma'));
  }
  $('saltar-animacion').addEventListener('click', () => {
    document.body.classList.add('sin-animacion');
    if ($('carta').hidden) mostrarCarta(false);
    else completarCarta(false);
    $('titulo-carta').focus({ preventScroll: true });
  });
  $('repetir-animacion').addEventListener('click', () => {
    seguirTexto = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mostrarCarta(true);
  });

  function cerrarSesion(enfocar = true) {
    ++generacion;
    limpiarTemporizadores();
    escribiendo = false;
    ocupado = false;
    caracteres = [];
    nodoTexto = null;
    cartaActual = null;
    categoriaActual = null;
    versionActual = '';
    // Elimina tanto los nodos de texto como la imagen y su data URL.
    $('carta').querySelectorAll('img').forEach(imagen => imagen.removeAttribute('src'));
    for (const id of ['titulo-carta', 'texto-carta', 'foto-antes', 'foto-despues', 'firma', 'estado-lectura']) $(id).replaceChildren();
    $('texto-carta').classList.remove('escribiendo');
    $('texto-carta').removeAttribute('aria-busy');
    $('pantalla-carta').hidden = true;
    $('pantalla-acceso').hidden = false;
    campo.value = '';
    campo.readOnly = false;
    mostrarContrasena(false);
    formulario.removeAttribute('aria-busy');
    entrar.querySelector('span').textContent = TEXTOS.entrar;
    entrar.disabled = Date.now() < bloqueadoHasta;
    document.body.classList.remove('sin-animacion');
    mensaje.textContent = entrar.disabled ? TEXTOS.esperando(Math.ceil((bloqueadoHasta - Date.now()) / 1000)) : '';
    if (enfocar) { window.scrollTo({ top: 0, behavior: 'instant' }); campo.focus({ preventScroll: true }); }
  }
  $('cerrar-sesion').addEventListener('click', () => cerrarSesion());
  $('cerrar-durante').addEventListener('click', () => cerrarSesion());
  document.addEventListener('visibilitychange', () => {
    if (!escribiendo) return;
    clearTimeout(temporizador);
    if (!document.hidden) escribirCaracter();
  });
  movimientoReducido.addEventListener('change', evento => {
    if (evento.matches && cartaActual) {
      document.body.classList.add('sin-animacion');
      if ($('carta').hidden) mostrarCarta(false);
      else completarCarta(false);
    }
  });
  // Evita restaurar una carta abierta o una clave desde la caché atrás/adelante.
  window.addEventListener('pagehide', () => cerrarSesion(false));
  window.addEventListener('pageshow', evento => { campo.value = ''; if (evento.persisted) cerrarSesion(false); });
  if (!globalThis.crypto?.subtle) { mensaje.textContent = TEXTOS.sinCrypto; entrar.disabled = true; }
})();

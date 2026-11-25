// Personaliza la experiencia aquí. No escribas contraseñas ni cartas en este archivo.
const MODO_PRUEBA = true;
const FOTO_AL_FINAL = true;
const VELOCIDAD_ESCRITURA = 32; // Milisegundos por carácter; recomendado: 25–40.
const ITERACIONES_PBKDF2 = 310000;

const TEXTOS = Object.freeze({
  incorrecta: 'Esa no es la clave 🎄 Prueba otra vez.',
  esperando: segundos => `Un respiro navideño 🎄 Podrás intentar en ${segundos} s.`,
  abriendo: 'Abriendo tu regalo…',
  entrar: 'Entrar',
  sinCrypto: 'Para abrir tu regalo, usa un navegador actualizado con HTTPS o localhost.',
  sinContenido: 'Tu regalo aún no está listo. Pídele a quien te lo envió que revise el archivo cifrado.'
});

// Utilidades compartidas por el sitio y la herramienta local. Nunca verificamos
// una contraseña aparte: la autenticación la hace el descifrado AES-GCM.
const RegaloCrypto = (() => {
  const codificador = new TextEncoder();
  const decodificador = new TextDecoder('utf-8', { fatal: true });
  const aBase64 = bytes => {
    let binario = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binario += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binario);
  };
  const deBase64 = valor => Uint8Array.from(atob(valor), letra => letra.charCodeAt(0));
  async function derivar(contrasena, salt, iteraciones, uso) {
    const bytes = codificador.encode(contrasena);
    try {
      const material = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveKey']);
      return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: iteraciones, hash: 'SHA-256' },
        material, { name: 'AES-GCM', length: 256 }, false, [uso]
      );
    } finally { bytes.fill(0); }
  }
  async function cifrar(contenido, contrasena) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const clave = await derivar(contrasena, salt, ITERACIONES_PBKDF2, 'encrypt');
    const bytes = codificador.encode(JSON.stringify(contenido));
    try {
      const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, bytes);
      return { version: 1, iteraciones: ITERACIONES_PBKDF2, salt: aBase64(salt), iv: aBase64(iv), textoCifrado: aBase64(new Uint8Array(cifrado)) };
    } finally { bytes.fill(0); }
  }
  async function descifrar(bloque, contrasena) {
    if (bloque?.version !== 1 || !Number.isInteger(bloque.iteraciones) || bloque.iteraciones < 200000 || bloque.iteraciones > 2000000) throw new Error('Formato cifrado no compatible');
    const salt = deBase64(bloque.salt);
    const iv = deBase64(bloque.iv);
    if (salt.length !== 16 || iv.length !== 12) throw new Error('Salt o IV inválido');
    const clave = await derivar(contrasena, salt, bloque.iteraciones, 'decrypt');
    const bytes = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, clave, deBase64(bloque.textoCifrado)));
    try { return JSON.parse(decodificador.decode(bytes)); }
    finally { bytes.fill(0); }
  }
  return Object.freeze({ cifrar, descifrar });
})();

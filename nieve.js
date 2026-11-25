'use strict';

// Un solo canvas, máximo 30 fotogramas/segundo y sin trabajo en pestañas ocultas.
(() => {
  const canvas = document.getElementById('nieve');
  const contexto = canvas.getContext('2d');
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  if (!contexto) return;
  let ancho = 0, alto = 0, particulas = [], cuadro = null, anterior = 0, tiempoDibujo = 0;
  const objetos = ['🎄', '🍪', '⭐', '🍬', '🎁', '🔔', '🔴'];
  // Los objetos se dibujan una vez en pequeños sprites para aligerar cada frame.
  const sprites = objetos.map((objeto, indice) => {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 48;
    const c = lienzo.getContext('2d');
    if (indice === 1) { // Monito de jengibre, también en navegadores sin ese emoji.
      c.fillStyle = '#bd8758';c.strokeStyle = '#bd8758';c.lineCap = 'round';c.lineWidth = 9;
      c.beginPath();c.arc(24,11,8,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(24,20);c.lineTo(24,31);c.moveTo(10,24);c.lineTo(38,24);c.moveTo(24,30);c.lineTo(15,42);c.moveTo(24,30);c.lineTo(33,42);c.stroke();
      c.fillStyle = '#fff1d8';[20,28].forEach(x=>{c.beginPath();c.arc(x,10,1.2,0,Math.PI*2);c.fill();});
      c.strokeStyle = '#fff1d8';c.lineWidth = 1.5;c.beginPath();c.arc(24,12,4,0,Math.PI);c.stroke();
      c.fillStyle = '#a63840';c.fillRect(21,22,6,4);
    } else if (indice === 3) { // Bastón de caramelo dibujado sin dependencias.
      c.strokeStyle='#f6ecd9';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(18,40);c.lineTo(18,14);c.bezierCurveTo(18,1,35,1,35,14);c.stroke();
      c.strokeStyle='#ae4850';c.lineWidth=4;[[16,33,20,30],[16,23,20,20],[18,11,22,8],[28,7,33,10]].forEach(v=>{c.beginPath();c.moveTo(v[0],v[1]);c.lineTo(v[2],v[3]);c.stroke();});
    } else { c.font = '33px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(objeto,24,25); }
    return lienzo;
  });
  function crear(inicial) {
    const objeto = Math.random() < .12;
    return { x: Math.random()*ancho, y: inicial ? Math.random()*alto : -30,
      radio: objeto ? 13+Math.random()*7 : .8+Math.random()*2.1,
      velocidad: 10+Math.random()*21, fase: Math.random()*Math.PI*2,
      opacidad: objeto ? .3+Math.random()*.24 : .2+Math.random()*.45,
      sprite: objeto ? sprites[Math.floor(Math.random()*sprites.length)] : null };
  }
  function ajustar() {
    ancho=innerWidth;alto=innerHeight;
    const escala=Math.min(devicePixelRatio||1,1.5);
    canvas.width=ancho*escala;canvas.height=alto*escala;
    contexto.setTransform(escala,0,0,escala,0,0);
    particulas=Array.from({length:ancho<600?30:ancho<1000?48:68},()=>crear(true));
  }
  function animar(ahora) {
    if (reducir.matches || document.hidden) { cuadro=null;return; }
    cuadro=requestAnimationFrame(animar);
    if (ahora-tiempoDibujo<1000/30) return;
    const delta=anterior?Math.min((ahora-anterior)/1000,.07):.033;
    anterior=ahora;tiempoDibujo=ahora;
    contexto.clearRect(0,0,ancho,alto);
    for(let i=0;i<particulas.length;i++) {
      const p=particulas[i];p.y+=p.velocidad*delta;
      p.x+=Math.sin(ahora*.00045+p.fase)*7*delta;
      if(p.y>alto+30){particulas[i]=crear(false);continue;}
      contexto.globalAlpha=p.opacidad;
      if(p.sprite) contexto.drawImage(p.sprite,p.x,p.y,p.radio,p.radio);
      else{contexto.fillStyle='#f4f1df';contexto.beginPath();contexto.arc(p.x,p.y,p.radio,0,Math.PI*2);contexto.fill();}
    }
    contexto.globalAlpha=1;
  }
  function sincronizar() {
    cancelAnimationFrame(cuadro);cuadro=null;anterior=0;
    const detenida=reducir.matches;
    if(detenida) contexto.clearRect(0,0,ancho,alto);
    if(!detenida&&!document.hidden) cuadro=requestAnimationFrame(animar);
  }
  document.addEventListener('visibilitychange',sincronizar);
  reducir.addEventListener('change',sincronizar);
  let resize;
  window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(ajustar,180);},{passive:true});
  ajustar();sincronizar();
})();

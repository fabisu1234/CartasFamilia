// Comprobaciones locales del cifrado real y de la entrega pública.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = nombre => fs.readFile(path.join(raiz, nombre), 'utf8');
const contexto = vm.createContext({ crypto: webcrypto, TextEncoder, TextDecoder, Uint8Array, btoa, atob });
vm.runInContext(await leer('config.js'), contexto);
const cifrador = vm.runInContext('RegaloCrypto', contexto);
const fuente = await leer('contenido-original.js');
const originales = JSON.parse(fuente.slice(fuente.indexOf('{'), fuente.lastIndexOf('}') + 1));
const categorias = ['papa', 'mama', 'hermana', 'novia', 'benja'];

if (process.argv.includes('--generar')) {
  // Conserva los bloques de cartas que no se han editado.
  contexto.window = {};
  vm.runInContext(await leer('contenido-cifrado.js'), contexto);
  const anteriores = contexto.window.CONTENIDO_CIFRADO;
  const bloques = {};
  for (const categoria of categorias) {
    const { contrasena, ...contenido } = originales[categoria];
    assert.equal(contenido.foto, '', 'Los ejemplos iniciales no necesitan fotos externas');
    let igual = false;
    if (anteriores[categoria]) {
      const anterior = await cifrador.descifrar(anteriores[categoria], contrasena);
      igual = JSON.stringify(anterior) === JSON.stringify(contenido);
    }
    bloques[categoria] = igual ? anteriores[categoria] : await cifrador.cifrar(contenido, contrasena);
  }
  await fs.writeFile(path.join(raiz, 'contenido-cifrado.js'), '// Archivo público. Cinco ejemplos cifrados con AES-GCM.\nwindow.CONTENIDO_CIFRADO = Object.freeze(' + JSON.stringify(bloques, null, 2) + ');\n');
}
contexto.window = {};
const fuenteCifrada = await leer('contenido-cifrado.js');
vm.runInContext(fuenteCifrada, contexto);
const bloques = contexto.window.CONTENIDO_CIFRADO;
const sales = new Set();
const ivs = new Set();
for (const categoria of categorias) {
  const { contrasena, ...esperada } = originales[categoria];
  const bloque = bloques[categoria];
  assert.ok(bloque.iteraciones >= 200000);
  assert.equal(atob(bloque.salt).length, 16);
  assert.equal(atob(bloque.iv).length, 12);
  sales.add(bloque.salt); ivs.add(bloque.iv);
  const carta = await cifrador.descifrar(bloque, contrasena);
  assert.deepEqual(JSON.parse(JSON.stringify(carta)), esperada);
  await assert.rejects(cifrador.descifrar(bloque, 'clave-incorrecta'), { name: 'OperationError' });
  const otra = categorias.find(otra => otra !== categoria);
  await assert.rejects(cifrador.descifrar(bloque, originales[otra].contrasena), { name: 'OperationError' });
  const manipulado = Uint8Array.from(atob(bloque.textoCifrado), letra => letra.charCodeAt(0));
  manipulado[10] ^= 1;
  await assert.rejects(cifrador.descifrar({ ...bloque, textoCifrado: btoa(String.fromCharCode(...manipulado)) }, contrasena), { name: 'OperationError' });
}
assert.equal(sales.size, categorias.length); assert.equal(ivs.size, categorias.length);
const conFoto = { titulo: 'Prueba privada', texto: '¡Árbol! 👨‍👩‍👧‍👦\n\nCariño 🤍', foto: 'data:image/png;base64,iVBORw0KGgo=', pieFoto: 'Un recuerdo', firma: 'Yo' };
const prueba = await cifrador.cifrar(conFoto, 'frase-aleatoria-para-verificar');
assert.deepEqual(JSON.parse(JSON.stringify(await cifrador.descifrar(prueba, 'frase-aleatoria-para-verificar'))), conFoto);
const segunda = await cifrador.cifrar(conFoto, 'frase-aleatoria-para-verificar');
assert.notEqual(prueba.salt, segunda.salt); assert.notEqual(prueba.iv, segunda.iv);
for (const nombre of ['index.html', 'style.css', 'script.js', 'nieve.js', 'config.js', 'contenido-cifrado.js']) {
  const publico = await leer(nombre);
  for (const original of Object.values(originales)) {
    assert.ok(!publico.includes(original.contrasena), `${nombre} no debe contener claves`);
    assert.ok(!publico.includes(original.titulo), `${nombre} no debe contener títulos privados`);
    assert.ok(!publico.includes(original.texto.slice(0, 80)), `${nombre} no debe contener cartas`);
  }
}
const pagina = await leer('index.html');
assert.match(pagina, /noindex, nofollow/);
assert.match(await leer('config.js'), /const MODO_PRUEBA = false/);
for (const nombre of ['script.js', 'nieve.js', 'config.js', 'contenido-cifrado.js']) new vm.Script(await leer(nombre), { filename: nombre });
const herramienta = await leer('herramientas/cifrar.html');
for (const [indice, coincidencia] of [...herramienta.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) new vm.Script(coincidencia[1], { filename: `cifrar-inline-${indice}.js` });
assert.equal((pagina.match(/name="categoria"/g) || []).length, categorias.length);
assert.match(pagina, /Feliz navidad,<br> <em>los amo ♡<\/em>/);
assert.match(pagina, /¿Quién eres\?/);
assert.match(pagina, /aunque estemos lejos o cerca les tengo este regalo/);
for (const frase of ['PEQUEÑOS REGALOS, GRANDES SENTIMIENTOS', 'No todo lo bonito cabe en una caja', 'FELIZ NAVIDAD 🎄', 'HECHO CON AMOR', 'Preparado con tiempo, guardado con amor', 'Esta Navidad, soy', 'La que te compartí con cariño', '>Hermana<', '>Novia<']) assert.ok(!pagina.includes(frase));
console.log('OK: 5 cartas; 5 claves correctas; rechazo de claves erróneas y cruzadas; autenticidad AES-GCM; salts e IV únicos; foto y Unicode; textos actualizados; archivos públicos sin originales; sintaxis JS y modo de prueba desactivado.');

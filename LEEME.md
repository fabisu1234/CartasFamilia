# Un regalo de Navidad 🎄

Sitio estático en español de Chile. HTML, CSS y JavaScript, sin compilación, frameworks ni backend. La única conexión externa del sitio son las fuentes de Google; si no cargan, usa las fuentes de respaldo. La herramienta de cifrado no carga fuentes externas.

## Pruébalo ahora

Abre `index.html` en Chrome o Edge actualizado. Si tu navegador no permite Web Crypto desde `file://`, abre una terminal en esta carpeta y ejecuta:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Visita `http://localhost:8080`. El servidor es solo para desarrollo, no es un backend del sitio. Deténlo con Ctrl+C al terminar. En GitHub Pages se utiliza HTTPS y no hace falta instalar nada.

Las cinco cartas entregadas ya están cifradas. Son ejemplos marcados como tales:

| Categoría | Contraseña de ejemplo |
| --- | --- |
| Papá | `cambiar-esta-clave-papa` |
| Mamá | `cambiar-esta-clave-mama` |
| Mana | `cambiar-esta-clave-hermana` |
| Marti ♡ | `cambiar-esta-clave-novia` |
| Benja | `cambiar-esta-clave-benja` |

`?rapido=1` no cambia nada con la configuración entregada. Para probar sin sobre ni escritura, cambia temporalmente `MODO_PRUEBA = true` en `config.js` y visita `http://localhost:8080/?rapido=1`. Siempre tendrás que ingresar la contraseña correcta. Devuelve `MODO_PRUEBA` a `false` antes de compartir.

## Prepara tus cartas y fotos

1. Abre **`contenido-original.js`** en un editor. Reemplaza los nombres, los cinco textos, los pies de foto y `[MI NOMBRE / apodo]`. Quita los avisos de ejemplo. Mantén las claves `papa`, `mama`, `hermana`, `novia`, `benja` y los seis campos de cada carta.
2. Conserva las comillas dobles y las comas. Para párrafos escribe `\n\n` dentro del texto. Si usas una comilla doble dentro de una frase, escríbela como `\"`. La herramienta acepta este objeto como JSON y no ejecuta el archivo.
3. Pon una **contraseña larga, única y difícil de adivinar para cada persona**. Por ejemplo, varias palabras aleatorias; no nombres, fechas, apodos ni frases famosas. No publiques las contraseñas ni las incluyas en la URL.
4. Guarda las fotos en **`img/`** y escribe rutas como `"foto": "img/papa.jpg"`. Deja `"foto": ""` para una carta sin foto. Escribe un pie descriptivo: también se usa como texto alternativo. Formatos admitidos: JPG, PNG, WebP o GIF; se utiliza una imagen estática. Convierte HEIC a JPG antes.
5. Abre **`herramientas/cifrar.html`** en el navegador (o `http://localhost:8080/herramientas/cifrar.html`). Selecciona `contenido-original.js` o pega su contenido. Selecciona la carpeta `img` cuando haya rutas de fotos, o elige las fotos individualmente. El navegador no puede leer una ruta local sin tu selección explícita.
6. Presiona **Cifrar mis cinco cartas** y después **Descargar contenido-cifrado.js**. Reemplaza el archivo anterior de la raíz; conserva el nombre exacto, sin sufijos como `(1)`. Cada ejecución genera un salt y un IV nuevos para cada carta. Las fotos se redimensionan, se vuelven a codificar como JPEG y se cifran dentro de su carta: no hay archivos de foto públicos.
7. Prueba las cinco categorías, las fotos y el cierre de sesión. Usa temporalmente el modo rápido para revisar, y después prueba al menos una animación normal. Cada nueva edición cifrada vuelve a mostrar la animación al leerla por primera vez. Al terminar, pulsa **Limpiar datos** en la herramienta y ciérrala.

## Publicar en GitHub Pages

El paquete **`navidad-github-pages.zip`** contiene únicamente los seis archivos públicos de la entrega de ejemplo. **Después de personalizar, reemplaza también su `contenido-cifrado.js` o prepara una carpeta pública nueva**: el ZIP entregado no se actualiza solo.

1. Crea un repositorio y sube a su raíz únicamente:

   ```text
   index.html
   style.css
   script.js
   nieve.js
   config.js
   contenido-cifrado.js
   ```

2. En la configuración de GitHub Pages, selecciona publicar desde la rama donde subiste los archivos y desde la raíz. La ubicación y el nombre exacto de estos controles pueden variar. Espera a que termine la publicación y usa el enlace HTTPS que GitHub te entregue.
3. Prueba ese enlace en un celular: una clave incorrecta, las cinco claves correctas, las fotos y **Cerrar sesión**. Después de recargar debe pedir la clave otra vez. Tras tres errores consecutivos verás esperas de 2, 4, 8… segundos, hasta un máximo de 60 s.
4. Confirma que `MODO_PRUEBA` esté en `false`. Comparte el enlace por WhatsApp y entrega cada clave por separado. La vista previa usa un título y descripción genéricos.

**Nunca subas** `contenido-original.js`, `img/`, copias de las cartas ni contraseñas. `.gitignore` excluye originales e imágenes cuando usas Git; **no protege arrastres manuales a GitHub** ni archivos que ya estuvieran versionados. Si subiste originales por error, quitarlos del último commit no los elimina del historial: considera ese contenido expuesto y cambia las contraseñas. No uses el servidor local como hosting público: su carpeta contiene tus originales.

## Personalizar el aspecto y el comportamiento

| Cambio | Dónde |
| --- | --- |
| Rojo, verde, dorado, crema y fondo | Variables al principio de `style.css`: `--rojo`, `--pino`, `--oro`, `--crema`, `--noche`. El degradado del fondo está en `body`. |
| Mensajes de error y espera | Objeto `TEXTOS` en `config.js`. |
| Títulos, instrucciones y etiquetas del acceso | `index.html`. |
| Velocidad de escritura | `VELOCIDAD_ESCRITURA` en `config.js`, en milisegundos (32 por defecto). Hay pausas adicionales en puntuación y saltos. |
| Foto antes o después del texto | `FOTO_AL_FINAL` en `config.js`. |
| Modo de prueba | `MODO_PRUEBA` y la URL con `?rapido=1`. |
| Fuentes | Enlace Google Fonts de `index.html` y variables `--serif`, `--mano`, `--sans` de `style.css`. |
| Partículas y objetos navideños | `nieve.js`. La nieve se reproduce automáticamente y respeta el movimiento reducido. |

Se respeta la preferencia de movimiento reducido del dispositivo: sin nieve, sobre, escritura ni brillo. Las animaciones se detienen en pestañas ocultas. La escritura sigue automáticamente el texto hasta que la persona desplaza hacia arriba. **Saltar animación** muestra la carta completa; después se puede volver a leer con animación. Solo se recuerda en `localStorage` que terminó una lectura (categoría, salt y el valor `1`), con acceso dentro de `try/catch`. No se guarda contenido ni contraseña. Si el almacenamiento está bloqueado, el sitio sigue funcionando.

## Qué protege el cifrado

Cada carta y su foto están en un bloque AES-GCM de 256 bits. PBKDF2 con SHA-256 y 310.000 iteraciones deriva su clave de la contraseña, con un salt aleatorio único de 16 bytes y un IV aleatorio de 12 bytes. AES-GCM detecta también modificaciones al contenido. No se almacena ninguna contraseña ni hash verificador. Solo se descifra la categoría elegida y solo entonces se construye su contenido en el DOM.

Quien descargue el sitio verá los bloques cifrados y **puede intentar adivinar las claves sin conexión**. Las esperas de la interfaz no impiden esos ataques. Una contraseña larga e impredecible es la principal protección. `noindex` y los metadatos neutros ayudan a mantener la sorpresa, pero no son controles de acceso.

Una persona que conoce la clave puede copiar, fotografiar o compartir su carta. Un equipo comprometido o una versión maliciosa del sitio puede capturar la clave; protege tu cuenta de GitHub. Al cerrar sesión se retiran del DOM el texto y las imágenes y se eliminan referencias y temporizadores; JavaScript no permite garantizar el borrado físico inmediato de cadenas de la RAM. No uses este regalo para secretos de alto riesgo. Google puede recibir datos de conexión al cargar las fuentes; puedes quitar sus enlaces para usar únicamente fuentes locales de respaldo.

## Estructura de la entrega

```text
NavidadParaTodos/
├── index.html
├── style.css
├── script.js
├── nieve.js
├── config.js
├── contenido-cifrado.js      ← único contenido que se publica
├── contenido-original.js    ← privado, solo local
├── .gitignore
├── LEEME.md
├── navidad-github-pages.zip ← copia pública inicial, sin originales
├── herramientas/
│   └── cifrar.html
└── img/                     ← privado, solo local
    └── LEEME.txt
```

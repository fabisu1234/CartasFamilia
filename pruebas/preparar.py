"""Utilidades de entrega: CSS legible, foto sintética de prueba y ZIP público."""
from pathlib import Path
import random
import struct
import sys
import zipfile
import zlib

raiz = Path(__file__).resolve().parent.parent

if '--formato' in sys.argv:
    archivo = raiz / 'style.css'
    fuente = archivo.read_text(encoding='utf-8')
    lineas, linea, nivel, parentesis = [], '', 0, 0
    comilla, escape, comentario = '', False, False
    i = 0
    def emitir():
        global linea
        if linea.strip():
            lineas.append('  ' * nivel + linea.strip())
        linea = ''
    while i < len(fuente):
        c = fuente[i]
        if comentario:
            linea += c
            if fuente[i:i+2] == '*/':
                linea += '/'; i += 1; comentario = False; emitir()
        elif comilla:
            linea += c
            if escape: escape = False
            elif c == '\\': escape = True
            elif c == comilla: comilla = ''
        elif fuente[i:i+2] == '/*':
            emitir(); linea = '/*'; i += 1; comentario = True
        elif c in ('"', "'"):
            comilla = c; linea += c
        elif c == '(':
            parentesis += 1; linea += c
        elif c == ')':
            parentesis -= 1; linea += c
        elif parentesis == 0 and c == '{':
            linea += ' {'; emitir(); nivel += 1
        elif parentesis == 0 and c == '}':
            emitir(); nivel -= 1; linea = '}'; emitir()
        elif parentesis == 0 and c == ';':
            linea += c; emitir()
        elif c in '\n\r\t':
            linea += ' '
        else:
            linea += c
        i += 1
    emitir()
    archivo.write_text('/* Estilos del regalo: paleta, acceso, carta, paisaje y adaptación móvil. */\n' + '\n'.join(lineas) + '\n', encoding='utf-8')

if '--foto' in sys.argv:
    # PNG RGB con ruido determinista para probar compresión y redimensionado.
    ancho, alto = 1800, 1200
    azar = random.Random(2026)
    filas = b''.join(b'\0' + azar.randbytes(ancho * 3) for _ in range(alto))
    def bloque(tipo, contenido):
        return struct.pack('>I', len(contenido)) + tipo + contenido + struct.pack('>I', zlib.crc32(tipo + contenido) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n' + bloque(b'IHDR', struct.pack('>IIBBBBB', ancho, alto, 8, 2, 0, 0, 0)) + bloque(b'IDAT', zlib.compress(filas)) + bloque(b'IEND', b'')
    (raiz / 'pruebas' / 'foto-prueba.png').write_bytes(png)

if '--zip' in sys.argv:
    publicos = ['index.html', 'style.css', 'script.js', 'nieve.js', 'config.js', 'contenido-cifrado.js']
    destino = raiz / 'navidad-github-pages.zip'
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as archivo:
        for nombre in publicos:
            archivo.write(raiz / nombre, nombre)
    with zipfile.ZipFile(destino) as archivo:
        assert set(archivo.namelist()) == set(publicos)
        assert archivo.testzip() is None
    print(f'ZIP verificado: {len(publicos)} archivos públicos, {destino.stat().st_size:,} bytes.')
    completos = publicos + ['contenido-original.js', '.gitignore', 'LEEME.md', 'herramientas/cifrar.html', 'img/LEEME.txt']
    completo = raiz / 'navidad-proyecto-completo.zip'
    with zipfile.ZipFile(completo, 'w', zipfile.ZIP_DEFLATED) as archivo:
        for nombre in completos:
            archivo.write(raiz / nombre, nombre)
    with zipfile.ZipFile(completo) as archivo:
        assert set(archivo.namelist()) == set(completos)
        assert archivo.testzip() is None
    print(f'Proyecto completo verificado: {len(completos)} archivos. Incluye originales privados; no publicar este ZIP.')

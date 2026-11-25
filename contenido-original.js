// SOLO LOCAL. No subas este archivo ni la carpeta img a GitHub.
// Conserva las comillas dobles: la herramienta lee los datos sin ejecutar código.
// Separa párrafos con \n\n. Las fotos son rutas relativas, por ejemplo img/papa.jpg.
const CONTENIDO_ORIGINAL = {
  "papa": {
    "titulo": "Para ti, [NOMBRE DE MI PAPÁ]",
    "texto": "[CARTA DE EJEMPLO — reemplaza estas palabras por las tuyas]\n\nPapá:\n\nEsta Navidad quiero darte algo que no necesita envoltorio: un gracias. Por estar, por enseñarme a seguir intentando y por esas maneras tuyas de cuidar que a veces dicen más que mil palabras.\n\nCuando pienso en casa, también pienso en los momentos sencillos que hemos compartido. Aquí quiero escribir uno de nuestros recuerdos: [AGREGA UN RECUERDO CON TU PAPÁ].\n\nOjalá esta Navidad nos regale tiempo para conversar sin apuro, reírnos y crear nuevos recuerdos. Te quiero mucho, aunque a veces me cueste decirlo.\n\nFeliz Navidad, papá. Gracias por caminar conmigo. 🎄",
    "foto": "",
    "pieFoto": "[Un recuerdo contigo]",
    "firma": "Con cariño, tu hijo",
    "contrasena": "cambiar-esta-clave-papa"
  },
  "mama": {
    "titulo": "Para ti, [NOMBRE DE MI MAMÁ]",
    "texto": "[CARTA DE EJEMPLO — reemplaza estas palabras por las tuyas]\n\nMamá:\n\nSi pudiera guardar el cariño en un lugar, se parecería a uno de tus abrazos. Esta carta es una forma chiquitita de devolverte un poco de todo lo que me has dado.\n\nGracias por escucharme, por preocuparte y por hacer de lo cotidiano algo especial. Me gustaría dejar aquí ese momento nuestro que siempre me hace sonreír: [AGREGA UN RECUERDO CON TU MAMÁ].\n\nEsta Navidad deseo que también te sientas cuidada, que descanses y que recibas mucho del amor que regalas. Me hace feliz tenerte en mi vida.\n\nTe quiero, mamá. Ojalá nunca te falten motivos para sonreír. ✨",
    "foto": "",
    "pieFoto": "[Donde siempre me siento en casa]",
    "firma": "Un abrazo enorme, tu hijo",
    "contrasena": "cambiar-esta-clave-mama"
  },
  "hermana": {
    "titulo": "Para ti, Mana",
    "texto": "[CARTA DE EJEMPLO — reemplaza estas palabras por las tuyas]\n\nHermanita:\n\nNos ha tocado compartir tantas cosas: historias, risas y alguna que otra discusión que ahora da risa. Qué suerte tener a alguien que entiende tantos capítulos de mi vida sin tener que explicárselos.\n\nEsta parte de la carta merece una de nuestras historias favoritas: [AGREGA UNA ANÉCDOTA CON TU HERMANA]. Sí, esa que solo a nosotros nos da tanta risa.\n\nQuiero que sepas que estoy de tu lado y que me encanta verte encontrar tu propio camino. Ojalá este año te traiga aventuras bonitas y personas que te quieran bien.\n\nFeliz Navidad. Te quiero mucho, incluso cuando te robo la última galleta. 🍪",
    "foto": "",
    "pieFoto": "[Cómplices desde siempre]",
    "firma": "Tu cómplice, tu hermano favorito",
    "contrasena": "cambiar-esta-clave-hermana"
  },
  "novia": {
    "titulo": "Para ti, Marti ♡",
    "texto": "[CARTA DE EJEMPLO — reemplaza estas palabras por las tuyas]\n\nMi amor:\n\nEntre todas las cosas bonitas que quiero celebrar esta Navidad, estás tú. Me gusta la vida que vamos compartiendo, incluso en esos días comunes que contigo se vuelven mis favoritos.\n\nHay un recuerdo que quiero dejar guardado en esta carta: [AGREGA UN MOMENTO ESPECIAL CON TU NOVIA]. Cada vez que lo pienso, vuelvo a sonreír.\n\nGracias por tu compañía, por las conversaciones que se alargan y por dejarme conocerte un poquito más cada día. Me ilusiona pensar en todo lo que todavía podemos descubrir juntos.\n\nEsta Navidad, mi deseo es seguir encontrando momentos para elegirnos y cuidarnos. Te amo. Qué bonito coincidir contigo. 🤍",
    "foto": "",
    "pieFoto": "[Mi lugar favorito es contigo]",
    "firma": "Con todo mi amor, tu pololo",
    "contrasena": "cambiar-esta-clave-novia"
  },
  "benja": {
    "titulo": "Para ti, Benja",
    "texto": "[CARTA DE EJEMPLO — reemplaza estas palabras por las tuyas]\n\nBenja:\n\nEsta Navidad quería regalarte unas palabras para agradecerte la amistad. Por las risas, las conversaciones y esos momentos en que estar acompañado hace que todo se sienta un poco más liviano.\n\nAquí quiero guardar una de nuestras historias: [AGREGA UN RECUERDO CON BENJA]. De esas que basta mencionar para volver a reírnos.\n\nAunque a veces estemos lejos o cada uno ande en sus cosas, me alegra saber que cuento contigo. Ojalá sigamos sumando aventuras, buenos ratos y muchas historias que contar.\n\nFeliz Navidad, amigo. Te quiero mucho. Gracias por estar. 🎄",
    "foto": "",
    "pieFoto": "[Una buena historia contigo]",
    "firma": "Un abrazo, tu amigo",
    "contrasena": "cambiar-esta-clave-benja"
  }
};

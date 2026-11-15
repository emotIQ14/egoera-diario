/*RIESGO:inicio*/
/* ───────── DETECTOR DE RIESGO · UNA SOLA COPIA ─────────
   Fuente única: sistema/riesgo/deteccion-riesgo.js. La home y el hub de la biblioteca lo INCRUSTAN byte a byte al construir (home/construir.py, biblioteca/construir.py)
   y un test (sistema/riesgo/tests.py) compara cada incrustación con este archivo. No se edita nada en las páginas: se edita aquí y se reconstruye.
   Es una RED DE FORMAS, no comprensión: reconoce frases que se parecen a las que conocemos y deja pasar las que no prevé. Lo que no cubra lo cubre la línea fija
   «¿Estás pasando muy mal? 024 · 112» que el buscador lleva siempre debajo del campo. Lo que se escribe NO sale de la página.
   Cómo funciona: el texto se normaliza (minúsculas, sin tildes ni diéresis, ñ→n, sin signos, letras repetidas →1, «kiero»→«quiero», «boy a»→«voy a») y se busca con
   la bandera u, un grupo delante ((?:^|[^\p{L}\p{N}])) y un lookahead Unicode (?![\p{L}\p{N}]). SIN lookbehind (Safari anterior a 16.4 no lo entiende) y JAMÁS con
   la palabra-límite de JS, que solo ve ASCII. Las excepciones (lo benigno) son listas pequeñas y explícitas: «me corto el pelo», «me muero de risa»,
   «acabar con todo el trabajo»… Sin la bandera u, una versión ASCII sobre el texto ya normalizado.
   Euskera y catalán: primer conjunto, NO REVISADO por hablantes nativos. */
var norma=function(s){
  var x=String(s).toLowerCase();
  try{ x=x.normalize('NFD') }catch(e){}
  x=x.replace(/[̀-ͯ]/g,'');
  try{ x=x.replace(new RegExp('[^\\p{L}\\p{N}]+','gu'),' ') }catch(e){ x=x.replace(/[^a-z0-9]+/g,' ') }
  return x.replace(/([a-z])\1{2,}/g,'$1').replace(/(^| )kier/g,'$1quier').replace(/(^| )ke /g,'$1que ').replace(/(^| )boy a /g,'$1voy a ').replace(/(^| )bida(?![a-z])/g,'$1vida').replace(/(^| )bivir(?![a-z])/g,'$1vivir').replace(/^ +| +$/g,'');
};
/* marcos de «voy a / quiero / pienso en / he pensado en…» delante de un infinitivo */
var FR='(?:voy a |quiero |quisiera |querria |pienso |pienso en |podria |deberia |puedo |necesito |tengo que |iba a |ire a |he pensado en |estoy pensando en |pensando en |ganas de |tengo ganas de |me gustaria |intento |intente |he intentado |vuelvo a |he vuelto a |he decidido |decidi |estoy a punto de |a punto de |voy a intentar |lo mejor es |lo mejor seria |quise |queria |pense en |pensaba en )';
var V='(?:'+FR.slice(3,-1)+')?';
var NO=function(){return '(?! (?:'+[].slice.call(arguments).join('|')+')(?![a-z]))'};
var B_DANO=NO('al (?:correr|andar|caminar|jugar|entrenar|levantar|hacer|subir|bajar|saltar|moverme|girar|agacharme|estirar)','jugando','corriendo','entrenando','haciendo (?:deporte|ejercicio|pesas|yoga)','de tanto','sin querer','sin darme cuenta','practicando','levantando','cuando (?:corro|juego|entreno|salgo|hago|me levanto|me agacho)','en (?:la|el|mi) (?:rodilla|espalda|pie|tobillo|dedo|cuello|hombro|codo|mano|cadera|cabeza|tendon|musculo|lumbar)','en (?:los|las|mis) (?:pies|rodillas|dedos|tobillos|talones)','con (?:estos|estas|los|las|unos|unas|el|la) (?:zapatos|botas|tacones|zapatillas|sandalias|calcetines|gafas|lentillas|auriculares|cinturon)');
var B_CORTA='(?! (?:(?:(?:el|la|las|los|mi|mis|un|unas|unos|todo el|todas las|toda la) )?(?:pelo|pelos|cabello|unas|barba|flequillo|melena|bigote|puntas|rollo|royo|leche|luz|agua|internet|wifi|conexion|llamada|gas|palabra|ritmo|linea|suministro|grifo|digestion|camino|paso|corriente|trozo|trozos|tarta|pizza|pan|queso|verdura|carne|fruta|cebolla|tomate|papel|tela|hoja|cuerda|cable|tarjeta|cinta)(?![a-z])|con (?:el|un|una|la|los|las) (?:papel|hoja|folio|cristal|vidrio|lata|tapa|borde|bordes|esquina|canto)(?![a-z])|con (?:mi|tu|su|el|la) (?:pareja|novio|novia|ex|marido|mujer|chico|chica|amigo|amiga)(?![a-z])|con (?:el|un|una|la) (?:cuchillo|cuchilla|tijeras|navaja|sierra) (?:al|mientras|cuando|cocinando|pelando)(?![a-z])|al (?:afeitar|afeitarme|cocinar|pelar|abrir|cortar|picar)(?![a-z])|afeitandome|cocinando|pelando))';
var B_MATARIA=NO('el','la','los','las','mi','mis','su','sus','mama','papa','madre','padre','jefe','jefa','profe','profesor','profesora','novio','novia','pareja','marido','mujer','esposa','abuela','abuelo','hermano','hermana','tio','tia','entrenador','vecino');
var B_MATO=NO('a','de','en','por');
var B_MORIR=NO('de (?:exito|felicidad|placer|ternura|risa|verguenza|ganas|sueno|hambre|miedo|frio|calor|envidia|amor|pena|aburrimiento|cansancio|curiosidad|celos|gusto|rabia|asco|sed|nervios|lo bueno|lo mono)');
var B_VIVIR=NO('como','para(?= (?!siempre))','en','con','solo','sola','lejos','cerca','de alquiler','de ayudas','donde','alli','alla','sin','aqui en','tan lejos','mas cerca');
var B_TODO=NO('el','la','lo','los','las','este','esta','esos','esas','ese','esa','con','que','del','de la','de los','de las','antes','para','mi trabajo','mis deberes','y con','esto (?:antes|para|en|hoy|manana|cuanto|de|con|el|la|y)');
var B_DES=NO('(?:(?:del?|de la|de las|de los|de mi|de tu|de un|de una) )?(?:grupo|grupos|chat|chats|whatsapp|instagram|facebook|tiktok|internet|redes|oficina|trabajo|clase|clases|reunion|reuniones|fiesta|fiestas|foto|fotos|equipo|colegio|universidad|empresa|mapa|pantalla|cena|cenas|comida|comidas|boda|bodas|evento|eventos)','un (?:fin de semana|rato|dia|tiempo|mes|par de dias|ratito)','unos (?:dias|meses)','una (?:semana|temporada|tarde)','de vacaciones','de viaje');
var B_DESP=NO('temprano','pronto','tarde','a las','por','con','mas tarde','hoy','tan','antes');
var B_SOBRE=NO('de (?:trabajo|azucar|cafe|informacion|series|redes|estres|noticias|pantallas|cafeina|dulce|ruido|vitaminas?|realidad|ejercicio|emociones)');
var B_IR=NO('(?:de|a) (?:esta ciudad|aqui|este pueblo|casa|mi pais|espana|bilbao|vivir|otro pais|trabajar)');
var B_SENTIDO=NO('sin (?:ti|ella|el|musica|cafe|mi|ellos|vosotros|nada)','si no','sin','a este','a esta','a ese','a esa','a esto','a eso','a lo que','a la reunion','a las reuniones','al ejercicio','a la tarea','al trabajo','a mi trabajo','a estos','a estas','a los','a las');
var DEST='(?:de|desde|por|del|al|a la|a las|a los|bajo|contra|hacia|delante de) (?:un |una |el |la |las |los |mi |ese |esa |este |esta )?(?:(?:decimo|octavo|noveno|septimo|sexto|quinto|cuarto|tercer|segundo|primer|ultimo|undecimo|duodecimo|[0-9]+o) )?(?:puente|puentes|ventana|balcon|azotea|tejado|terraza|acantilado|via|vias|vacio|tren|trenes|metro|coche|coches|camion|camiones|autobus|torre|edificio|piso|cornisa|altura|precipicio|abismo)(?![a-z])';
var PILL='(?:pastillas|pildoras|medicinas|medicamentos|tranquilizantes|somniferos|calmantes|ansioliticos|pastis|comprimidos)';
var CANT='(?:un blister entero de|una caja entera de|un bote entero de|un frasco entero de|medio bote de|un blister entero|todas|todos|muchas|muchos|un monton de|un bote de|un frasco de|un blister de|una caja de|un punado de|el bote de|el frasco de|la caja de|el blister de|demasiadas|demasiados)';
var FRASES=[
  /* raíces: suicidio, autolesión */
  'suicid[a-z]*','suizid[a-z]*','autolesi[a-z]*','autoagred[a-z]*','autoagres[a-z]*','auto lesi[a-z]*','autolisis',
  /* matarse */
  'matar(?:me|se)'+B_MATO,'me '+V+'matar(?![a-z])'+B_MATO,'me mato'+B_MATO,'me matare','me mataria'+B_MATARIA,'se (?:va a |quiere |quiso |ha querido |ha intentado |intento |intenta )matar(?![a-z])',
  'me he (?:intentado )?matado(?![a-z])'+NO('a','de','en','por'),
  /* quitarse la vida */
  'quit(?:ar|are|aria|ara|ase)(?:me|se) la vida','(?:me|se) '+V+'quit(?:ar|o|are|aria) la vida',
  '(?:me|se) '+V+'quit(?:ar|o|are|aria) (?:de en medio|del medio|de enmedio|del mapa)'+NO('para','cuando','si','que','un','una','un rato'),'quit(?:ar|are|aria)(?:me|se) (?:de en medio|del medio|de enmedio|del mapa)'+NO('para','cuando','si','que','un','una'),
  /* morirse */
  'morirme'+B_MORIR,'(?:quiero|quisiera|querria|prefiero|preferiria|deseo|desearia|necesito|me gustaria|ganas de|pienso en|pensando en|pensado en|mejor|sueno con|suenas con|soy capaz de) morir(?!me)(?![a-z])'+B_MORIR,
  'sueno con (?:morir|morirme|estar muert[oa]|no despertar)(?![a-z])','mejor me (?:muero|muera|muriera|muriese|moria|morire)(?![a-z])'+B_MORIR,'(?:me )?(?:voy a|quiero|ojala) morir(?:me)?(?![a-z])'+B_MORIR,
  'ojala (?:me muera|me muriera|me muriese|estuviera muert[oa]|estuviese muert[oa])','(?:quiero|quisiera|querria|prefiero|preferiria|deseo|desearia|me gustaria|mejor) (?:estar )?muert[oa](?![a-z])',
  'morir (?:sin dolor|dormid[oa]|rapido|rapidamente)','(?:como|formas de|maneras de|metodos para|metodos de|modos de) (?:morir|morirse|morirme)(?![a-z])',
  'pensamientos de (?:muerte|morir|morirme|suicidio)','ideas de (?:muerte|morir|morirme)',
  /* no quiero vivir / no tiene sentido */
  'no (?:quiero|quisiera|querria|deseo) (?:seguir |continuar |estar |ser |tener que )?(?:mas )?(?:vivo|viva|vivir|viviendo|existir|en este mundo)(?![a-z])'+B_VIVIR,
  'no (?:quiero|quisiera|querria) (?:estar|seguir|vivir|existir) mas en este mundo(?![a-z])',
  'no (?:quiero|quisiera|querria) (?:seguir |estar |continuar )aqui(?![a-z])'+NO('en (?:esta|este|esa|ese|la|el|una|un|mi|casa|clase)','con (?:ellos|ellas|esta gente|esos)'),'no (?:me )?(?:quiero|quisiera|querria|deseo) (?:seguir |volver a )?despertar(?:me)?(?![a-z])'+B_DESP,
  'no quiero seguir adelante(?! (?:con|en))','no (?:puedo|podre|podria) seguir (?:viviendo|vivir)(?![a-z])'+B_VIVIR,
  '(?:quiero|quisiera|querria|ganas de|prefiero|necesito) dejar de (?:existir|vivir)(?![a-z])'+B_VIVIR,'dejar de existir(?![a-z])'+B_VIVIR,'ya no quiero (?:estar|seguir) (?:aqui|en este mundo)(?![a-z])',
  '(?:querria|quisiera|quiero|ojala|me gustaria|desearia|preferiria|hubiera preferido|hubiese preferido|habria preferido) (?:que )?(?:yo )?no (?:nacer|existir|haber existido|existiera|existiese|estar vivo|estar viva|haber nacido|hubiera nacido|hubiese nacido|estar aqui|estuviera aqui|estuviera vivo|estuviera viva|estuviese vivo|estuviese viva|estar en este mundo|estuviera en este mundo)(?![a-z])',
  '(?:preferiria|querria|quisiera|ojala) no estar$','(?:no|nunca) (?:deberia|debi|debia) (?:haber )?(?:nacer|nacido|existir|estar vivo|estar viva|estar aqui)(?![a-z])'+NO('tanto','tanta','tantos','tantas','este','esta','ese','esa','el','la','los','las','un','una','ningun','ninguna','que','tan'),
  '(?:mejor|lo mejor (?:seria|es|era)) (?:no haber (?:nacido|existido)|no existir|no estar (?:aqui|vivo|viva|en este mundo)|estar muert[oa]|no despertar|desaparecer|morir|morirme)(?![a-z])',
  'no merezco (?:vivir|seguir vivo|seguir viva|estar vivo|estar viva|existir|estar aqui|seguir viviendo|la vida|seguir adelante|seguir con vida|tener vida)',
  'no (?:vale|merece) la pena (?:ya )?(?:seguir )?(?:vivir|viviendo|adelante|la vida|existir|estar vivo|estar viva)','la vida (?:ya )?no (?:vale|merece) la pena'+NO('sin','si','cuando','con','por','de','en','para'),
  'no (?:vale|merece) la pena (?:ya )?(?:seguir|continuar)(?:$| (?:asi|mas|luchando|aqui|adelante|viviendo)(?![a-z])| y (?:no|ya|me)(?![a-z]))',
  'prefiero (?:la muerte|morir|estar muert[oa])(?![a-z])'+B_MORIR,
  '(?:mi|esta|la) vida no tiene sentido'+B_SENTIDO,'mi vida no vale (?:nada|la pena)','no tiene sentido (?:seguir )?(?:vivir|viviendo|la vida|mi vida)','no tiene sentido que (?:siga|sigo|continue|continuo) (?:vivo|viva|aqui|viviendo|con vida)',
  'no (?:le )?(?:veo|encuentro) (?:ya )?(?:ningun |el )?sentido (?:a |en )?(?:la vida|vivir|seguir|mi vida|nada)','para que (?:seguir )?(?:viviendo|vivir)','para que seguir(?: adelante| asi| luchando|$)',
  'no (?:tengo|hay|veo|encuentro) (?:ninguna |ningun |mucha |muchas |mas )?(?:razon|motivo|razones|motivos|ganas|fuerzas) (?:de |para )(?:vivir|seguir viviendo|seguir adelante|seguir vivo|seguir viva)(?![a-z])',
  '(?:he perdido|perdi|se me (?:han )?(?:quitado|ido|acabado|pasado)|ya no me quedan|no me quedan) (?:las |todas las |las pocas )?(?:ganas|fuerzas) (?:de |para )(?:vivir|seguir viviendo|seguir adelante)(?![a-z])',
  'no (?:puedo|quiero|podre|podria) (?:seguir|continuar) con vida(?![a-z])',
  'no (?:le |la )?veo (?:ninguna )?salida(?! (?:de|del|a la|al))','(?:harto|harta|cansado|cansada|agotado|agotada) de (?:vivir|la vida|estar vivo|estar viva|seguir viviendo|existir)(?![a-z])'+B_VIVIR,
  'no (?:hay|tengo|veo|encuentro|existe) (?:ya )?(?:ninguna )?salida(?:$| (?:y|ya|a esto|a mi situacion|a esta situacion|a nada|alguna|posible|para mi|ninguna)(?![a-z]))',
  '(?:me )?cuesta (?:cada dia )?(?:mas )?seguir (?:vivo|viva|viviendo|adelante)(?![a-z])','harto de todo y de todos','harta de todo y de todos',
  'no (?:puedo|aguanto|soporto) (?:mas )?(?:con )?(?:la|mi|esta|toda) vida','no (?:soporto|aguanto|puedo) (?:mas )?(?:vivir|seguir viviendo|estar vivo|estar viva|existir)(?![a-z])'+B_VIVIR,

  'no aguanto mas(?:$| (?:y|ya|asi|esto|esta vida|la vida|mi vida|mi situacion|mi dolor|el dolor|este dolor|tanto dolor|sufrir|vivir|esta situacion|mas|nada|quiero|me quiero|voy a|pienso)(?![a-z]))',
  'no (?:quiero|puedo|aguanto) seguir(?:$| (?:asi|mas|luchando|adelante|ni un dia mas)(?! (?:con|en|de|por|a|la|el|los|las)(?![a-z])))','y no (?:quiero|puedo) seguir$',
  /* acabar con todo */
  '(?:acabar|terminar|acabare|terminare|acabaria|terminaria|acabo|termino) con (?:mi vida|mis dias|mi existencia|mi sufrimiento|mi dolor|conmigo)','(?:acabar|terminar) con todo(?: esto)?(?![a-z])'+B_TODO,'(?:hoy|esta noche|ya|manana|ahora) (?:acabo|termino|acabare|terminare) con todo(?: esto)?(?![a-z])'+B_TODO,'poner(?:me|le|se)? fin a (?:mi vida|mis dias|mi sufrimiento)(?![a-z])','poner(?:me|le|se)? fin a todo(?![a-z])'+B_TODO,
  '(?:quiero|quisiera|querria|voy a|pienso en|estoy pensando en|pensando en|he pensado en|necesito|ganas de) (?:acabar|terminar)(?: ya| ahora| ya mismo| ya con esto| con esto| hoy| esta noche| de una vez| para siempre)?$',
  '(?:quiero|necesito|ojala|deseo|me gustaria) que (?:se )?(?:acabe|termine|acabara|terminara) mi vida(?![a-z])',
  '(?:acabar|terminar|poner fin|ponerle fin|librarme de|dejar de sufrir) (?:con |a )?(?:[a-z]+ ){0,4}(?:muriendome|matandome|quitandome la vida)(?![a-z])',
  '(?:quiero|necesito|ojala|deseo|me gustaria) que (?:todo|esto) (?:se )?(?:acabe|termine|pare|acabara|terminara|acabase|terminase)(?![a-z])'+NO('bien','pronto','rapido','manana','hoy','esta','este','la','el'),'(?:quiero|necesito|ojala|deseo|me gustaria) que (?:se )?(?:acabe|termine|acabara|terminara) todo(?![a-z])','y me muera(?![a-z])',
  '(?:solo )?(?:quiero|necesito|ojala|deseo) que (?:se )?(?:acabe|termine|pare|cese|desaparezca) (?:el|este|mi|tanto) (?:dolor|sufrimiento)(?! (?:de|en|del|muscular|fisico))(?![a-z])','que (?:el|este|mi) (?:dolor|sufrimiento) (?:termine|acabe|pare|cese) para siempre',
  /* hacerse daño */
  '(?:hacerme|hacerse|haciendome) dano'+B_DANO,'(?:hacerme|hacerse|haciendome) (?:cortes|heridas|quemaduras|cicatrices)','me (?:[a-z]+ ){1,5}hasta sangrar(?![a-z])','me (?:hago|hice|hacia|hare|haria|hiciera|haga|estoy haciendo|sigo haciendo|voy a hacer|quiero hacer|quise hacer|quisiera hacer|he hecho|he estado haciendo|vuelvo a hacer|he vuelto a hacer) dano'+B_DANO,
  'lastimarme','me lastimo','me estoy lastimando','herirme','me hiero','me (?:hago|hice|hacia|hare|estoy haciendo|sigo haciendo|vuelvo a hacer|he vuelto a hacer) (?:cortes|heridas|quemaduras|cicatrices)','me he (?:vuelto a )?(?:hecho|hacer) (?:cortes|heridas|quemaduras|cicatrices)','me '+V+'hacer (?:una |un |unas |unos )?(?:herida|heridas|corte|cortes|quemadura|quemaduras)'+NO('de (?:pelo|pelito|cabello|barba)'),
  'me quemo (?:a proposito|con (?:un |el |los |unos )?(?:cigarro|cigarros|cigarrillo|cigarrillos|mechero|mecheros|plancha|cerillas?)|la piel|los brazos|las piernas)',
  'me quem(?:e|o|are|aria|aba) (?:(?:el|la|los|las|mi|mis) )?(?:brazos?|piernas?|muslos?|munecas?|manos?|piel|dedos?)? ?(?:con (?:(?:un|el|los|unos) )?(?:cigarro|cigarros|cigarrillo|cigarrillos|mechero|mecheros)|a proposito)(?![a-z])',
  'me ara[a-z]* (?:hasta (?:sangrar|hacerme sangre)|los brazos|las piernas|las munecas)','me (?:[a-z]+ ){1,4}hasta (?:hacerme sangre|hacerme dano|que sangre)(?![a-z])','me (?:golpeo|golpeare|estoy golpeando) (?:la cabeza )?(?:contra (?:la pared|el suelo|el muro)|hasta (?:sangrar|hacerme dano))',
  /* cortarse */
  'me '+V+'cortar(?![a-z])'+B_CORTA,'me (?:cortaba|cortare|cortaria|corto|corte|cortando)(?![a-z])'+B_CORTA,'me (?:sigo|vuelvo a|estoy) cort(?:ar|ando)'+B_CORTA,'cort(?:arme|andome)(?![a-z])'+B_CORTA,
  '(?:cort(?:ar|o|are|aria)|abr(?:ir|o|ire|iria)|raj(?:ar|o|are|aria))(?:me|se)? (?:las |mis )?(?:venas|munecas)(?![a-z])','me '+V+'(?:cortar|abrir|rajar)(?:me)? (?:las |mis )?(?:venas|munecas)(?![a-z])',
  'me he (?:vuelto a )?(?:cortado|rajado|abierto) (?:las |los |mis )?(?:venas|munecas|brazos?|piernas?|muslos?|vientre|barriga)(?![a-z])','me he (?:vuelto a )?cortado (?:otra vez|de nuevo|a proposito|con (?:una|la) cuchilla|con (?:un|el) cutter|con (?:un )?cristal roto)(?![a-z])',
  'he vuelto a cortarme(?![a-z])'+B_CORTA,'cortes en (?:los|las|el|la|mis) (?:brazos?|piernas?|munecas?|muslos?|vientre|barriga)',
  'pensando en saltar$','estoy (?:en|sobre) (?:el|la|un|una) (?:balcon|puente|azotea|tejado|cornisa|ventana|terraza)(?: [a-z]+)? (?:pensando en|y pienso en|y quiero|y voy a|para) (?:saltar|tirarme|lanzarme|acabar)(?![a-z])',
  '(?:quiero|voy a|pienso en|me gustaria|ganas de|he pensado en) ahogarme(?![a-z])','me (?:quiero|voy a|pienso|podria) ahogar(?![a-z])','(?:voy a|quiero|pienso en) ahogarme en (?:el|la) (?:mar|rio|agua|lago|banera)',
  /* ahorcarse, colgarse, tirarse, armas, pastillas */
  'ahorc(?:arme|arse|andome|andose)','me '+V+'ahorcar(?![a-z])','me (?:ahorco|ahorcare|ahorcaria|ahorque)(?![a-z])','colg(?:arme|arse) (?:de|del|en|con) (?:un |una |el |la )?(?:arbol|techo|viga|cuerda|cable|cinturon|puente|soga|lampara|ventilador)(?![a-z])',
  'me '+V+'colgar(?:$| (?:hoy|ya|esta noche|manana|de verdad|ahora|asi|sin mas|y no|para siempre)(?![a-z]))','me (?:cuelgo|colgare|colgaria)(?:$| (?:hoy|ya|esta noche|manana|de verdad|ahora|y no|para siempre)(?![a-z]))','colgarme$',
  '(?:tir|lanz|arroj|precipit)(?:arme|arse|andome|andose) '+DEST,'me '+V+'(?:tirar|lanzar|arrojar|precipitar) '+DEST,'me (?:tiro|lanzo|arrojo|tirare|lanzare|arrojare|tiraria|lanzaria) '+DEST,
  'saltar(?:me)? (?:de|desde|por|del) (?:un |una |el |la )?(?:puente|ventana|balcon|azotea|tejado|terraza|acantilado|edificio|torre)(?![a-z])','me (?:salto|saltare|saltaria) (?:de|desde|por|del) (?:un |una |el |la )?(?:puente|ventana|balcon|azotea|tejado|terraza|acantilado|edificio|torre)(?![a-z])',
  '(?:me )?(?:voy a |quiero |pienso )?poner(?:me)? (?:delante|debajo|bajo) (?:del|de un|de los) (?:tren|metro|coche|camion|trenes)(?![a-z])','(?:me )?(?:voy a |quiero |pienso )?meter(?:me)? (?:el canon|la pistola|una pistola|el arma) en la boca',
  'subi(?:r|rme|do|a|e|me) (?:a|al|a la|a un|a una) (?:puente|azotea|tejado|cornisa|balcon|torre|edificio) (?:para |a )(?:tirarme|lanzarme|saltar|matarme|acabar)(?![a-z])','(?:para|a) (?:tirarme|lanzarme|arrojarme)$',
  'estoy (?:en|sobre|encima de|al borde de|subid[oa] (?:a|en)) (?:el|la|un|una) (?:puente|azotea|tejado|ventana|balcon|cornisa|acantilado|via|vias|terraza) y (?:no quiero|no puedo|voy a|quiero|me voy a)(?![a-z])',
  '(?:pegar|meter)(?:me|se) un (?:tiro|balazo|disparo)','me '+V+'(?:pegar|meter) un (?:tiro|balazo|disparo)','me (?:pego|meto|pegare|metere) un (?:tiro|balazo|disparo)','volar(?:me|se) (?:la cabeza|los sesos|la tapa)','me '+V+'volar la cabeza','me vuelo (?:la cabeza|los sesos)','dispararme','me (?:voy a|quiero|quisiera|podria|pienso) disparar',
  '(?:pienso|voy a|quiero) usar(?:la|lo) contra mi(?![a-z])',
  '(?:tom|beb|trag)(?:ar|are|aria)(?:me|se)? (?:me )?'+CANT+' ?(?:las |los |mis )?'+PILL,
  'me (?:he |voy a |quiero |pienso |podria )?(?:tomado|tomo|tomare|tomaria|tome|tragado|trago|bebido|bebo) '+CANT+' ?(?:las |los |mis )?'+PILL,
  '(?:he|ha) (?:tomado|tragado|ingerido|bebido) '+CANT+' ?(?:las |los |mis )?'+PILL,
  'me (?:he |voy a )?(?:tomado|tome|tomo|tragado|bebido) (?:1[0-9]|[2-9][0-9]|[0-9]{3}|diez|doce|quince|veinte|treinta|cuarenta|cincuenta|cien) '+PILL,
  'me (?:voy a |quiero |pienso )?pas(?:ar|o) de '+PILL,'me he pasado de '+PILL,
  'tengo (?:todas )?(?:las |mis )?'+PILL+' (?:delante|en la mano|preparadas|encima de la mesa|aqui) y (?:no se que hacer|no se si|voy a|quiero|no me atrevo)',
  'ingerir '+CANT+' ?(?:las |los |mis )?'+PILL,'pastillas para (?:morir|morirme|no despertar|dormir para siempre|suicidarse)','cuantas (?:pastillas|medicamentos|somniferos|calmantes|ansioliticos)(?: [a-z]+){0,6} para (?:morir|morirme|matarme|no despertar|no despertarme|dormir para siempre)(?![a-z])','sobredosis'+B_SOBRE,'overdose',
  'me (?:meto|voy a meter|adentro) en el (?:mar|rio|agua|lago) y no (?:salgo|vuelvo)',
  /* no despertar, desaparecer, irse, descansar, apagarse */
  '(?:ojala|quisiera|querria|quiero|ganas de|prefiero|deseo|desearia) (?:que )?(?:no|nunca) (?:me )?(?:volver a )?(?:despierte|despertar|despertara|despertase|despertarme|despierto|despertaria)(?![a-z])'+NO('tan','temprano','pronto','tarde','el','la','a','al','los','las','con','antes','hasta','por','de'),
  'cerrar los ojos y no (?:abrirlos|despertar|volver a abrirlos|volver a despertar)','si (?:yo )?no (?:hubiera|hubiese|habria) (?:nacido|existido)(?! (?:en|a|con|de|la|el))',
  '(?:ojala|desearia|quisiera|querria|quiero|me gustaria) (?:me )?(?:que )?(?:quedar(?:me|a|ia|e)?|quedase|quedara|quedarme) dormid[oa] (?:y no (?:volver a )?despert[a-z]*|para siempre)(?![a-z])','dormid[oa] y no (?:volver a )?despert[a-z]*(?![a-z])',
  'dorm(?:ir|irme|irse|ido|iendome)(?: y| para) (?:no (?:volver a )?despertar(?:me)?|siempre)(?![a-z])'+NO('en'),'no despertar(?:me)? (?:nunca|jamas|mas|manana)(?![a-z])',
  '(?:quiero|quisiera|querria|ganas de|me gustaria|necesito|prefiero|voy a|podria|ojala pudiera|ojala pudiese|tengo ganas de) desaparecer(?:me)?(?![a-z])'+B_DES,'desaparecer de (?:este mundo|todo|aqui|la faz de la tierra|la vida|el mundo)(?![a-z])','hacerme desaparecer(?![a-z])','desaparecer para siempre','^desaparecer(?:me)?$',
  '(?:quiero|quisiera|querria|necesito|ojala pudiera) irme (?:para siempre|de este mundo|de la vida)(?![a-z])'+B_IR,'(?:ir|irme|marcharme) de (?:este mundo|la vida)(?![a-z])','irme para siempre(?:$| de todo| y no volver)','ir(?:me)? (?:de aqui )?para siempre de todo','nadie me (?:echaria|va a echar|iba a echar) de menos','nadie me (?:extranaria|echara de menos)','nadie me (?:va a |iba a )(?:extranar|echar de menos)(?![a-z])','carta de despedida','dejar de sufrir para siempre',
  'descansar para siempre(?![a-z])'+NO('en'),'descansar (?:de la vida|eternamente)','(?:dejar|dejo) de sentir para siempre','(?:pudiera|pudiese|quiero|quisiera) apagarme(?:$| para siempre)','apagarme para siempre',
  '(?:ya )?me he despedido de todos(?:$| y (?:no|ya|me voy)(?![a-z]))','hoy es mi ultimo dia(?:$| (?:de vida|en este mundo|aqui|y no)(?![a-z]))',
  'no quiero ser (?:un problema|una carga|un estorbo|una molestia) para (?:nadie|nadie mas|los demas|mi familia)(?![a-z])','que (?:todo )?(?:se )?(?:acabe|termine|acabara|terminara) y no (?:sufrir|sentir)(?![a-z])',
  'ojala (?:me )?(?:atropell(?:e|ara|ase|en)|pille un (?:coche|camion|tren|autobus)|caiga un rayo|pase algo y me muera)(?![a-z])',
  '(?:pienso|pensando|he pensado|estoy pensando) en como hacerlo(?:$| sin| y)(?![a-z])','como hacerlo sin dolor',
  '(?:me )?(?:quiero |voy a |pienso )?rendir(?:me)? del todo','(?:me )?quiero rendir y no volver','(?:me )?rindo del todo',
  /* carga, sobrar, mejor sin mí */
  'estar(?:ian|ia|ias|an) mejor sin mi(?![a-z])','(?:serian|seria|estarian|estaria|vivirian|irian|iria|sera|iran)(?: todo| todos)? (?:mas felices|mas feliz|mejor|mas tranquil[oa]s?|mas facil) sin mi(?![a-z])','sin mi (?:el mundo|todo|todos|ellos|la gente|mi familia|mis hijos|mis padres) (?:seria|es|estaria|estarian|iria|irian|serian|vivirian) (?:mejor|mas feliz|mas felices|mas facil|mas tranquil[oa]s?)(?![a-z])','(?:todo|las cosas|la vida) (?:seria|sera|iria|estaria) (?:mas facil|mejor|mas feliz) sin mi(?![a-z])','(?:les|le|os) (?:iria|ira|seria|iba a ir) mejor sin mi(?![a-z])','dej(?:ame|enme) morir(?![a-z])','que me dejen morir(?![a-z])',
  'mejor sin mi(?:$| (?:y|ya|porque|que|todos|todo el mundo|siempre|de verdad|nadie|asi|cuando|si)(?![a-z]))',
  '(?:soy|me siento|me veo como|me noto|siento que soy|siento ser|creo que soy|me veo) (?:una |la )?carga(?:$| para (?:todos|todo el mundo|los demas|mi familia|mis padres|mis hijos|mis amigos|los mios|nadie|ellos|el mundo|quienes)(?![a-z])| y (?:un |una )?(?:estorbo|molestia|sobro)| y no)',
  'no soy mas que (?:una |un )?(?:carga|estorbo|molestia|problema)','solo soy (?:una |un )?(?:carga|estorbo|molestia)',
  '(?:yo )?sobro(?:$| (?:aqui|en este mundo|en el mundo|en todas partes|a todos|para todos)(?![a-z]))',
  '(?:seria|es) (?:mejor|mas facil) (?:si )?(?:no estuviera|no existiera|no estuviese|no estoy|desaparecer|que yo no|no estar|no existir|morir|morirme)','mejor si (?:yo )?(?:no estuviera|no estuviese|no existiera|no existiese|desapareciera|me muriera)(?![a-z])',
  'seria (?:mejor|mas facil) para (?:todos|todo el mundo|los demas|mi familia|ellos|vosotros|mis padres|mis hijos) (?:que|si) (?:yo )?(?:no estuviera|no existiera|desapareciera|me muriera|no estuviese|no existiese|no estoy)',
  '(?:seria|es) mas facil si (?:yo )?(?:no estuviera|no existiera|no estuviese|no existiese|desapareciera|me muriera)(?![a-z])',
  /* inglés, catalán, euskera (lista corta; catalán y euskera SIN revisar por hablantes nativos) */
  'kill(?:ing)? myself','end(?:ing)? my life','take my own life','(?:want|wanna) to die(?! (?:laughing|of|from|to))','wish i (?:was|were) dead','hurt(?:ing)? myself','cut(?:ting)? myself','self ?harm[a-z]*','(?:dont|don t|do not) want to (?:live|be here|exist)','better off without me','end it all','hang myself',
  'em vull (?:morir|matar|suicidar|fer mal)','vull morir(?:me)?','no vull (?:viure|seguir viu|seguir endavant)','treure m(?:e)? la vida','em faig mal','vull (?:acabar amb (?:tot|la meva vida|aixo)|desapareixer per sempre)','ja no vull viure','estic (?:cansat|cansada|fart|farta) de viure','no tinc ganes de viure','vull fer me mal',
  'hil nahi dut','hiltzea nahi dut','neure burua hil','nire burua hil','buruaz beste egin','ez dut bizi nahi','ez dut bizitzea nahi','nahiago dut hil','bizitzeari utzi','hil egin nahi dut'
];
var RIESGO=null, ALT='(?:'+FRASES.join('|')+')';
try{ RIESGO=new RegExp('(?:^|[^\\p{L}\\p{N}])'+ALT+'(?![\\p{L}\\p{N}])','u') }
catch(e2){ try{ RIESGO=new RegExp('(?:^|[^a-z0-9])'+ALT+'(?![a-z0-9])') }catch(e3){ RIESGO=/suicid|matarme|quitarme la vida|morirme|hacerme dano|autolesi|no quiero (?:seguir )?vivi/ } }
var esRiesgo=function(t){ return RIESGO.test(norma(t)) };
/*RIESGO:fin*/
module.exports = { norma: norma, esRiesgo: esRiesgo }; /* Única línea añadida a la fuente (para el empaquetador); todo lo anterior es byte a byte v10/sistema/riesgo/deteccion-riesgo.js */

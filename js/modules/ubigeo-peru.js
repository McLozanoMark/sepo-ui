/**
 * UBIGEO PERÚ — Datos de Departamento / Provincia / Distrito
 * Sistema en cascada para el modal de Centros Médicos.
 * Cubre los 25 departamentos con provincias y distritos principales.
 */

const UBIGEO_PERU = {
  "Amazonas": {
    "Chachapoyas": ["Chachapoyas", "Asunción", "Balsas", "Cheto", "Chiliquín", "Chuquibamba", "Granada", "Huancas", "La Jalca", "Leimebamba", "Levanto", "Magdalena", "Mariscal Castilla", "Molinopampa", "Montevideo", "Olleros", "Quinjalca", "San Francisco de Daguas", "San Isidro de Maino", "Soloco", "Sonche"],
    "Bagua": ["Bagua", "Carmen de la Frontera", "Copallin", "El Parco", "Imaza", "La Peca"],
    "Bongará": ["Jumbilla", "Chisquilla", "Churuja", "Corosha", "Cuispes", "Florida", "Jazan", "Recta", "San Carlos"],
    "Rodríguez de Mendoza": ["San Nicolás", "Chirimoto", "Cochamal", "Huambo", "Limabamba", "Longar", "Milpuc", "Omia", "Santa Rosa", "Totoras", "Vista Alegre"],
    "Utcubamba": ["Bagua Grande", "Cajaruro", "Cumba", "El Milagro", "Jamalca", "Lonya Grande", "Yamón"]
  },
  "Áncash": {
    "Huaraz": ["Huaraz", "Cochabamba", "Colcabamba", "Huanchay", "Independencia", "Jangas", "La Libertad", "Llanganuco", "Pampas Grande", "Paria", "Paucas", "Piruro", "Ponta", "Raimondi", "Tarica", "Ticapampa"],
    "Aija": ["Aija", "Coris", "Huacllán", "La Merced", "Succha"],
    "Chimbote": ["Chimbote", "Coishco", "Macate", "Moro", "Nepeña", "Samanco", "Santa", "Nuevo Chimbote"],
    "Casma": ["Casma", "Buena Vista Alta", "Comandante Noel", "Yaután"],
    "Huari": ["Huari", "Anra", "Cajay", "Chavin de Huantar", "Huacaybamba", "Huántar", "Masín", "Paucas", "Ponto", "Rahuapampa", "Rapayan", "San Marcos", "San Pedro de Chaná", "Uco"]
  },
  "Apurímac": {
    "Abancay": ["Abancay", "Chacoche", "Circa", "Curahuasi", "Huanipaca", "Lambrama", "Pichirhua", "San Pedro de Cachora", "Tamburco"],
    "Andahuaylas": ["Andahuaylas", "Andarapa", "Chiara", "Huancarama", "Huancaray", "Huayana", "Kishuará", "Kaquiabamba", "Pacobamba", "Pacucha", "Pampachiri", "Pomacocha", "San Antonio de Cachi", "San Jerónimo", "San Miguel de Chaccrampa", "Santa María de Chicmo", "Talavera", "Tumay Huaraca", "Turpo"],
    "Aymaraes": ["Chalhuanca", "Capaya", "Caraybamba", "Chapimarca", "Colcabamba", "Cotaruse", "Huayllo", "Justo Apu Sahuaraura", "Lucre", "Pocohuanca", "San Juan de Chaquibamba", "Sañayca", "Soraya", "Tapairihua", "Tintay", "Toraya", "Yanaca"],
    "Chincheros": ["Chincheros", "Anco-Huallo", "Cocharcas", "Huaccana", "Ocobamba", "Ongoy", "Uripa", "Ranracancha"]
  },
  "Arequipa": {
    "Arequipa": ["Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "Jacobo Hunter", "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", "Polobaya", "Quequeña", "Sabandia", "Sachaca", "San Juan de Siguas", "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura"],
    "Camaná": ["Camaná", "José María Quimper", "Mariscal Cáceres", "Mariano Nicolás Valcárcel", "Nicolás de Piérola", "Ocoña", "Quilca", "Samuel Pastor"],
    "Caravelí": ["Caravelí", "Acarí", "Atico", "Atiquipa", "Bella Unión", "Cahuacho", "Chala", "Chaparra", "Huanuhuanu", "Jaqui", "Lomas", "Quicacha", "Yauca"],
    "Islay": ["Mollendo", "Cocachacra", "Dean Valdivia", "Islay", "Mejia", "Punta de Bombón"]
  },
  "Ayacucho": {
    "Huamanga": ["Ayacucho", "Acocro", "Acos Vinchos", "Carmen Alto", "Chiara", "Jesús Nazareno", "Ocros", "Pacaycasa", "Quinua", "San José de Ticllas", "San Juan Bautista", "Santiago de Pischa", "Socos", "Tambillo", "Vinchos"],
    "Cangallo": ["Cangallo", "Chuschi", "Los Morochucos", "María Parado de Bellido", "Paras", "Totos"],
    "Huanta": ["Huanta", "Ayahuanco", "Huamanguilla", "Iguaín", "Luricocha", "Santillana", "Sivia", "Llochegua"],
    "La Mar": ["San Miguel", "Anco", "Ayna", "Chilcas", "Chungui", "Luis Carranza", "Santa Rosa", "Tambo"]
  },
  "Cajamarca": {
    "Cajamarca": ["Cajamarca", "Asunción", "Chetilla", "Cospan", "Encañada", "Jesús", "Llacanora", "Los Baños del Inca", "Magdalena", "Matara", "Namora", "San Juan"],
    "Cajabamba": ["Cajabamba", "Cachachi", "Condebamba", "Sitacocha"],
    "Celendín": ["Celendín", "Chumuch", "Cortegana", "Huasmin", "Jorge Chávez", "José Gálvez", "Miguel Iglesias", "Oxamarca", "Sorochuco", "Sucre", "Utco", "La Libertad de Pallán"],
    "Chota": ["Chota", "Anguia", "Chadin", "Chiguirip", "Chimban", "Choropampa", "Cochabamba", "Conchan", "Huambos", "Lajas", "Llama", "Miracosta", "Paccha", "Pion", "Querocoto", "San Juan de Licupis", "Tacabamba", "Tocmoche", "Chalamarca"],
    "Jaén": ["Jaén", "Bellavista", "Chontali", "Colasay", "Huabal", "Las Pirias", "Pomahuaca", "Pucara", "Sallique", "San Felipe", "San José del Alto", "Santa Rosa"]
  },
  "Callao": {
    "Callao": ["Bellavista", "Callao", "Carmen de la Legua Reynoso", "La Perla", "La Punta", "Ventanilla", "Mi Perú"]
  },
  "Cusco": {
    "Cusco": ["Cusco", "Ccorca", "Poroy", "San Jerónimo", "San Sebastián", "Santiago", "Saylla", "Wanchaq"],
    "Acomayo": ["Acomayo", "Acopia", "Acos", "Mosoc Llacta", "Pomacanchi", "Rondocan", "Sangarará"],
    "Calca": ["Calca", "Coya", "Lamay", "Lares", "Pisac", "San Salvador", "Taray", "Yanatile"],
    "La Convención": ["Santa Ana", "Echarate", "Huayopata", "Huanipaca", "Maranura", "Ocobamba", "Quellouno", "Quimbiri", "Santa Teresa", "Vilcabamba", "Pichari", "Inkawasi"],
    "Urubamba": ["Urubamba", "Chinchero", "Huayllabamba", "Machupicchu", "Maras", "Ollantaytambo", "Yucay"]
  },
  "Huancavelica": {
    "Huancavelica": ["Huancavelica", "Acobambilla", "Acoria", "Conayca", "Cuenca", "Huachocolpa", "Huayllahuara", "Izcuchaca", "Laria", "Manta", "Mariscal Cáceres", "Moya", "Nuevo Occoro", "Palca", "Pilchaca", "Vilca", "Yauli", "Ascensión"],
    "Acobamba": ["Acobamba", "Andabamba", "Anta", "Caja", "Marcas", "Paucara", "Pomacocha", "Rosario"],
    "Angaraes": ["Lircay", "Anchonga", "Callanmarca", "Ccochaccasa", "Chincho", "Congalla", "Huanca-Huanca", "Huayllay Grande", "Julcamarca", "San Antonio de Antaparco", "Santo Tomás de Pata", "Secclla"],
    "Tayacaja": ["Pampas", "Acostambo", "Acraquia", "Ahuaycha", "Colcabamba", "Daniel Hernandez", "Huachocolpa", "Huaribamba", "Ñahuimpuquio", "Pazos", "Quishuar", "Salcabamba", "Salcahuasi", "San Marcos de Rocchac", "Surcubamba", "Tintay Puncu"]
  },
  "Huánuco": {
    "Huánuco": ["Huánuco", "Amarilis", "Chinchao", "Churubamba", "Margos", "Quisqui (Kichki)", "San Francisco de Cayran", "San Pedro de Chaulán", "Santa María del Valle", "Yarumayo", "Pillco Marca", "Yacus"],
    "Ambo": ["Ambo", "Cayna", "Colpas", "Conchamarca", "Huacar", "San Francisco", "San Rafael", "Tomay Kichwa"],
    "Leoncio Prado": ["Tingo María", "Daniel Alomia Robles", "Hermilio Valdizan", "José Crespo y Castillo", "Luyando", "Mariano Damaso Beraun", "Padre Felipe Luyando", "Rupa-Rupa"]
  },
  "Ica": {
    "Ica": ["Ica", "La Tinguiña", "Los Aquijes", "Ocucaje", "Pachacuti", "Parcona", "Pueblo Nuevo", "Salas", "San José de Los Molinos", "San Juan Bautista", "Santiago", "Subtanjalla", "Tate", "Yauca del Rosario"],
    "Chincha": ["Chincha Alta", "Alto Larán", "Chavin", "Chavín", "El Carmen", "Grocio Prado", "Pueblo Nuevo", "San Juan de Yanac", "San Pedro de Huacarpana", "Sunampe", "Tambo de Mora"],
    "Nazca": ["Nazca", "Changuillo", "El Ingenio", "Marcona", "Vista Alegre"],
    "Pisco": ["Pisco", "Huancano", "Humay", "Independencia", "Paracas", "San Andrés", "San Clemente", "Túpac Amaru Inca"],
    "Palpa": ["Palpa", "Llipata", "Río Grande", "Santa Cruz", "Tibillo"]
  },
  "Junín": {
    "Huancayo": ["Huancayo", "Carhuacallanga", "Chacapampa", "Chicche", "Chilca", "Chupuro", "Colca", "Cullhuas", "El Tambo", "Huacrapuquio", "Hualhuas", "Huancan", "Huasicancha", "Huayucachi", "Ingenio", "Pariahuanca", "Pilcomayo", "Pucará", "Quichuay", "Quilcas", "San Agustín de Cajas", "San Jerónimo de Tunán", "Saño", "Sapallanga", "Sicaya", "Santo Domingo de Acobamba", "Viques"],
    "Chanchamayo": ["La Merced", "Chanchamayo", "Perené", "Pichanaqui", "San Luis de Shuaro", "San Ramón"],
    "Jauja": ["Jauja", "Acolla", "Apata", "Ataura", "Canchayllo", "Curicaca", "El Mantaro", "Huamali", "Huaripampa", "Huertas", "Janjaillo", "Julcán", "Leonor Ordóñez", "Llocllapampa", "Marco", "Masma", "Masma Chicche", "Molinos", "Monobamba", "Muqui", "Muquiyauyo", "Paca", "Paccha", "Pancan", "Parco", "Pomacancha", "Ricran", "San Lorenzo", "San Pedro de Chunan", "Sausa", "Sincos", "Tunan Marca", "Yauli", "Yauyos"],
    "Satipo": ["Satipo", "Coviriali", "Llaylla", "Mazamari", "Pampa Hermosa", "Pangoa", "Río Negro", "Río Tambo", "Vizcatán del Ene"],
    "Tarma": ["Tarma", "Acobamba", "Huaricolca", "Huasahuasi", "La Unión", "Palca", "Palcamayo", "San Pedro de Cajas", "Tapo"]
  },
  "La Libertad": {
    "Trujillo": ["Trujillo", "El Porvenir", "Florencia de Mora", "Huanchaco", "La Esperanza", "Laredo", "Moche", "Poroto", "Salaverry", "Simbal", "Victor Larco Herrera"],
    "Ascope": ["Ascope", "Chicama", "Chocope", "Guadalupito", "Huanchaco", "Magdalena de Cao", "Paiján", "Rázuri", "Santiago de Cao", "Casa Grande"],
    "Chepén": ["Chepén", "Pacanga", "Pueblo Nuevo"],
    "Pacasmayo": ["San Pedro de Lloc", "Guadalupe", "Jequetepeque", "Pacasmayo", "San José"],
    "Virú": ["Virú", "Chao", "Guadalupito"],
    "Otuzco": ["Otuzco", "Agallpampa", "Charat", "Huaranchal", "La Cuesta", "Mache", "Paranday", "Salpo", "Sinsicap", "Usquil"]
  },
  "Lambayeque": {
    "Chiclayo": ["Chiclayo", "Chongoyape", "Eten", "Eten Puerto", "José Leonardo Ortiz", "La Victoria", "Lagunas", "Monsefu", "Nueva Arica", "Oyotún", "Patapo", "Picsi", "Pimentel", "Reque", "Santa Rosa", "Saña", "Cayalti", "Pomalca", "Pucala", "Tuman"],
    "Ferreñafe": ["Ferreñafe", "Cañaris", "Incahuasi", "Manuel Antonio Mesones Muro", "Pitipo", "Pueblo Nuevo"],
    "Lambayeque": ["Lambayeque", "Chochope", "Illimo", "Jayanca", "Mochumi", "Morrope", "Motupe", "Olmos", "Pacora", "Salas", "San José", "Tucume"]
  },
  "Lima": {
    "Lima": ["Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"],
    "Barranca": ["Barranca", "Ámbar", "Medio Mundo", "Paramonga", "Pativilca", "Puerto Supe", "Supe"],
    "Cañete": ["San Vicente de Cañete", "Asia", "Calango", "Cerro Azul", "Chilca", "Coayllo", "Imperial", "Lunahuana", "Mala", "Nuevo Imperial", "Pacaran", "Quilmana", "San Antonio", "San Luis", "Santa Cruz de Flores", "Zúñiga"],
    "Huaral": ["Huaral", "Atavillos Alto", "Atavillos Bajo", "Aucallama", "Chancay", "Ihuari", "Lampian", "Pacaraos", "San Miguel de Acos", "Santa Cruz de Andamarca", "Sumbilca", "Torres de Pucará"],
    "Huarochirí": ["Matucana", "Antioquia", "Callahuanca", "Carampoma", "Chicla", "Cuenca", "Huachupampa", "Huanza", "Huarochiri", "Lahuaytambo", "Langa", "Laraos", "Mariatana", "Ricardo Palma", "San Andrés de Tupicocha", "San Antonio", "San Bartolomé", "San Damián", "San Juan de Iris", "San Juan de Tantaranche", "San Lorenzo de Quinti", "San Mateo", "San Mateo de Otao", "San Pedro de Casta", "San Pedro de Huancayre", "Sangallaya", "Santa Cruz de Cocachacra", "Santa Eulalia", "Santiago de Anchucaya", "Santiago de Tuna", "Santo Domingo de Los Olleros", "Surco"],
    "Callao": ["Bellavista", "Callao", "La Perla", "La Punta", "Ventanilla"]
  },
  "Loreto": {
    "Maynas": ["Iquitos", "Alto Nanay", "Fernando Lores", "Indiana", "Las Amazonas", "Mazan", "Napo", "Punchana", "Torres Causana", "Belén", "San Juan Bautista"],
    "Loreto": ["Nauta", "Parinari", "Tigre", "Trompeteros", "Urarinas"],
    "Alto Amazonas": ["Yurimaguas", "Balsapuerto", "Barranca", "Cahuapanas", "Jeberos", "Lagunas", "Santa Cruz", "Teniente César López Rojas"],
    "Ucayali": ["Contamana", "Inahuaya", "Padre Márquez", "Pampa Hermosa", "Sarayacu", "Vargas Guerra"]
  },
  "Madre de Dios": {
    "Tambopata": ["Tambopata", "Inambari", "Las Piedras", "Laberinto"],
    "Manu": ["Manu", "Fitzcarrald", "Madre de Dios", "Huepetuhe"],
    "Tahuamanu": ["Iñapari", "Iberia", "Tahuamanu"]
  },
  "Moquegua": {
    "Mariscal Nieto": ["Moquegua", "Carumas", "Cuchumbaya", "Samegua", "San Cristóbal", "Torata"],
    "General Sánchez Cerro": ["Omate", "Chojata", "Coalaque", "Ichuña", "La Capilla", "Lloque", "Matalaque", "Puquina", "Quinistaquillas", "Ubinas", "Yunga"],
    "Ilo": ["Ilo", "El Algarrobal", "Pacocha"]
  },
  "Pasco": {
    "Pasco": ["Chaupimarca", "Huachón", "Huariaca", "Huayllay", "Ninacaca", "Pallanchacra", "Paucartambo", "San Francisco de Asís de Yarusyacán", "Simon Bolívar", "Ticlacayan", "Tinyahuarco", "Vicco", "Yanacancha"],
    "Daniel Alcides Carrión": ["Yanahuanca", "Chacayan", "Goyllarisquizga", "Paucar", "San Pedro de Pillao", "Santa Ana de Tusi", "Tapuc", "Vilcabamba"],
    "Oxapampa": ["Oxapampa", "Chontabamba", "Huancabamba", "Palcazu", "Pozuzo", "Puerto Bermúdez", "Villa Rica", "Constitución"]
  },
  "Piura": {
    "Piura": ["Piura", "Castilla", "Catacaos", "Cura Mori", "El Tallan", "La Arena", "La Unión", "Las Lomas", "Tambo Grande", "Veintiseis de Octubre"],
    "Sullana": ["Sullana", "Bellavista", "Ignacio Escudero", "Lancones", "Marcavelica", "Miguel Checa", "Querecotillo", "Salitral"],
    "Talara": ["Pariñas", "El Alto", "La Brea", "Lobitos", "Los Órganos", "Mancora"],
    "Paita": ["Paita", "Amotape", "Arenal", "Colán", "La Huaca", "Tamarindo", "Vichayal"],
    "Ayabaca": ["Ayabaca", "Frias", "Jilili", "Lagunas", "Montero", "Pacaipampa", "Paimas", "Sapillica", "Sicchez", "Suyo"],
    "Huancabamba": ["Huancabamba", "Canchaque", "El Carmen de la Frontera", "Huarmaca", "Lalaquiz", "San Miguel del Faique", "Sondor", "Sondorillo"]
  },
  "Puno": {
    "Puno": ["Puno", "Acora", "Amantani", "Atuncolla", "Capachica", "Chucuito", "Coata", "Huata", "Mañazo", "Paucarcolla", "Pichacani", "Platería", "San Antonio", "Tiquillaca", "Vilque"],
    "Azángaro": ["Azángaro", "Achaya", "Arapa", "Asillo", "Caminaca", "Chupa", "José Domingo Choquehuanca", "Muñani", "Potoni", "Saman", "San Antón", "San José", "San Juan de Salinas", "Santiago de Pupuja", "Tirapata"],
    "Carabaya": ["Macusani", "Ajoyani", "Ayapata", "Coasa", "Corani", "Crucero", "Ituata", "Ollachea", "San Gaban", "Usicayos"],
    "Juliaca": ["San Román", "Caracoto", "Juliaca", "San Miguel", "Vilque"],
    "Melgar": ["Ayaviri", "Antauta", "Cupi", "Llalli", "Macari", "Nuñoa", "Orurillo", "Santa Rosa", "Umachiri"],
    "Tacna": ["Tacna", "Alto de la Alianza", "Calana", "Ciudad Nueva", "Crnl. Gregorio Albarracín Lanchipa", "Inclán", "Pachia", "Palca", "Pocollay", "Sama"]
  },
  "San Martín": {
    "San Martín": ["Tarapoto", "Alberto Leveau", "Cacatachi", "Chazuta", "Chipurana", "El Porvenir", "Huimbayoc", "Juan Guerra", "La Banda de Shilcayo", "Morales", "Papaplaya", "San Antonio", "Sauce", "Shapaja"],
    "Moyobamba": ["Moyobamba", "Calzada", "Habana", "Jepelacio", "Soritor", "Yantalo"],
    "Lamas": ["Lamas", "Alonso de Alvarado", "Barranquita", "Caynarachi", "Cuñumbuqui", "Pinto Recodo", "Rumisapa", "San Roque de Cumbaza", "Shanao", "Tabalosos", "Zapatero"],
    "Bellavista": ["Bellavista", "Alto Biavo", "Bajo Biavo", "Callería", "Huallaga", "San Pablo"],
    "Tocache": ["Tocache", "Nuevo Progreso", "Polvora", "Shunte", "Uchiza"]
  },
  "Tacna": {
    "Tacna": ["Tacna", "Alto de la Alianza", "Calana", "Ciudad Nueva", "Crnl. Gregorio Albarracín Lanchipa", "Inclán", "Pachia", "Palca", "Pocollay", "Sama"],
    "Candarave": ["Candarave", "Cairani", "Camilaca", "Curibaya", "Huanuara", "Quilahuani"],
    "Jorge Basadre": ["Locumba", "Ilabaya", "Ite"],
    "Tarata": ["Tarata", "Chucatamani", "Estique", "Estique-Pampa", "Sitajara", "Susapaya", "Tarucachi", "Ticaco"]
  },
  "Tumbes": {
    "Tumbes": ["Tumbes", "Corrales", "La Cruz", "Pampas de Hospital", "San Jacinto", "San Juan de la Virgen"],
    "Contralmirante Villar": ["Zorritos", "Casitas", "Canoas de Punta Sal"],
    "Zarumilla": ["Zarumilla", "Aguas Verdes", "Matapalo", "Papayal"]
  },
  "Ucayali": {
    "Coronel Portillo": ["Callería", "Campoverde", "Iparia", "Masisea", "Yarinacocha", "Nueva Requena", "Manantay"],
    "Atalaya": ["Raymondi", "Sepahua", "Tahuania", "Yurúa"],
    "Padre Abad": ["Padre Abad", "Irazola", "Curimaná", "Neshuya", "Alexander Von Humboldt"],
    "Purús": ["Purús"]
  }
};

/**
 * Inicializa el selector de Departamentos al cargar la página.
 */
function inicializarDepartamentos() {
  const selectDep = document.getElementById('cDep');
  if (!selectDep) return;
  // Limpiar opciones existentes y dejar solo la placeholder
  selectDep.innerHTML = '<option value="">Seleccionar departamento...</option>';
  const departamentos = Object.keys(UBIGEO_PERU).sort();
  departamentos.forEach(dep => {
    const opt = document.createElement('option');
    opt.value = dep;
    opt.textContent = dep;
    selectDep.appendChild(opt);
  });
  window.CentroMedicoSearchbox?.refreshForSelect('cDep');
}

/**
 * Carga las provincias según el departamento seleccionado.
 * @param {string} dep - Nombre del departamento
 */
function cargarProvincias(dep) {
  const selectProv = document.getElementById('cProv');
  const selectDist = document.getElementById('cDist');
  if (!selectProv || !selectDist) return;

  selectProv.innerHTML = '<option value="">Seleccionar provincia...</option>';
  selectDist.innerHTML = '<option value="">Seleccionar distrito...</option>';
  selectDist.disabled = true;

  if (!dep || !UBIGEO_PERU[dep]) {
    selectProv.disabled = true;
    window.CentroMedicoSearchbox?.refreshForSelect('cProv');
    window.CentroMedicoSearchbox?.refreshForSelect('cDist');
    return;
  }

  const provincias = Object.keys(UBIGEO_PERU[dep]).sort();
  provincias.forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    opt.dataset.dep = dep;
    selectProv.appendChild(opt);
  });
  selectProv.disabled = false;
  window.CentroMedicoSearchbox?.refreshForSelect('cProv');
  window.CentroMedicoSearchbox?.refreshForSelect('cDist');
}

/**
 * Carga los distritos según el departamento y provincia seleccionados.
 * @param {string} dep  - Nombre del departamento
 * @param {string} prov - Nombre de la provincia
 */
function cargarDistritos(dep, prov) {
  const selectDist = document.getElementById('cDist');
  if (!selectDist) return;

  selectDist.innerHTML = '<option value="">Seleccionar distrito...</option>';

  // Recuperar dep del option seleccionado si no viene como argumento
  if (!dep) {
    const selectProv = document.getElementById('cProv');
    if (selectProv && selectProv.selectedOptions[0]) {
      dep = selectProv.selectedOptions[0].dataset.dep || '';
    }
  }

  if (!dep || !prov || !UBIGEO_PERU[dep] || !UBIGEO_PERU[dep][prov]) {
    selectDist.disabled = true;
    window.CentroMedicoSearchbox?.refreshForSelect('cDist');
    return;
  }

  const distritos = UBIGEO_PERU[dep][prov].sort();
  distritos.forEach(dist => {
    const opt = document.createElement('option');
    opt.value = dist;
    opt.textContent = dist;
    selectDist.appendChild(opt);
  });
  selectDist.disabled = false;
  window.CentroMedicoSearchbox?.refreshForSelect('cDist');
}

/**
 * Inicializa el modal de Centro Médico al abrirse.
 * Se llama desde el evento show.bs.modal o manualmente.
 */
function inicializarModalCentro() {
  inicializarDepartamentos();
  const selectProv = document.getElementById('cProv');
  const selectDist = document.getElementById('cDist');
  if (selectProv) {
    selectProv.innerHTML = '<option value="">Seleccionar provincia...</option>';
    selectProv.disabled = true;
  }
  if (selectDist) {
    selectDist.innerHTML = '<option value="">Seleccionar distrito...</option>';
    selectDist.disabled = true;
  }
  window.CentroMedicoSearchbox?.refreshForSelect('cProv');
  window.CentroMedicoSearchbox?.refreshForSelect('cDist');
}

/**
 * Cuando se edita un Centro Médico existente, preselecciona los valores.
 * @param {string} dep  - Departamento a seleccionar
 * @param {string} prov - Provincia a seleccionar
 * @param {string} dist - Distrito a seleccionar
 */
function preseleccionarUbigeo(dep, prov, dist) {
  inicializarDepartamentos();
  const selectDep = document.getElementById('cDep');
  if (dep && selectDep) {
    selectDep.value = dep;
    cargarProvincias(dep);
    const selectProv = document.getElementById('cProv');
    if (prov && selectProv) {
      selectProv.value = prov;
      cargarDistritos(dep, prov);
      const selectDist = document.getElementById('cDist');
      if (dist && selectDist) {
        selectDist.value = dist;
      }
    }
  }
  window.CentroMedicoSearchbox?.refreshForSelect('cDep');
  window.CentroMedicoSearchbox?.refreshForSelect('cProv');
  window.CentroMedicoSearchbox?.refreshForSelect('cDist');
}

// Inicializar al cargar la página cuando el modal exista
document.addEventListener('DOMContentLoaded', function() {
  const modalCentro = document.getElementById('modalCentro');
  if (modalCentro) {
    modalCentro.addEventListener('show.bs.modal', function() {
      inicializarModalCentro();
      window.CentroMedicoSearchbox?.hydrateResponsables();

      const dep = modalCentro.dataset.dep || '';
      const prov = modalCentro.dataset.prov || '';
      const dist = modalCentro.dataset.dist || '';
      const responsable = modalCentro.dataset.responsable || '';

      if (dep) {
        preseleccionarUbigeo(dep, prov, dist);
      }

      window.CentroMedicoSearchbox?.preselectResponsable(responsable);
    });
    // Inicializar también de inmediato en caso ya esté visible
    inicializarDepartamentos();
    window.CentroMedicoSearchbox?.init();
  }
});

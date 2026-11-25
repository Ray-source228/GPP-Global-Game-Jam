// ===== AYUDAS =====
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");

let idiomaActual = "es";
try { idiomaActual = localStorage.getItem("idioma") || "es"; } catch (e) {}
if (!["es", "ca", "en"].includes(idiomaActual)) idiomaActual = "es";

const t = key => TRADUCCIONES[idiomaActual][key] ?? TRADUCCIONES.es[key] ?? key;
const fmt = ms => new Date(ms).toLocaleString(t("locale"), {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
});

function crear(tag, clase, texto) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto) e.textContent = texto;
    return e;
}

/* ==========================================================
   NAVEGACIÓN
   ========================================================== */
const SECCIONES = ["info", "location", "home", "random", "archive"];
let indiceAnterior = SECCIONES.indexOf("home");

function mostrar() {
    let nombre = location.hash.slice(1);
    if (!SECCIONES.includes(nombre)) nombre = "home";

    const indiceNuevo = SECCIONES.indexOf(nombre);
    const haciaIzquierda = indiceNuevo < indiceAnterior;
    indiceAnterior = indiceNuevo;

    document.querySelectorAll(".sec").forEach(s => {
        const esActiva = s.dataset.sec === nombre;
        s.hidden = !esActiva;
        if (esActiva) {
            s.classList.toggle("desde-izq", haciaIzquierda);
            s.style.animation = "none";
            void s.offsetWidth;
            s.style.animation = "";
        }
    });

    document.querySelectorAll(".botones button").forEach(b => b.classList.toggle("activo", b.dataset.sec === nombre));
    window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll(".botones button").forEach(b => b.onclick = () => { location.hash = b.dataset.sec; });
window.addEventListener("hashchange", mostrar);

/* ==========================================================
   INICIO: cuenta atrás hasta FECHA_EVENTO
   ========================================================== */
const fechaEvento = new Date(FECHA_EVENTO).getTime();
let idCuenta;
function cuentaAtras() {
    const falta = fechaEvento - Date.now();
    if (falta < 0) { clearInterval(idCuenta); $("contador").textContent = t("ahora"); return; }
    const d = Math.floor(falta / 86400000);
    const h = Math.floor(falta % 86400000 / 3600000);
    const m = Math.floor(falta % 3600000 / 60000);
    $("contador").textContent = d + "d " + h + "h " + m + "m";
}
idCuenta = setInterval(cuentaAtras, 1000);

/* ==========================================================
   JUEGOS: tarjetas + buscador + desplegable "Conocer más"
   ========================================================== */
function crearTarjeta(j) {
    const card = crear("article", "juego");

    const portada = crear("div", "portada");
    const LOGO_GGJ_OFICIAL = "data:image/svg+xml," + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225">
            <rect width="400" height="225" fill="#2d2654"/>
            <circle cx="200" cy="78" r="56" fill="none" stroke="#452b63" stroke-width="14"/>
            <circle cx="200" cy="78" r="24" fill="#22A9E0"/>
            <path d="M188 64 c6 2 10 8 8 14 c-2 6 -8 10 -12 8 z M208 68 c5 4 7 12 3 16 c-4 4 -10 2 -11 -4 z" fill="#FFFCFF"/>
            <ellipse cx="200" cy="78" rx="44" ry="12" fill="none" stroke="#F3EB33" stroke-width="5" transform="rotate(-18 200 78)"/>
            <text x="200" y="166" text-anchor="middle" fill="#FFFCFF" font-family="Jost, sans-serif" font-weight="600" font-size="30" letter-spacing="2">GLOBAL</text>
            <text x="200" y="196" text-anchor="middle" fill="#FFFCFF" font-family="Jost, sans-serif" font-weight="400" font-size="22" letter-spacing="5">GAME JAM</text>
        </svg>`
    );

    const respaldos = [
        "GlobalGameJam.png",
        "GlobalGameJam.PNG",
        "GlobalGameJam.jpg",
        "GlobalGameJam.webp",
        "img/GlobalGameJam.png",
        LOGO_GGJ_OFICIAL
    ];

    const img = document.createElement("img");
    img.src = (j.img && j.img.trim()) ? j.img.trim() : respaldos[0];
    img.alt = j.titulo;
    img.loading = "lazy";

    let intento = 0;
    img.onerror = () => {
        while (intento < respaldos.length && img.src.endsWith(respaldos[intento])) {
            intento++;
        }
        if (intento < respaldos.length) {
            img.src = respaldos[intento++];
        } else {
            img.onerror = null;
        }
    };
    portada.append(img);

    const info = crear("div", "juego-info");
    const creadores = j.Creadores || j.creadores || j.autor || "";
    info.append(crear("h3", "", j.titulo));
    if (creadores) {
        const aut = crear("div", "autor");
        aut.append(crear("b", "", t("creadores")), document.createTextNode(creadores));
        info.append(aut);
    }

    const descCorta = crear("p", "desc-corta", j.desc);
    info.append(descCorta);

    const tags = crear("div", "tags");
    (j.tags || []).forEach(tg => tags.append(crear("span", "", tg)));
    info.append(tags);

    // Panel desplegable ("Conocer más")
    const panelExtra = crear("div", "juego-extra");
    panelExtra.hidden = true;

    const textoCompleto = crear("p", "desc-completa", j.descCompleta || j.desc);
    panelExtra.append(textoCompleto);

    // Botones opcionales de Video y Recursos dentro del desplegable
    if (j.video || j.recursos) {
        const extraBtns = crear("div", "extra-btns");

        if (j.video) {
            const btnVideo = crear("a", "btn-extra btn-video", t("video"));
            btnVideo.href = j.video;
            btnVideo.target = "_blank";
            btnVideo.rel = "noopener";
            extraBtns.append(btnVideo);
        }

        if (j.recursos) {
            const btnRecursos = crear("a", "btn-extra btn-recursos", t("recursos"));
            btnRecursos.href = j.recursos;
            btnRecursos.target = "_blank";
            btnRecursos.rel = "noopener";
            extraBtns.append(btnRecursos);
        }

        panelExtra.append(extraBtns);
    }

    info.append(panelExtra);

    // Fila inferior de botones principales: "Jugar" + "Conocer más"
    const accionesCard = crear("div", "juego-acciones");

    if (j.url) {
        const a = crear("a", "jugar", t("jugar"));
        a.href = j.url;
        a.target = "_blank";
        a.rel = "noopener";
        accionesCard.append(a);
    }

    const tieneExtra = (j.descCompleta && j.descCompleta !== j.desc) || j.video || j.recursos;
    if (tieneExtra) {
        const btnMas = crear("button", "conocer-mas", t("conocer_mas"));
        btnMas.type = "button";
        btnMas.setAttribute("aria-expanded", "false");
        btnMas.onclick = () => {
            const abrir = panelExtra.hidden;
            panelExtra.hidden = !abrir;
            descCorta.hidden = abrir;
            card.classList.toggle("expandido", abrir);
            btnMas.setAttribute("aria-expanded", String(abrir));
            btnMas.textContent = abrir ? t("ocultar_mas") : t("conocer_mas");
        };
        accionesCard.append(btnMas);
    }

    if (accionesCard.children.length > 0) {
        info.append(accionesCard);
    }

    card.append(portada, info);
    return card;
}

const normalizar = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function llenarSelect(id, campo, base = []) {
    const sel = $(id);
    const valorPrevio = sel.value;
    sel.innerHTML = "";
    sel.append(new Option(t("cualquiera"), ""));
    const extra = [...new Set(JUEGOS.flatMap(j => j[campo] || []))]
        .filter(v => !base.includes(v))
        .sort((a, b) => a.localeCompare(b, idiomaActual));
    [...base, ...extra].forEach(v => sel.append(new Option(v, v)));
    sel.value = valorPrevio;
}

function actualizarSelects() {
    llenarSelect("f-div", "diversificadores", DIVERSIFICADORES);
    llenarSelect("f-tags", "tags");
    llenarSelect("f-plataformas", "plataformas", PLATAFORMAS);
    llenarSelect("f-herramientas", "herramientas", HERRAMIENTAS);
}

function mostrarJuegos() {
    const titulo = normalizar($("f-titulo").value.trim());
    const div = $("f-div").value, tag = $("f-tags").value, plat = $("f-plataformas").value, herr = $("f-herramientas").value;
    const lista = JUEGOS.filter(j =>
        normalizar(j.titulo).includes(titulo) &&
        (!div  || (j.diversificadores || []).includes(div)) &&
        (!tag  || (j.tags || []).includes(tag)) &&
        (!plat || (j.plataformas || []).includes(plat)) &&
        (!herr || (j.herramientas || []).includes(herr))
    );
    $("juegos").replaceChildren(...lista.map(crearTarjeta));
    $("resultados").textContent = lista.length
        ? t("mostrando")(lista.length, JUEGOS.length)
        : t("sin_resultados");
}
$("filtros").addEventListener("submit", e => { e.preventDefault(); mostrarJuegos(); });
$("filtros").addEventListener("reset", () => setTimeout(mostrarJuegos, 0));

/* ==========================================================
   ALEATORIO: generador de temas multilingüe + temporizador
   ========================================================== */
const KEY = "temporizador3h", KEY_TEMA = "temaJuegoV2", DURACION = 3 * 60 * 60 * 1000;
const CATEGORIAS_BASE = Object.keys(TEMAS_I18N.es);

let estado = null, temaIndices = null, bloqueadosIdx = {}, audioCtx = null;

try { estado = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
try {
    const g = JSON.parse(localStorage.getItem(KEY_TEMA));
    if (g && Array.isArray(g.temaIndices)) {
        temaIndices = g.temaIndices;
        bloqueadosIdx = g.bloqueadosIdx || {};
    }
} catch (e) {}

if (!temaIndices) {
    try {
        const viejo = JSON.parse(localStorage.getItem("temaJuego"));
        if (viejo && viejo.tema) {
            temaIndices = CATEGORIAS_BASE.map(cat => {
                const idx = TEMAS_I18N.es[cat].indexOf(viejo.tema[cat]);
                return idx >= 0 ? idx : Math.floor(Math.random() * TEMAS_I18N.es[cat].length);
            });
            CATEGORIAS_BASE.forEach((cat, i) => {
                if (viejo.bloqueados && viejo.bloqueados[cat]) bloqueadosIdx[i] = true;
            });
        }
    } catch (e) {}
}

if (temaIndices) {
    CATEGORIAS_BASE.forEach((cat, i) => {
        if (typeof temaIndices[i] !== "number") {
            temaIndices[i] = Math.floor(Math.random() * TEMAS_I18N.es[cat].length);
        }
    });
}

function guardar() {
    try { if (estado) localStorage.setItem(KEY, JSON.stringify(estado)); else localStorage.removeItem(KEY); } catch (e) {}
}
function guardarTema() {
    try { localStorage.setItem(KEY_TEMA, JSON.stringify({ temaIndices, bloqueadosIdx })); } catch (e) {}
}

// --- Alarma ---
function prepararAviso() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) {}
    try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
}
function sonar() {
    try {
        if (!audioCtx) return;
        for (let i = 0; i < 4; i++) {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
            const tAudio = audioCtx.currentTime + i * 0.6;
            g.gain.setValueAtTime(0.0001, tAudio);
            g.gain.exponentialRampToValueAtTime(0.4, tAudio + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, tAudio + 0.5);
            o.start(tAudio); o.stop(tAudio + 0.55);
        }
    } catch (e) {}
}
function avisar() {
    if (!estado || estado.avisado) return;
    estado.avisado = true; guardar(); sonar();
    try {
        if ("Notification" in window && Notification.permission === "granted")
            new Notification(t("tiempo_terminado"), { body: t("tiempo_terminado_body") });
    } catch (e) {}
}

// --- Temporizador ---
function iniciar() {
    const ahora = Date.now();
    estado = { inicio: ahora, fin: ahora + DURACION, avisado: false };
    prepararAviso(); guardar(); pintar();
}
function reiniciar() { estado = null; guardar(); pintar(); }

function pintar() {
    const timeEl = $("time"), fechas = $("fechas");
    if (!estado) {
        timeEl.textContent = "03:00:00"; timeEl.classList.remove("done");
        $("fill").style.width = "0%";
        fechas.textContent = t("fechas_vacio");
        document.title = "Global Game Jam Neàpolis";
        return;
    }
    const resta = Math.max(0, estado.fin - Date.now()), s = Math.ceil(resta / 1000);
    timeEl.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
    $("fill").style.width = (100 - resta / DURACION * 100) + "%";
    fechas.innerHTML = t("fechas_inicio") + ": <b>" + fmt(estado.inicio) + "</b><br>" + t("fechas_fin") + ": <b>" + fmt(estado.fin) + "</b>";
    if (resta === 0) {
        timeEl.classList.add("done");
        document.title = t("tiempo_terminado");
        fechas.innerHTML += "<br><b>" + t("tiempo_terminado_body") + "</b>";
        avisar();
    } else {
        timeEl.classList.remove("done");
        document.title = timeEl.textContent + " · Game Jam";
    }
}

// --- Generador de temas ---
function generarTema() {
    temaIndices = CATEGORIAS_BASE.map((cat, i) => {
        const lista = TEMAS_I18N.es[cat];
        return (bloqueadosIdx[i] && temaIndices) ? temaIndices[i] : Math.floor(Math.random() * lista.length);
    });
    guardarTema(); pintarTema(); iniciar();
}

function pintarTema() {
    const c = $("tema");
    if (!temaIndices) {
        c.innerHTML = '<div class="vacio">' + t("tema_vacio") + '</div>';
        return;
    }
    const dictTemas = TEMAS_I18N[idiomaActual] || TEMAS_I18N.es;
    const categoriasIdioma = Object.keys(dictTemas);

    c.innerHTML = categoriasIdioma.map((catNombre, i) => {
        const opciones = dictTemas[catNombre];
        const valor = opciones[temaIndices[i]] || TEMAS_I18N.es[CATEGORIAS_BASE[i]][temaIndices[i]];
        const locked = !!bloqueadosIdx[i];
        return '<div class="chip' + (locked ? ' locked' : '') + '" data-i="' + i + '">' +
               '<small>' + (locked ? '🔒 ' : '') + catNombre + '</small>' +
               '<span>' + valor + '</span></div>';
    }).join("");

    c.querySelectorAll(".chip").forEach(el => el.onclick = () => {
        const idx = Number(el.dataset.i);
        bloqueadosIdx[idx] = !bloqueadosIdx[idx];
        guardarTema(); pintarTema();
    });
}

$("gen").onclick = generarTema;
$("reset").onclick = reiniciar;
$("copiar").onclick = () => {
    if (!temaIndices) return;
    const dictTemas = TEMAS_I18N[idiomaActual] || TEMAS_I18N.es;
    const categoriasIdioma = Object.keys(dictTemas);
    const txt = categoriasIdioma.map((catNombre, i) => catNombre + ": " + dictTemas[catNombre][temaIndices[i]]).join("\n");
    const b = $("copiar");
    try {
        navigator.clipboard.writeText(txt).then(() => {
            b.textContent = t("btn_copiado");
            setTimeout(() => b.textContent = t("btn_copiar"), 1500);
        }, () => {});
    } catch (e) {}
};

/* ==========================================================
   SELECTOR DE IDIOMA GLOBAL (persiste tras cerrar la página)
   ========================================================== */
function ponerIdioma(l) {
    if (!["es", "ca", "en"].includes(l)) l = "es";
    idiomaActual = l;
    document.documentElement.lang = t("locale");

    try { localStorage.setItem("idioma", l); } catch (e) {}

    document.querySelectorAll(".idiomas button").forEach(b => b.classList.toggle("activo", b.dataset.lang === l));
    document.querySelectorAll(".idioma").forEach(d => d.hidden = d.dataset.lang !== l);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const texto = t(el.dataset.i18nTitle);
        el.title = texto;
        el.setAttribute("aria-label", texto);
    });

    cuentaAtras();
    actualizarSelects();
    mostrarJuegos();
    pintarTema();
    pintar();
}

document.querySelectorAll(".idiomas button").forEach(b => b.onclick = () => ponerIdioma(b.dataset.lang));

setInterval(pintar, 500);
document.addEventListener("visibilitychange", pintar);

/* ===== ARRANQUE ===== */
ponerIdioma(idiomaActual);
mostrar();

// --- Alarma y Audio de 20 segundos ---
const audio20s = new Audio("img/alerta20s.mp3"); // <-- Cambia "alerta20s.mp3" si tu archivo se llama distinto

function prepararAviso() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) {}
    try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
}

function sonar() {
    try {
        if (!audioCtx) return;
        for (let i = 0; i < 4; i++) {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
            const tAudio = audioCtx.currentTime + i * 0.6;
            g.gain.setValueAtTime(0.0001, tAudio);
            g.gain.exponentialRampToValueAtTime(0.4, tAudio + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, tAudio + 0.5);
            o.start(tAudio); o.stop(tAudio + 0.55);
        }
    } catch (e) {}
}

function avisar20Segundos() {
    if (!estado || estado.avisado20s) return;
    estado.avisado20s = true;
    guardar();
    try {
        audio20s.currentTime = 0;
        audio20s.play();
    } catch (e) {}
}

function avisar() {
    if (!estado || estado.avisado) return;
    estado.avisado = true; guardar(); sonar();
    try {
        if ("Notification" in window && Notification.permission === "granted")
            new Notification(t("tiempo_terminado"), { body: t("tiempo_terminado_body") });
    } catch (e) {}
}

// --- Temporizador ---
function iniciar() {
    const ahora = Date.now();
    estado = { inicio: ahora, fin: ahora + DURACION, avisado: false, avisado20s: false };
    prepararAviso(); guardar(); pintar();
}

function reiniciar() {
    estado = null;
    try {
        audio20s.pause();
        audio20s.currentTime = 0;
    } catch (e) {}
    guardar(); pintar();
}

function pintar() {
    const timeEl = $("time"), fechas = $("fechas");
    if (!estado) {
        timeEl.textContent = "03:00:00"; timeEl.classList.remove("done");
        $("fill").style.width = "0%";
        fechas.textContent = t("fechas_vacio");
        document.title = "Global Game Jam Neàpolis";
        return;
    }
    const resta = Math.max(0, estado.fin - Date.now()), s = Math.ceil(resta / 1000);
    timeEl.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
    $("fill").style.width = (100 - resta / DURACION * 100) + "%";
    fechas.innerHTML = t("fechas_inicio") + ": <b>" + fmt(estado.inicio) + "</b><br>" + t("fechas_fin") + ": <b>" + fmt(estado.fin) + "</b>";

    // Disparar audio de la carpeta img/ al llegar a 20 segundos
    if (s <= 20 && s > 0) {
        avisar20Segundos();
    }

    if (resta === 0) {
        timeEl.classList.add("done");
        document.title = t("tiempo_terminado");
        fechas.innerHTML += "<br><b>" + t("tiempo_terminado_body") + "</b>";
        avisar();
    } else {
        timeEl.classList.remove("done");
        document.title = timeEl.textContent + " · Game Jam";
    }
}
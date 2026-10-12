
"use strict";

/* =========================================================
   INVITACIÓN XV MARÍA SAMYRETH
   Lógica principal de la invitación
   ========================================================= */

/* 1. CONFIGURACIÓN GENERAL */

const CONFIG = {
    fechaEvento: "2026-11-28T13:00:00",
    fechaCalendario: "2026-11-28",

    whatsapp: "525545637772",

    mensajeWhatsApp:
        "Hola, soy {nombre}. Confirmo mi asistencia a los XV años de María Samyreth. ¡Muchas gracias por la invitación!",

    volumenInicial: 0.4,

    duracionApertura: 4500,

    imagenPrincipal: "assets/img/retrato-principal.jpg",

    fotosGaleria: [
        "assets/img/galeria-1.jpg",
        "assets/img/galeria-2.jpg",
        "assets/img/galeria-3.jpg"
    ],

    audio: "assets/audio/mariachi-instrumental.mp3"
};


/* 2. REFERENCIAS A ELEMENTOS DEL HTML */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

const intro = $("#intro");
const introEnvelope = $("#introEnvelope");
const introContent = $("#introContent");
const btnOpen = $("#btnOpen");
const mainContent = $("#mainContent");

const heroPortrait = $("#heroPortrait");
const portraitPlaceholder = $("#portraitPlaceholder");

const countdown = $("#countdown");
const daysElement = $("#days");
const hoursElement = $("#hours");
const minutesElement = $("#minutes");
const secondsElement = $("#seconds");
const countdownFinished = $("#countdownFinished");
const calendarButton = $("#calendarButton");

const gallerySlides = $$(".gallery-slide");
const galleryDots = $$(".gallery-dot");
const galleryPrev = $("#galleryPrev");
const galleryNext = $("#galleryNext");

const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
const lightboxClose = $("#lightboxClose");
const lightboxPrev = $("#lightboxPrev");
const lightboxNext = $("#lightboxNext");
const lightboxCounter = $("#lightboxCounter");

const backgroundMusic = $("#backgroundMusic");
const musicPlayer = $("#musicPlayer");
const musicToggle = $("#musicToggle");
const musicPlay = $("#musicPlay");
const musicVolume = $("#musicVolume");

const guestName = $("#guestName");
const btnRSVP = $("#btnRSVP");

const btnShare = $("#btnShare");
const btnCopyLink = $("#btnCopyLink");
const shareFeedback = $("#shareFeedback");

const backToTop = $("#backToTop");


/* 3. UTILIDADES */

function prefersReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}

function scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
    });
}

function setButtonMessage(element, message) {
    if (!element) return;

    element.textContent = message;
}


/* =========================================================
   4. APERTURA CINEMATOGRÁFICA
   ========================================================= */

let invitationOpened = false;
let openingInProgress = false;

function openInvitation() {
    if (invitationOpened || openingInProgress) return;

    openingInProgress = true;

    if (btnOpen) {
        btnOpen.disabled = true;
        btnOpen.setAttribute("aria-busy", "true");
    }

    if (intro) {
        intro.classList.add("is-opening");
    }

    /*
     * El contenido principal se habilita cuando comienza
     * la apertura, para que pueda recibir el foco.
     */
    if (mainContent) {
        mainContent.inert = false;
    }

    /*
     * Se intenta iniciar la música a partir de la
     * interacción real del usuario.
     */
    startMusic();

    const reducedMotion = prefersReducedMotion();

    const duration = reducedMotion
        ? 100
        : CONFIG.duracionApertura;

    window.setTimeout(() => {
        if (intro) {
            intro.classList.add("is-closing");
        }

        invitationOpened = true;
        openingInProgress = false;

        if (mainContent) {
            mainContent.inert = false;
            mainContent.focus({ preventScroll: true });
        }

        /*
         * El sobre desaparece visualmente, pero no se
         * destruye el estado de la portada.
         */
        if (intro) {
            window.setTimeout(() => {
                intro.hidden = true;
            }, reducedMotion ? 50 : 950);
        }

        if (btnOpen) {
            btnOpen.disabled = false;
            btnOpen.removeAttribute("aria-busy");
        }

        updateCountdown();
        updateBackToTop();

    }, duration);
}

if (btnOpen) {
    btnOpen.addEventListener("click", openInvitation);
}


/* =========================================================
   5. RETRATO PRINCIPAL Y MARCADORES TEMPORALES
   ========================================================= */

function setupMainPortrait() {
    if (!heroPortrait || !portraitPlaceholder) return;

    function showPlaceholder() {
        heroPortrait.hidden = true;
        portraitPlaceholder.hidden = false;
    }

    function showPortrait() {
        heroPortrait.hidden = false;
        portraitPlaceholder.hidden = true;
    }

    heroPortrait.addEventListener("load", showPortrait);

    heroPortrait.addEventListener("error", showPlaceholder);

    if (
        heroPortrait.complete &&
        heroPortrait.naturalWidth > 0
    ) {
        showPortrait();
    } else if (
        heroPortrait.complete &&
        heroPortrait.naturalWidth === 0
    ) {
        showPlaceholder();
    }
}

setupMainPortrait();


/* =========================================================
   6. CUENTA REGRESIVA
   ========================================================= */

/*
 * La fecha se interpreta en la zona horaria local del
 * dispositivo que abre la invitación.
 *
 * En esta invitación, el evento está programado para
 * el 28 de noviembre de 2026 a la 1:00 p. m.
 */

const eventDate = new Date(CONFIG.fechaEvento).getTime();

let countdownInterval = null;

function updateCountdown() {
    if (
        !countdown ||
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
    ) {
        return;
    }

    const now = Date.now();
    const difference = eventDate - now;

    if (difference <= 0) {
        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        countdown.hidden = true;

        if (countdownFinished) {
            countdownFinished.hidden = false;
        }

        if (calendarButton) {
            calendarButton.hidden = true;
        }

        if (countdownInterval !== null) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        return;
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);

    const hours = Math.floor(
        (totalSeconds % 86400) / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");

    countdown.hidden = false;

    if (countdownFinished) {
        countdownFinished.hidden = true;
    }

    if (calendarButton) {
        calendarButton.hidden = false;
    }
}

function startCountdown() {
    updateCountdown();

    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
    }

    countdownInterval = window.setInterval(
        updateCountdown,
        1000
    );
}

startCountdown();


/* =========================================================
   7. ANIMACIONES DE APARICIÓN DE LAS SECCIONES
   ========================================================= */

function setupRevealAnimations() {
    const revealElements = $$(".reveal");

    if (
        prefersReducedMotion() ||
        !("IntersectionObserver" in window)
    ) {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

setupRevealAnimations();


/* =========================================================
   8. GALERÍA Y CARRUSEL
   ========================================================= */

let currentGalleryIndex = 0;
let currentLightboxIndex = 0;

function getValidGallerySlides() {
    return gallerySlides.filter(slide => {
        const image = $("img", slide);

        return image &&
            image.getAttribute("src") &&
            image.getAttribute("src").trim() !== "";
    });
}

function normalizeGalleryIndex(index) {
    const total = gallerySlides.length;

    if (total === 0) return 0;

    return (index + total) % total;
}

function updateGallery(index) {
    if (gallerySlides.length === 0) return;

    currentGalleryIndex = normalizeGalleryIndex(index);

    gallerySlides.forEach((slide, i) => {
        const active = i === currentGalleryIndex;

        slide.classList.toggle("is-active", active);

        slide.setAttribute(
            "aria-current",
            active ? "true" : "false"
        );
    });

    galleryDots.forEach((dot, i) => {
        const active = i === currentGalleryIndex;

        dot.classList.toggle("is-active", active);

        if (active) {
            dot.setAttribute("aria-current", "true");
        } else {
            dot.removeAttribute("aria-current");
        }
    });
}

if (galleryPrev) {
    galleryPrev.addEventListener("click", () => {
        updateGallery(currentGalleryIndex - 1);
    });
}

if (galleryNext) {
    galleryNext.addEventListener("click", () => {
        updateGallery(currentGalleryIndex + 1);
    });
}

galleryDots.forEach(dot => {
    dot.addEventListener("click", () => {
        const index = Number(dot.dataset.galleryIndex);

        if (Number.isInteger(index)) {
            updateGallery(index);
        }
    });
});

gallerySlides.forEach(slide => {
    slide.addEventListener("click", () => {
        const index = Number(slide.dataset.galleryIndex);

        if (Number.isInteger(index)) {
            openLightbox(index);
        }
    });
});

updateGallery(0);


/* =========================================================
   9. VISOR AMPLIADO DE FOTOGRAFÍAS
   ========================================================= */

function getGalleryImage(index) {
    const slide = gallerySlides[index];

    if (!slide) return null;

    return $("img", slide);
}

function updateLightbox(index) {
    if (!lightboxImage || gallerySlides.length === 0) return;

    currentLightboxIndex = normalizeGalleryIndex(index);

    const image = getGalleryImage(currentLightboxIndex);

    if (!image) return;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "Fotografía de María Samyreth";

    if (lightboxCounter) {
        lightboxCounter.textContent =
            `${currentLightboxIndex + 1} / ${gallerySlides.length}`;
    }
}

function openLightbox(index) {
    if (!lightbox) return;

    updateLightbox(index);

    if (typeof lightbox.showModal === "function") {
        if (!lightbox.open) {
            lightbox.showModal();
        }
    } else {
        lightbox.setAttribute("open", "");
    }
}

function closeLightbox() {
    if (!lightbox) return;

    if (typeof lightbox.close === "function" && lightbox.open) {
        lightbox.close();
    } else {
        lightbox.removeAttribute("open");
    }
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => {
        updateLightbox(currentLightboxIndex - 1);
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
        updateLightbox(currentLightboxIndex + 1);
    });
}

if (lightbox) {
    lightbox.addEventListener("click", event => {
        /*
         * Permite cerrar al pulsar fuera de la imagen.
         */
        if (event.target === lightbox) {
            closeLightbox();
        }
    });
}

/*
 * Navegación con flechas de teclado cuando el visor
 * está abierto.
 */
document.addEventListener("keydown", event => {
    if (!lightbox || !lightbox.open) return;

    if (event.key === "ArrowLeft") {
        updateLightbox(currentLightboxIndex - 1);
    }

    if (event.key === "ArrowRight") {
        updateLightbox(currentLightboxIndex + 1);
    }

    if (event.key === "Escape") {
        closeLightbox();
    }
});


/* =========================================================
   10. REPRODUCTOR MUSICAL
   ========================================================= */

if (backgroundMusic) {
    backgroundMusic.volume = CONFIG.volumenInicial;
}

if (musicVolume && backgroundMusic) {
    musicVolume.value = String(CONFIG.volumenInicial);

    musicVolume.addEventListener("input", () => {
        const volume = Number(musicVolume.value);

        backgroundMusic.volume = Math.min(
            1,
            Math.max(0, volume)
        );
    });
}

function updateMusicControls() {
    if (!backgroundMusic) return;

    const playing = !backgroundMusic.paused;

    if (musicPlayer) {
        musicPlayer.classList.toggle("is-playing", playing);
    }

    if (musicToggle) {
        musicToggle.setAttribute(
            "aria-pressed",
            playing ? "true" : "false"
        );

        musicToggle.setAttribute(
            "aria-label",
            playing ? "Pausar música" : "Reproducir música"
        );
    }

    if (musicPlay) {
        musicPlay.innerHTML = playing
            ? '<i class="fa-solid fa-pause" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-play" aria-hidden="true"></i>';

        musicPlay.setAttribute(
            "aria-label",
            playing ? "Pausar música" : "Reproducir música"
        );
    }
}

async function startMusic() {
    if (!backgroundMusic) return;

    try {
        await backgroundMusic.play();
        updateMusicControls();
    } catch (error) {
        /*
         * Algunos navegadores pueden bloquear la
         * reproducción automática. El usuario podrá
         * iniciar la música manualmente.
         */
        updateMusicControls();

        if (musicPlayer) {
            musicPlayer.classList.add("is-expanded");
        }
    }
}

function pauseMusic() {
    if (!backgroundMusic) return;

    backgroundMusic.pause();
    updateMusicControls();
}

function toggleMusic() {
    if (!backgroundMusic) return;

    if (backgroundMusic.paused) {
        startMusic();
    } else {
        pauseMusic();
    }
}

if (musicToggle) {
    musicToggle.addEventListener("click", () => {
        if (musicPlayer) {
            musicPlayer.classList.toggle("is-expanded");
        }

        toggleMusic();
    });
}

if (musicPlay) {
    musicPlay.addEventListener("click", toggleMusic);
}

if (backgroundMusic) {
    backgroundMusic.addEventListener(
        "play",
        updateMusicControls
    );

    backgroundMusic.addEventListener(
        "pause",
        updateMusicControls
    );

    backgroundMusic.addEventListener(
        "ended",
        updateMusicControls
    );

    backgroundMusic.addEventListener("error", () => {
        if (musicPlayer) {
            musicPlayer.classList.add("is-expanded");
        }

        updateMusicControls();
    });
}

updateMusicControls();


/* =========================================================
   11. CONFIRMACIÓN POR WHATSAPP
   ========================================================= */

function buildWhatsAppMessage(name) {
    return CONFIG.mensajeWhatsApp.replace(
        "{nombre}",
        name.trim()
    );
}

function openWhatsAppConfirmation() {
    if (!guestName || !btnRSVP) return;

    const name = guestName.value.trim();

    if (!name) {
        guestName.setCustomValidity(
            "Escribe tu nombre para confirmar tu asistencia."
        );

        guestName.reportValidity();
        guestName.focus();

        return;
    }

    guestName.setCustomValidity("");

    const message = buildWhatsAppMessage(name);

    const whatsappURL =
        "https://wa.me/" +
        CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(message);

    /*
     * Se abre directamente a partir de la interacción
     * del usuario, sin enviar información a un servidor.
     */
    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}

if (guestName) {
    guestName.addEventListener("input", () => {
        guestName.setCustomValidity("");
    });
}

if (btnRSVP) {
    btnRSVP.addEventListener(
        "click",
        openWhatsAppConfirmation
    );
}


/* =========================================================
   12. DESCARGA DEL CALENDARIO .ICS
   ========================================================= */

/*
 * El evento se guarda como un único evento con inicio
 * a las 13:00 y fin estimado a las 16:00.
 *
 * La recepción empieza a las 15:30. Si posteriormente
 * se confirma la duración de la ceremonia o de la
 * recepción, podremos ajustar el calendario.
 */

function escapeICS(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function formatICSLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function downloadCalendar() {
    const start = new Date(CONFIG.fechaEvento);

    /*
     * Fin provisional del evento: 16:00 horas.
     */
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const now = new Date();

    const stamp =
        now.getUTCFullYear() +
        String(now.getUTCMonth() + 1).padStart(2, "0") +
        String(now.getUTCDate()).padStart(2, "0") +
        "T" +
        String(now.getUTCHours()).padStart(2, "0") +
        String(now.getUTCMinutes()).padStart(2, "0") +
        String(now.getUTCSeconds()).padStart(2, "0") +
        "Z";

    const uid =
        "xv-maria-samyreth-20261128@mis-xv-maria-samyreth";

    const description = [
        "XV años de María Samyreth.",
        "Ceremonia: Capilla de San Simón, Tejupilco, Estado de México, 13:00.",
        "Recepción: Jardín de Fiestas La Providencia (Dichos), Tejupilco, Estado de México, 15:30.",
        "Consulta la invitación para ver los detalles."
    ].join("\n");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Maria Samyreth//XV Anos//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${formatICSLocalDate(start)}`,
        `DTEND:${formatICSLocalDate(end)}`,
        `SUMMARY:${escapeICS("XV años de María Samyreth")}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `LOCATION:${escapeICS("Tejupilco, Estado de México")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob(
        [icsContent],
        {
            type: "text/calendar;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "XV-Maria-Samyreth.ics";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

if (calendarButton) {
    calendarButton.removeAttribute("download");

    calendarButton.addEventListener("click", event => {
        event.preventDefault();
        downloadCalendar();
    });
}


/* =========================================================
   13. COMPARTIR LA INVITACIÓN
   ========================================================= */

function showShareFeedback(message) {
    if (!shareFeedback) return;

    shareFeedback.textContent = message;
}

async function shareInvitation() {
    const shareData = {
        title: "Mis XV años | María Samyreth",
        text: "Te invito a celebrar mis XV años. ¡Me encantará compartir esta noche contigo!",
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showShareFeedback("Invitación compartida.");
        } catch (error) {
            /*
             * El usuario puede cancelar el menú de compartir.
             * No mostramos un error si simplemente lo cerró.
             */
            if (error.name !== "AbortError") {
                showShareFeedback(
                    "No fue posible abrir el menú de compartir."
                );
            }
        }

        return;
    }

    copyInvitationLink();
}

async function copyInvitationLink() {
    const url = window.location.href;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
        } else {
            /*
             * Alternativa para entornos sin Clipboard API.
             */
            const temporaryInput =
                document.createElement("textarea");

            temporaryInput.value = url;
            temporaryInput.setAttribute("readonly", "");
            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";

            document.body.appendChild(temporaryInput);
            temporaryInput.select();

            const copied = document.execCommand("copy");

            temporaryInput.remove();

            if (!copied) {
                throw new Error("No se pudo copiar el enlace.");
            }
        }

        showShareFeedback("Enlace copiado correctamente.");

    } catch (error) {
        showShareFeedback(
            "No se pudo copiar automáticamente. Copia el enlace desde la barra del navegador."
        );
    }
}

if (btnShare) {
    btnShare.addEventListener("click", shareInvitation);
}

if (btnCopyLink) {
    btnCopyLink.addEventListener(
        "click",
        copyInvitationLink
    );
}


/* =========================================================
   14. BOTÓN VOLVER ARRIBA
   ========================================================= */

function updateBackToTop() {
    if (!backToTop) return;

    const shouldShow =
        invitationOpened &&
        window.scrollY > 400;

    backToTop.hidden = !shouldShow;
}

window.addEventListener(
    "scroll",
    updateBackToTop,
    { passive: true }
);

if (backToTop) {
    backToTop.addEventListener("click", () => {
        scrollToElement($("#inicio"));
    });
}


/* =========================================================
   15. NAVEGACIÓN Y COMPORTAMIENTO INICIAL
   ========================================================= */

$$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = $(href);

        if (!target) return;

        /*
         * No permitir saltar a la invitación antes
         * de abrir el sobre.
         */
        if (!invitationOpened && intro && !intro.hidden) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        scrollToElement(target);
    });
});


/* =========================================================
   16. ESTADO INICIAL
   ========================================================= */

function initializeInvitation() {
    /*
     * La invitación comienza cerrada, mostrando el sobre.
     */
    if (mainContent) {
        mainContent.inert = true;
    }

    if (intro) {
        intro.hidden = false;
        intro.classList.remove("is-opening", "is-closing");
    }

    if (introContent) {
        introContent.style.opacity = "";
    }

    if (introEnvelope) {
        introEnvelope.style.opacity = "";
    }

    if (btnOpen) {
        btnOpen.disabled = false;
        btnOpen.removeAttribute("aria-busy");
    }

    if (backToTop) {
        backToTop.hidden = true;
    }

    if (backgroundMusic) {
        backgroundMusic.volume = CONFIG.volumenInicial;
    }

    updateCountdown();
    updateMusicControls();
}

initializeInvitation();


/* =========================================================
   FIN DE LA LÓGICA PRINCIPAL
   ========================================================= */

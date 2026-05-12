/* =============================================
   BRUSCO ESTUDIO — script.js

   CONTENIDO:
   1. Palabras animadas (sección Nosotros)
   2. Header con fondo al hacer scroll
   3. Marquee — duplicación automática para el loop
   4. Smooth scroll con easing mejorado
   5. Formulario — feedback visual al enviar (DEMO)
   ============================================= */


/* =============================================
   1. PALABRAS ANIMADAS
   Para cambiar las palabras que rotan:
   editar el array "palabrasAnimadas" a continuación.
   Para cambiar el tiempo entre palabras: editar INTERVALO_MS.
   ============================================= */
const palabrasAnimadas = [
    'BRUSCO',
    'RADICAL',
    'DISRUPTIVO',
    'NECESARIO',
    'DISTINTO',
    'REAL',
];

const INTERVALO_MS = 2400; // tiempo entre cada cambio de palabra (milisegundos)

let indicePalabra = 0;
const elPalabra = document.getElementById('palabra-animada');

function cambiarPalabra() {
    // Fase 1: la palabra actual sube y desaparece
    elPalabra.classList.add('saliendo');

    setTimeout(() => {
        // Fase 2: cambiar texto y posicionar debajo (sin transición)
        indicePalabra = (indicePalabra + 1) % palabrasAnimadas.length;
        elPalabra.textContent = palabrasAnimadas[indicePalabra];

        elPalabra.classList.remove('saliendo');
        elPalabra.classList.add('entrando');

        // Forzar reflow para que el navegador registre el estado inicial antes de animar
        elPalabra.getBoundingClientRect();

        // Fase 3: la nueva palabra sube hasta su posición normal
        elPalabra.classList.remove('entrando');

    }, 480); // debe coincidir con la duración de la transición en styles.css
}

setInterval(cambiarPalabra, INTERVALO_MS);


/* =============================================
   2. HEADER — fondo al hacer scroll
   Para cambiar el punto de activación: editar SCROLL_TRIGGER (en píxeles).
   ============================================= */
const SCROLL_TRIGGER = 60; // píxeles de scroll antes de activar el fondo

const elHeader = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > SCROLL_TRIGGER) {
        elHeader.classList.add('scrolled');
    } else {
        elHeader.classList.remove('scrolled');
    }
}, { passive: true });


/* =============================================
   3. MARQUEE — duplicación automática
   Clona el grupo de logos para que el loop sea infinito y sin saltos.
   No es necesario editar esta función.
   ============================================= */
function iniciarMarquee() {
    const grupo    = document.getElementById('marquee-group');
    const belt     = document.querySelector('.marquee__belt');
    if (!grupo || !belt) return;

    // Crear copia idéntica del grupo y añadirla al final
    const clon = grupo.cloneNode(true);
    clon.removeAttribute('id');
    clon.setAttribute('aria-hidden', 'true');
    belt.appendChild(clon);
}

iniciarMarquee();


/* =============================================
   4. SMOOTH SCROLL
   Intercepta los clicks en links tipo href="#seccion"
   y aplica un scroll suave descontando la altura del header.
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const destino = link.getAttribute('href');
        if (destino === '#') return; // link al top: comportamiento normal

        e.preventDefault();

        const seccion = document.querySelector(destino);
        if (!seccion) return;

        const offsetHeader = document.getElementById('header').offsetHeight;
        const top = seccion.getBoundingClientRect().top + window.scrollY - offsetHeader;

        window.scrollTo({ top, behavior: 'smooth' });
    });
});


/* =============================================
   5. TRANSICIÓN DE COLOR — Proyectos (blanco) y Contacto (oscuro)
   Coordina dos observers para que cada sección tenga su color.
   Para ajustar qué tan pronto se activa: editar threshold (0 a 1)
   ============================================= */
let proyectosVisible = false;
let contactoVisible  = false;

function actualizarFondo() {
    if (contactoVisible) {
        document.body.classList.remove('modo-blanco');
        document.body.classList.add('modo-oscuro');
    } else if (proyectosVisible) {
        document.body.classList.remove('modo-oscuro');
        document.body.classList.add('modo-blanco');
    } else {
        document.body.classList.remove('modo-blanco', 'modo-oscuro');
    }
}

const seccionProyectos = document.getElementById('proyectos');
const seccionContacto  = document.getElementById('contacto');

if (seccionProyectos) {
    new IntersectionObserver(entries => {
        proyectosVisible = entries[0].isIntersecting;
        actualizarFondo();
    }, { threshold: 0.08 }).observe(seccionProyectos);
}

if (seccionContacto) {
    new IntersectionObserver(entries => {
        contactoVisible = entries[0].isIntersecting;
        actualizarFondo();
    }, { threshold: 0.08 }).observe(seccionContacto);
}


/* =============================================
   6. FORMULARIO — envío real a Formspree con feedback visual
   Usa fetch para enviar sin recargar la página.
   Si querés cambiar el email de destino: hacelo en formspree.io
   ============================================= */
const elForm  = document.getElementById('contacto-form');
const elBoton = elForm ? elForm.querySelector('.form__submit') : null;

if (elForm && elBoton) {
    elForm.addEventListener('submit', async e => {
        e.preventDefault();

        const textoOriginal = elBoton.textContent;
        elBoton.textContent = 'Enviando...';
        elBoton.disabled = true;

        try {
            const respuesta = await fetch(elForm.action, {
                method: 'POST',
                body: new FormData(elForm),
                headers: { 'Accept': 'application/json' }
            });

            if (respuesta.ok) {
                // Éxito: mostrar confirmación y limpiar el form
                elBoton.textContent = 'Mensaje enviado ✓';
                elForm.reset();
                setTimeout(() => {
                    elBoton.textContent = textoOriginal;
                    elBoton.disabled = false;
                }, 4000);
            } else {
                // Error de Formspree
                elBoton.textContent = 'Error al enviar. Intentá de nuevo.';
                elBoton.disabled = false;
            }
        } catch {
            // Error de red
            elBoton.textContent = 'Error de conexión. Intentá de nuevo.';
            elBoton.disabled = false;
        }
    });
}

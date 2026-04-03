// ============================================
// SCROLL.JS
// 1. Navbar : devient compacte au scroll
// 2. Fade-in : elements avec .fade-in apparaissent
//    en douceur (statiques ET injectes dynamiquement)
// 3. Bouton retour en haut
// 4. Compteurs animes pour la section stats
// ============================================

var observateurFadeIn = null;

// --- 1. Effet navbar au scroll ---
function initialiserScrollNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 60) {
            navbar.classList.add('navbar--scrollee');
        } else {
            navbar.classList.remove('navbar--scrollee');
        }
    });
}

// --- 2. Fade-in des elements ---
// Peut etre appele plusieurs fois pour observer les elements
// injectes dynamiquement apres le chargement initial.
function observerFadeIn(conteneur) {
    if (!observateurFadeIn) return;
    var cible = conteneur || document;
    var elements = cible.querySelectorAll('.fade-in:not(.visible)');
    elements.forEach(function(el) {
        observateurFadeIn.observe(el);
    });
}

function initialiserFadeIn() {
    observateurFadeIn = new IntersectionObserver(function(entrees) {
        entrees.forEach(function(entree) {
            if (entree.isIntersecting) {
                entree.target.classList.add('visible');
                observateurFadeIn.unobserve(entree.target);
            }
        });
    }, { threshold: 0.12 });

    observerFadeIn();
}

// --- 3. Bouton retour en haut ---
function initialiserRetourHaut() {
    var btn = document.createElement('button');
    btn.className = 'btn-retour-haut';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.innerHTML = '&#8679;';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
        btn.classList.toggle('visible', window.scrollY > 300);
    });

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- 4. Compteurs animes (section stats) ---
function initialiserCompteursAnimes() {
    var compteurs = document.querySelectorAll('.stat-nombre[data-cible]');
    if (compteurs.length === 0) return;

    var obs = new IntersectionObserver(function(entrees) {
        entrees.forEach(function(entree) {
            if (!entree.isIntersecting) return;
            var el = entree.target;
            var cible = parseInt(el.getAttribute('data-cible'));
            var debut = 0;
            var pas = Math.max(1, Math.ceil(cible / 60));
            var intervalle = setInterval(function() {
                debut += pas;
                if (debut >= cible) {
                    debut = cible;
                    clearInterval(intervalle);
                }
                el.textContent = debut;
            }, 20);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    compteurs.forEach(function(c) { obs.observe(c); });
}

document.addEventListener('DOMContentLoaded', function() {
    initialiserScrollNavbar();
    initialiserFadeIn();
    initialiserRetourHaut();
    initialiserCompteursAnimes();
});

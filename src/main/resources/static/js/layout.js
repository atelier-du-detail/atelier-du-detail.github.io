// ============================================
// LAYOUT.JS
// Header et footer partages sur toutes les pages.
// ============================================

var LIENS_NAV = [
    { href: 'index.html',    label: 'Accueil' },
    { href: 'catalogue.html', label: 'Catalogue' },
    { href: 'contact.html',  label: 'Contact' }
];

function estActif(href) {
    var chemin = window.location.pathname;
    var nom = chemin.substring(chemin.lastIndexOf('/') + 1);
    if (nom === '' || nom === '/') nom = 'index.html';
    return nom === href;
}

function construireNav() {
    var liens = LIENS_NAV.map(function(lien) {
        var classe = estActif(lien.href) ? ' class="actif"' : '';
        return '<li><a href="' + lien.href + '"' + classe + '>' + lien.label + '</a></li>';
    }).join('');

    return [
        '<div class="barre-annonce">',
        '    <p>Livraison offerte en France metropolitaine des 60 &#8364;</p>',
        '</div>',
        '<nav class="navbar" id="navbar">',
        '    <a href="index.html" class="logo">',
        '        <span class="logo-principal">L\'Atelier</span>',
        '        <span class="logo-secondaire">du Detail</span>',
        '    </a>',
        '    <ul class="nav-liens">' + liens + '</ul>',
        '    <div class="nav-icones">',
        '        <a href="favoris.html" class="icone-nav" title="Mes favoris">',
        '            &#9825; <span id="favoris-compteur" class="nav-badge">0</span>',
        '        </a>',
        '        <a href="panier.html" class="panier-icone" id="lien-panier">',
        '            Panier (<span id="panier-compteur">0</span>)',
        '        </a>',
        '    </div>',
        '    <button class="burger" id="burger" aria-label="Menu">',
        '        <span></span><span></span><span></span>',
        '    </button>',
        '</nav>',
        '<div class="nav-mobile" id="nav-mobile">',
        '    <ul>' + liens + '</ul>',
        '    <div style="display:flex;gap:1rem;flex-direction:column;align-items:center">',
        '        <a href="favoris.html" class="panier-icone">Favoris (<span class="favoris-compteur-mobile">0</span>)</a>',
        '        <a href="panier.html" class="panier-icone">Panier (<span class="panier-compteur-mobile">0</span>)</a>',
        '    </div>',
        '</div>'
    ].join('');
}

function construireFooter() {
    return [
        '<footer class="footer">',
        '    <div class="footer-newsletter">',
        '        <h3>Restez inspires</h3>',
        '        <p>Nouvelles collections, offres exclusives — directement dans votre boite mail.</p>',
        '        <form class="newsletter-form" onsubmit="soumettreNewsletter(event)">',
        '            <input type="email" class="newsletter-input" placeholder="Votre adresse email" required>',
        '            <button type="submit" class="newsletter-btn">S\'inscrire</button>',
        '        </form>',
        '    </div>',
        '    <div class="footer-grille">',
        '        <div class="footer-bloc">',
        '            <h4 class="footer-logo">L\'Atelier du Detail</h4>',
        '            <p>Des accessoires feminins selectionnes avec soin, pour sublimer chaque detail de votre style.</p>',
        '        </div>',
        '        <div class="footer-bloc">',
        '            <h4>Navigation</h4>',
        '            <ul>',
        '                <li><a href="index.html">Accueil</a></li>',
        '                <li><a href="catalogue.html">Catalogue</a></li>',
        '                <li><a href="favoris.html">Mes favoris</a></li>',
        '                <li><a href="contact.html">Contact</a></li>',
        '            </ul>',
        '        </div>',
        '        <div class="footer-bloc">',
        '            <h4>Collections</h4>',
        '            <ul>',
        '                <li><a href="catalogue.html?categorie=bracelet">Bracelets</a></li>',
        '                <li><a href="catalogue.html?categorie=collier">Colliers</a></li>',
        '                <li><a href="catalogue.html?categorie=foulard">Foulards</a></li>',
        '            </ul>',
        '        </div>',
        '        <div class="footer-bloc">',
        '            <h4>Contact</h4>',
        '            <p>contact@latelierdudetail.fr</p>',
        '            <p>Lundi &#8212; Vendredi</p>',
        '            <p>9h &#8212; 18h</p>',
        '        </div>',
        '    </div>',
        '    <div class="footer-bas">',
        '        <p>&#169; 2025 L\'Atelier du Detail. Tous droits reserves.</p>',
        '    </div>',
        '</footer>'
    ].join('');
}

function soumettreNewsletter(e) {
    e.preventDefault();
    var form = e.target;
    var input = form.querySelector('.newsletter-input');
    input.value = '';
    input.placeholder = 'Merci pour votre inscription !';
    form.querySelector('.newsletter-btn').textContent = 'Inscrit';
    form.querySelector('.newsletter-btn').disabled = true;
}

function initialiserBurger() {
    var burger    = document.getElementById('burger');
    var navMobile = document.getElementById('nav-mobile');
    if (!burger) return;
    burger.addEventListener('click', function() {
        var ouvert = navMobile.classList.toggle('ouvert');
        burger.classList.toggle('ouvert', ouvert);
    });
}

function initialiserCompteurs() {
    var panier = getPanierCount();
    var el = document.getElementById('panier-compteur');
    if (el) el.textContent = panier;
    document.querySelectorAll('.panier-compteur-mobile').forEach(function(e) { e.textContent = panier; });

    var favoris = (typeof getFavorisCount === 'function') ? getFavorisCount() : 0;
    var elF = document.getElementById('favoris-compteur');
    if (elF) elF.textContent = favoris;
    document.querySelectorAll('.favoris-compteur-mobile').forEach(function(e) { e.textContent = favoris; });

    // Masquer les badges si vide
    if (elF) elF.style.display = favoris === 0 ? 'none' : 'inline-block';
}

function initialiserLayout() {
    var headerEl = document.getElementById('header-container');
    var footerEl = document.getElementById('footer-container');
    if (headerEl) headerEl.innerHTML = construireNav();
    if (footerEl) footerEl.innerHTML = construireFooter();
    initialiserBurger();
    initialiserCompteurs();
}

document.addEventListener('DOMContentLoaded', initialiserLayout);

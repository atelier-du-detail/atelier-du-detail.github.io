// ============================================
// PRODUIT-PAGE.JS
// Affiche la fiche complete d'un produit.
// URL : produit.html?id=3
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var params  = new URLSearchParams(window.location.search);
    var id      = parseInt(params.get('id'));

    if (!id || isNaN(id)) { afficherErreur(); return; }

    var produit = null;
    for (var i = 0; i < PRODUITS.length; i++) {
        if (PRODUITS[i].id === id) { produit = PRODUITS[i]; break; }
    }

    if (!produit) { afficherErreur(); return; }

    document.title = produit.nom + ' — L\'Atelier du Detail';
    afficherProduit(produit);
    afficherProduitsRelies(produit);
});

// ============================================
// AFFICHAGE FICHE PRODUIT
// ============================================

function afficherProduit(produit) {
    var rupture    = produit.stock === 0;
    var stockFaible = produit.stock > 0 && produit.stock <= 3;
    var favori      = estFavori(produit.id);

    var badgeStock = '';
    if (rupture)     badgeStock = '<span class="produit-badge-stock produit-badge-stock--rouge">Epuise</span>';
    else if (stockFaible) badgeStock = '<span class="produit-badge-stock produit-badge-stock--orange">Plus que ' + produit.stock + ' en stock</span>';
    else             badgeStock = '<span class="produit-badge-stock produit-badge-stock--vert">En stock</span>';

    var conteneur = document.getElementById('produit-contenu');
    conteneur.innerHTML = [
        '<nav class="fil-ariane fade-in">',
        '    <a href="index.html">Accueil</a>',
        '    <span class="fil-separateur">›</span>',
        '    <a href="catalogue.html">Catalogue</a>',
        '    <span class="fil-separateur">›</span>',
        '    <span>' + produit.nom + '</span>',
        '</nav>',

        '<div class="produit-detail fade-in">',

        '    <div class="produit-image-grande produit-image-grande--' + produit.categorie + '">',
        '        <span class="produit-image-label">' + produit.categorie + '</span>',
        '    </div>',

        '    <div class="produit-info">',
        '        <div class="produit-info-entete">',
        '            <span class="carte-produit-categorie">' + produit.categorie + '</span>',
        '            <button class="btn-coeur-produit' + (favori ? ' actif' : '') + '" id="btn-favori" title="Ajouter aux favoris">',
        '                ' + (favori ? '&#9829;' : '&#9825;'),
        '            </button>',
        '        </div>',

        '        <h1 class="produit-nom">' + produit.nom + '</h1>',
        '        <p class="produit-prix-detail">' + produit.prix.toFixed(2) + ' &#8364;</p>',
        '        <p class="produit-tva">TVA incluse</p>',

        '        ' + badgeStock,

        '        <p class="produit-description-detail">' + produit.description + '</p>',

        '        <div class="produit-actions">',
        '            <div class="produit-quantite-wrapper">',
        '                <label class="produit-label">Quantite</label>',
        '                <div class="panier-article-quantite">',
        '                    <button class="btn-quantite" id="btn-moins">&#8722;</button>',
        '                    <span class="valeur-quantite" id="valeur-qte">1</span>',
        '                    <button class="btn-quantite" id="btn-plus">&#43;</button>',
        '                </div>',
        '            </div>',
        '            <button class="btn-commander produit-btn-panier"' + (rupture ? ' disabled' : '') + ' id="btn-panier">',
        '                ' + (rupture ? 'Produit epuise' : 'Ajouter au panier'),
        '            </button>',
        '        </div>',

        '        <div class="produit-garanties">',
        '            <div class="produit-garantie"><span class="garantie-point"></span>Livraison offerte des 60 &#8364;</div>',
        '            <div class="produit-garantie"><span class="garantie-point"></span>Retours gratuits sous 14 jours</div>',
        '            <div class="produit-garantie"><span class="garantie-point"></span>Paiement 100% securise</div>',
        '        </div>',
        '    </div>',
        '</div>',

        '<div id="section-relies"></div>'
    ].join('');

    initialiserActionsPage(produit, rupture);

    setTimeout(function() {
        document.querySelectorAll('#produit-contenu .fade-in').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 80);
}

function initialiserActionsPage(produit, rupture) {
    var quantite = 1;
    var btnMoins = document.getElementById('btn-moins');
    var btnPlus  = document.getElementById('btn-plus');
    var valeurEl = document.getElementById('valeur-qte');

    btnMoins.addEventListener('click', function() {
        if (quantite > 1) { quantite--; valeurEl.textContent = quantite; }
    });

    btnPlus.addEventListener('click', function() {
        if (quantite < 10) { quantite++; valeurEl.textContent = quantite; }
    });

    if (!rupture) {
        var btnPanier = document.getElementById('btn-panier');
        btnPanier.addEventListener('click', function() {
            for (var i = 0; i < quantite; i++) { ajouterAuPanier(produit); }

            var compteur = document.getElementById('panier-compteur');
            if (compteur) compteur.textContent = getPanierCount();

            btnPanier.textContent = 'Ajoute !';
            btnPanier.style.backgroundColor = 'var(--or)';
            setTimeout(function() {
                btnPanier.textContent = 'Ajouter au panier';
                btnPanier.style.backgroundColor = '';
            }, 2000);
        });
    }

    var btnFavori = document.getElementById('btn-favori');
    btnFavori.addEventListener('click', function() {
        var maintenant = toggleFavori(produit.id);
        btnFavori.classList.toggle('actif', maintenant);
        btnFavori.innerHTML = maintenant ? '&#9829;' : '&#9825;';
        var cpt = document.getElementById('favoris-compteur');
        if (cpt) cpt.textContent = getFavorisCount();
    });
}

// ============================================
// PRODUITS RELIES
// ============================================

function afficherProduitsRelies(produitActuel) {
    var relies = [];
    for (var i = 0; i < PRODUITS.length; i++) {
        if (PRODUITS[i].categorie === produitActuel.categorie && PRODUITS[i].id !== produitActuel.id) {
            relies.push(PRODUITS[i]);
            if (relies.length === 3) break;
        }
    }

    if (relies.length === 0) return;

    var cartes = relies.map(function(p) {
        return [
            '<a href="produit.html?id=' + p.id + '" class="carte-relie fade-in">',
            '    <div class="carte-produit-image carte-produit-image--' + p.categorie + '"></div>',
            '    <div class="carte-relie-info">',
            '        <span class="carte-produit-nom">' + p.nom + '</span>',
            '        <span class="carte-produit-prix">' + p.prix.toFixed(2) + ' &#8364;</span>',
            '    </div>',
            '</a>'
        ].join('');
    }).join('');

    var section = document.getElementById('section-relies');
    section.innerHTML =
        '<div class="produits-relies">' +
            '<h2 class="titre-section fade-in">Dans la meme collection</h2>' +
            '<span class="titre-section-trait fade-in"></span>' +
            '<div class="relies-grille">' + cartes + '</div>' +
        '</div>';

    setTimeout(function() {
        section.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
    }, 300);
}

// ============================================
// ERREUR
// ============================================

function afficherErreur() {
    document.getElementById('produit-contenu').innerHTML =
        '<div class="produit-erreur">' +
            '<p>Ce produit est introuvable.</p>' +
            '<a href="catalogue.html" class="btn-principal">Retour au catalogue</a>' +
        '</div>';
}

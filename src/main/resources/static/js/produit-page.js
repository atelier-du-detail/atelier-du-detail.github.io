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
    var aDesVariantes = Array.isArray(produit.variantes) && produit.variantes.length > 0;

    // Variante selectionnee initiale : la premiere en stock, sinon la premiere si toutes en rupture.
    var varianteIndex = -1;
    if (aDesVariantes) {
        for (var k = 0; k < produit.variantes.length; k++) {
            if ((produit.variantes[k].stock || 0) > 0) { varianteIndex = k; break; }
        }
        if (varianteIndex === -1) varianteIndex = 0;
    }

    var stockEffectif = aDesVariantes
        ? (produit.variantes[varianteIndex].stock || 0)
        : produit.stock;

    var rupture     = stockEffectif === 0;
    var stockFaible = stockEffectif > 0 && stockEffectif <= 3;
    var favori      = estFavori(produit.id);

    var badgeStock = '';
    if (rupture)          badgeStock = '<span class="produit-badge-stock produit-badge-stock--rouge" id="badge-stock">Epuise</span>';
    else if (stockFaible) badgeStock = '<span class="produit-badge-stock produit-badge-stock--orange" id="badge-stock">Plus que ' + stockEffectif + ' en stock</span>';
    else                  badgeStock = '<span class="produit-badge-stock produit-badge-stock--vert" id="badge-stock">En stock</span>';

    var blocVariantes = '';
    if (aDesVariantes) {
        blocVariantes = [
            '<div class="produit-variantes-bloc">',
            '    <label class="produit-label">Couleur : <span class="produit-variante-nom" id="variante-nom-affichee">' + echapperHtml(produit.variantes[varianteIndex].nom) + '</span></label>',
            '    <div class="produit-variantes-pastilles" id="produit-variantes-pastilles">',
            produit.variantes.map(function(v, i) {
                var rup = (v.stock || 0) === 0;
                return '<button type="button" class="variante-pastille-grande' + (i === varianteIndex ? ' actif' : '') + (rup ? ' variante-pastille--rupture' : '') + '" data-index="' + i + '" title="' + echapperHtml(v.nom) + (rup ? ' (epuise)' : '') + '" style="background-color:' + echapperHtml(v.couleur || '#ccc') + '"' + (rup ? ' disabled' : '') + '></button>';
            }).join(''),
            '    </div>',
            '</div>'
        ].join('');
    }

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

        '    <div class="produit-image-grande produit-image-grande--' + echapperHtml(produit.categorie) + '">',
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

        '        ' + blocVariantes,

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
        '            <div class="produit-garantie"><span class="garantie-point"></span>Livraison offerte des 35 &#8364;</div>',
        '            <div class="produit-garantie"><span class="garantie-point"></span>Retours gratuits sous 14 jours</div>',
        '            <div class="produit-garantie"><span class="garantie-point"></span>Paiement 100% securise</div>',
        '        </div>',
        '    </div>',
        '</div>',

        '<div id="section-relies"></div>'
    ].join('');

    appliquerImageStockee(document.querySelector('.produit-image-grande'), produit.id);
    initialiserActionsPage(produit, varianteIndex);

    setTimeout(function() {
        document.querySelectorAll('#produit-contenu .fade-in').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 80);
}

function initialiserActionsPage(produit, varianteIndexInitial) {
    var quantite = 1;
    var btnMoins = document.getElementById('btn-moins');
    var btnPlus  = document.getElementById('btn-plus');
    var valeurEl = document.getElementById('valeur-qte');
    var btnPanier = document.getElementById('btn-panier');

    var aDesVariantes = Array.isArray(produit.variantes) && produit.variantes.length > 0;
    var varianteIndex = varianteIndexInitial;

    function varianteActuelle() {
        return aDesVariantes ? produit.variantes[varianteIndex] : null;
    }

    function stockActuel() {
        var v = varianteActuelle();
        return v ? (v.stock || 0) : produit.stock;
    }

    function rafraichirEtatBouton() {
        var stock = stockActuel();
        var rup   = stock === 0;
        btnPanier.disabled = rup;
        btnPanier.textContent = rup ? 'Produit epuise' : 'Ajouter au panier';

        var badge = document.getElementById('badge-stock');
        if (badge) {
            badge.classList.remove('produit-badge-stock--rouge', 'produit-badge-stock--orange', 'produit-badge-stock--vert');
            if (rup) {
                badge.classList.add('produit-badge-stock--rouge');
                badge.textContent = 'Epuise';
            } else if (stock <= 3) {
                badge.classList.add('produit-badge-stock--orange');
                badge.textContent = 'Plus que ' + stock + ' en stock';
            } else {
                badge.classList.add('produit-badge-stock--vert');
                badge.textContent = 'En stock';
            }
        }
        if (quantite > stock && stock > 0) {
            quantite = stock;
            valeurEl.textContent = quantite;
        }
    }

    btnMoins.addEventListener('click', function() {
        if (quantite > 1) { quantite--; valeurEl.textContent = quantite; }
    });

    btnPlus.addEventListener('click', function() {
        var max = Math.min(10, stockActuel() || 10);
        if (quantite < max) { quantite++; valeurEl.textContent = quantite; }
    });

    btnPanier.addEventListener('click', function() {
        if (btnPanier.disabled) return;
        var v = varianteActuelle();
        for (var i = 0; i < quantite; i++) { ajouterAuPanier(produit, v); }

        var compteur = document.getElementById('panier-compteur');
        if (compteur) compteur.textContent = getPanierCount();

        btnPanier.textContent = 'Ajoute !';
        btnPanier.style.backgroundColor = 'var(--or)';
        setTimeout(function() {
            btnPanier.textContent = 'Ajouter au panier';
            btnPanier.style.backgroundColor = '';
        }, 2000);
    });

    if (aDesVariantes) {
        document.querySelectorAll('#produit-variantes-pastilles .variante-pastille-grande').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (btn.disabled) return;
                varianteIndex = parseInt(btn.getAttribute('data-index'));
                document.querySelectorAll('#produit-variantes-pastilles .variante-pastille-grande').forEach(function(b) {
                    b.classList.toggle('actif', b === btn);
                });
                document.getElementById('variante-nom-affichee').textContent = produit.variantes[varianteIndex].nom;
                rafraichirEtatBouton();
            });
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

// ============================================
// CATALOGUE.JS
// Affiche les produits avec filtres, recherche,
// tri, favoris et notification panier.
// ============================================

var categorieActive = 'tous';
var rechercheActive = '';
var triActif        = 'defaut';
var tousLesProduits = [];

document.addEventListener('DOMContentLoaded', function() {

    // Lire ?categorie= dans l'URL (passe depuis index.html)
    var params = new URLSearchParams(window.location.search);
    var categorieURL = params.get('categorie');
    if (categorieURL) {
        categorieActive = categorieURL;
    }

    chargerProduits();
    initialiserFiltres();
    initialiserRecherche();
    initialiserTri();
    mettreAJourCompteurPanier();
});

function chargerProduits() {
    tousLesProduits = PRODUITS;
    mettreAJourBoutonsFiltres();
    afficherProduits(obtenirProduitsAffiches());
}

// Applique filtre categorie + recherche + tri
function obtenirProduitsAffiches() {
    var liste = tousLesProduits;

    // Filtre categorie
    if (categorieActive !== 'tous') {
        liste = liste.filter(function(p) {
            return p.categorie === categorieActive;
        });
    }

    // Filtre recherche
    if (rechercheActive.length > 0) {
        var q = rechercheActive.toLowerCase();
        liste = liste.filter(function(p) {
            return p.nom.toLowerCase().indexOf(q) !== -1 ||
                   p.description.toLowerCase().indexOf(q) !== -1;
        });
    }

    // Tri
    if (triActif === 'prix-asc') {
        liste = liste.slice().sort(function(a, b) { return a.prix - b.prix; });
    } else if (triActif === 'prix-desc') {
        liste = liste.slice().sort(function(a, b) { return b.prix - a.prix; });
    } else if (triActif === 'nom-asc') {
        liste = liste.slice().sort(function(a, b) { return a.nom.localeCompare(b.nom, 'fr'); });
    }

    return liste;
}

function afficherProduits(produits) {
    var grille = document.getElementById('produits-grille');

    if (produits.length === 0) {
        grille.innerHTML = '<p class="chargement">Aucun produit trouve.</p>';
        return;
    }

    grille.innerHTML = '';
    produits.forEach(function(produit) {
        grille.appendChild(creerCarteProduit(produit));
    });
}

function creerCarteProduit(produit) {
    var article = document.createElement('article');
    article.className = 'carte-produit';

    var aDesVariantes = Array.isArray(produit.variantes) && produit.variantes.length > 0;
    var stockEffectif = aDesVariantes
        ? produit.variantes.reduce(function(s, v) { return s + (v.stock || 0); }, 0)
        : produit.stock;

    var stockFaible = stockEffectif > 0 && stockEffectif <= 3;
    var rupture     = stockEffectif === 0;
    var favori      = (typeof estFavori === 'function') ? estFavori(produit.id) : false;

    var badgeStock = stockFaible
        ? '<span class="badge-stock-faible">Plus que ' + stockEffectif + ' en stock</span>'
        : '';

    var btnDisabled = rupture ? ' disabled' : '';
    var btnTexte    = rupture ? 'Epuise' : (aDesVariantes ? 'Choisir' : 'Ajouter');

    var pastillesHtml = '';
    if (aDesVariantes) {
        pastillesHtml = '<div class="carte-produit-variantes">' +
            produit.variantes.slice(0, 5).map(function(v) {
                var rupVar = (v.stock || 0) === 0;
                return '<span class="variante-pastille' + (rupVar ? ' variante-pastille--rupture' : '') + '" style="background-color:' + echapperHtml(v.couleur || '#ccc') + '" title="' + echapperHtml(v.nom || '') + (rupVar ? ' (epuise)' : '') + '"></span>';
            }).join('') +
            (produit.variantes.length > 5 ? '<span class="variante-plus">+' + (produit.variantes.length - 5) + '</span>' : '') +
        '</div>';
    }

    article.innerHTML =
        '<a href="produit.html?id=' + produit.id + '" class="carte-produit-lien">' +
            '<div class="carte-produit-image carte-produit-image--' + echapperHtml(produit.categorie) + '">' +
                '<button class="btn-coeur' + (favori ? ' actif' : '') + '" data-id="' + produit.id + '" title="Ajouter aux favoris" aria-label="Favoris">' +
                    (favori ? '&#9829;' : '&#9825;') +
                '</button>' +
            '</div>' +
        '</a>' +
        '<div class="carte-produit-corps">' +
            '<span class="carte-produit-categorie">' + echapperHtml(produit.categorie) + '</span>' +
            '<a href="produit.html?id=' + produit.id + '">' +
                '<h3 class="carte-produit-nom">' + echapperHtml(produit.nom) + '</h3>' +
            '</a>' +
            '<p class="carte-produit-description">' + echapperHtml(produit.description) + '</p>' +
            pastillesHtml +
            '<div class="carte-produit-pied">' +
                '<span class="carte-produit-prix">' + produit.prix.toFixed(2) + ' &#8364;</span>' +
                '<button class="btn-ajouter"' + btnDisabled + ' data-id="' + produit.id + '">' +
                    btnTexte +
                '</button>' +
                badgeStock +
            '</div>' +
        '</div>';

    // Appliquer l'image via DOM (securise — pas d'injection HTML)
    appliquerImageStockee(article.querySelector('.carte-produit-image'), produit.id);

    // Bouton coeur favoris
    var btnCoeur = article.querySelector('.btn-coeur');
    btnCoeur.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof toggleFavori !== 'function') return;
        var maintenant = toggleFavori(produit.id);
        btnCoeur.classList.toggle('actif', maintenant);
        btnCoeur.innerHTML = maintenant ? '&#9829;' : '&#9825;';
        var cpt = document.getElementById('favoris-compteur');
        if (cpt) {
            var nb = getFavorisCount();
            cpt.textContent = nb;
            cpt.style.display = nb === 0 ? 'none' : 'inline-flex';
        }
        var cptMobile = document.querySelectorAll('.favoris-compteur-mobile');
        cptMobile.forEach(function(el) { el.textContent = getFavorisCount(); });
    });

    // Bouton ajouter au panier — si variantes, redirige vers la fiche pour choisir
    if (!rupture) {
        var bouton = article.querySelector('.btn-ajouter');
        if (aDesVariantes) {
            bouton.addEventListener('click', function() {
                window.location.href = 'produit.html?id=' + produit.id;
            });
        } else {
            bouton.addEventListener('click', function() {
                ajouterAuPanier(produit);
                mettreAJourCompteurPanier();
                afficherNotif(produit.nom);
            });
        }
    }

    return article;
}

function initialiserFiltres() {
    var boutons = document.querySelectorAll('.filtre-btn');
    boutons.forEach(function(bouton) {
        bouton.addEventListener('click', function() {
            categorieActive = bouton.getAttribute('data-categorie');
            mettreAJourBoutonsFiltres();
            afficherProduits(obtenirProduitsAffiches());
        });
    });
}

function initialiserRecherche() {
    var input = document.getElementById('input-recherche');
    if (!input) return;
    input.addEventListener('input', function() {
        rechercheActive = input.value.trim();
        afficherProduits(obtenirProduitsAffiches());
    });
}

function initialiserTri() {
    var select = document.getElementById('tri-select');
    if (!select) return;
    select.addEventListener('change', function() {
        triActif = select.value;
        afficherProduits(obtenirProduitsAffiches());
    });
}

function mettreAJourBoutonsFiltres() {
    document.querySelectorAll('.filtre-btn').forEach(function(btn) {
        btn.classList.toggle('actif', btn.getAttribute('data-categorie') === categorieActive);
    });
}

function mettreAJourCompteurPanier() {
    var compteur = document.getElementById('panier-compteur');
    if (compteur) {
        compteur.textContent = getPanierCount();
    }
}

// ============================================
// NOTIFICATION PANIER
// ============================================

var notifTimer = null;

function afficherNotif(nomProduit) {
    var notif = document.getElementById('notif-panier');

    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notif-panier';
        notif.className = 'notif-panier';
        document.body.appendChild(notif);
    }

    notif.innerHTML =
        '<span class="notif-point"></span>' +
        '<div class="notif-texte">' +
            '<span class="notif-titre">Ajoute au panier</span>' +
            '<span class="notif-nom">' + echapperHtml(nomProduit) + '</span>' +
        '</div>' +
        '<a href="panier.html" class="notif-voir">Voir le panier</a>';

    notif.classList.remove('notif-sortie');
    notif.classList.add('notif-visible');

    if (notifTimer) clearTimeout(notifTimer);

    notifTimer = setTimeout(function() {
        notif.classList.add('notif-sortie');
        setTimeout(function() {
            notif.classList.remove('notif-visible', 'notif-sortie');
        }, 400);
    }, 2800);
}

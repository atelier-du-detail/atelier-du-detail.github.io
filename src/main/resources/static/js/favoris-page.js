// ============================================
// FAVORIS-PAGE.JS
// Affiche les produits mis en favoris.
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    afficherFavoris();
});

function afficherFavoris() {
    var grille  = document.getElementById('favoris-grille');
    var ids     = getFavoris();

    if (ids.length === 0) {
        grille.innerHTML = [
            '<div class="panier-vide fade-in" style="grid-column:1/-1">',
            '    <div class="panier-vide-icone"><div class="panier-vide-cercle"></div></div>',
            '    <h2 class="panier-vide-titre">Aucun favori pour le moment</h2>',
            '    <p>Cliquez sur le coeur d\'un produit pour le retrouver ici.</p>',
            '    <a href="catalogue.html" class="btn-principal" style="margin-top:1.5rem;display:inline-block">Voir le catalogue</a>',
            '</div>'
        ].join('');
        setTimeout(function() {
            grille.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
        }, 80);
        return;
    }

    var produits = [];
    for (var i = 0; i < PRODUITS.length; i++) {
        if (ids.indexOf(PRODUITS[i].id) !== -1) produits.push(PRODUITS[i]);
    }

    grille.innerHTML = '';
    produits.forEach(function(produit) {
        grille.appendChild(creerCarteFavori(produit));
    });

    setTimeout(function() {
        grille.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
    }, 80);
}

function creerCarteFavori(produit) {
    var article  = document.createElement('article');
    article.className = 'carte-produit fade-in';
    var rupture  = produit.stock === 0;

    var imgStockee = localStorage.getItem('img_' + produit.id);
    var classeImg  = 'carte-produit-image carte-produit-image--' + produit.categorie + (imgStockee ? ' avec-photo' : '');
    var styleImg   = imgStockee ? ' style="background-image:url(' + imgStockee + ')"' : '';

    article.innerHTML =
        '<a href="produit.html?id=' + produit.id + '">' +
            '<div class="' + classeImg + '"' + styleImg + '></div>' +
        '</a>' +
        '<div class="carte-produit-corps">' +
            '<span class="carte-produit-categorie">' + produit.categorie + '</span>' +
            '<h3 class="carte-produit-nom">' + produit.nom + '</h3>' +
            '<p class="carte-produit-description">' + produit.description + '</p>' +
            '<div class="carte-produit-pied">' +
                '<span class="carte-produit-prix">' + produit.prix.toFixed(2) + ' &#8364;</span>' +
                '<button class="btn-ajouter"' + (rupture ? ' disabled' : '') + ' data-id="' + produit.id + '">' +
                    (rupture ? 'Epuise' : 'Ajouter') +
                '</button>' +
            '</div>' +
            '<button class="btn-retirer-favori" data-id="' + produit.id + '">Retirer des favoris</button>' +
        '</div>';

    var btnAjouter = article.querySelector('.btn-ajouter');
    if (!rupture) {
        btnAjouter.addEventListener('click', function() {
            ajouterAuPanier(produit);
            var compteur = document.getElementById('panier-compteur');
            if (compteur) compteur.textContent = getPanierCount();
            btnAjouter.textContent = 'Ajoute';
            setTimeout(function() { btnAjouter.textContent = 'Ajouter'; }, 1500);
        });
    }

    article.querySelector('.btn-retirer-favori').addEventListener('click', function() {
        toggleFavori(produit.id);
        var cpt = document.getElementById('favoris-compteur');
        if (cpt) cpt.textContent = getFavorisCount();
        article.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        article.style.opacity = '0';
        article.style.transform = 'scale(0.95)';
        setTimeout(function() { afficherFavoris(); }, 300);
    });

    return article;
}

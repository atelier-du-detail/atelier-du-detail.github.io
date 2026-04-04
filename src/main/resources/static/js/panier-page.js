// ============================================
// PANIER-PAGE.JS
// ============================================

var FRAIS_LIVRAISON           = 4.90;
var SEUIL_LIVRAISON_GRATUITE  = 60;

var CODES_PROMO = {
    'BIENVENUE10': { remise: 0.10, label: '10% de reduction' },
    'ATELIER15':   { remise: 0.15, label: '15% de reduction' }
};

var codePromoActif = null;

// ============================================
// DEMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    afficherPanier();
});

// ============================================
// AFFICHAGE PRINCIPAL
// ============================================

function afficherPanier() {
    var section  = document.getElementById('panier-section');
    var articles = getPanier();

    if (articles.length === 0) {
        section.innerHTML = construirePanierVide();
    } else {
        section.innerHTML =
            '<div class="panier-contenu">' +
                '<div class="panier-articles">' +
                    '<div class="panier-articles-entete">' +
                        '<h2>Votre selection</h2>' +
                        '<span class="panier-nb-articles">' + getPanierCount() + ' article' + (getPanierCount() > 1 ? 's' : '') + '</span>' +
                    '</div>' +
                    articles.map(construireArticle).join('') +
                '</div>' +
                construireRecap() +
            '</div>';

        ecouterBoutons();
    }

    // Rendre visible les elements fade-in injectes dynamiquement
    setTimeout(function() {
        if (typeof observerFadeIn === 'function') {
            observerFadeIn(section);
        }
        // Fallback : forcer la visibilite si IntersectionObserver n'a pas tourne
        section.querySelectorAll('.fade-in').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 80);
}

// ============================================
// CONSTRUCTION HTML
// ============================================

function construirePanierVide() {
    return [
        '<div class="panier-vide fade-in">',
        '    <div class="panier-vide-icone">',
        '        <div class="panier-vide-cercle"></div>',
        '    </div>',
        '    <h2 class="panier-vide-titre">Votre panier est vide</h2>',
        '    <p>Decouvrez nos collections et ajoutez vos pieces preferees.</p>',
        '    <a href="catalogue.html" class="btn-principal">Voir le catalogue</a>',
        '</div>'
    ].join('');
}

function construireArticle(article) {
    return [
        '<div class="panier-article fade-in" data-id="' + article.id + '">',
        '    <div class="panier-article-image panier-image--' + article.categorie + '"></div>',
        '    <div class="panier-article-info">',
        '        <span class="panier-article-categorie">' + article.categorie + '</span>',
        '        <h3 class="panier-article-nom">' + article.nom + '</h3>',
        '        <span class="panier-article-prix-unit">' + article.prix.toFixed(2) + ' &#8364; / piece</span>',
        '    </div>',
        '    <div class="panier-article-droite">',
        '        <div class="panier-article-quantite">',
        '            <button class="btn-quantite btn-moins" data-id="' + article.id + '">&#8722;</button>',
        '            <span class="valeur-quantite">' + article.quantite + '</span>',
        '            <button class="btn-quantite btn-plus" data-id="' + article.id + '">&#43;</button>',
        '        </div>',
        '        <div class="panier-article-total">' + (article.prix * article.quantite).toFixed(2) + ' &#8364;</div>',
        '        <button class="btn-supprimer" data-id="' + article.id + '" title="Retirer">Retirer</button>',
        '    </div>',
        '</div>'
    ].join('');
}

function construireRecap() {
    var sous_total = getPanierTotal();
    var remise     = codePromoActif ? sous_total * CODES_PROMO[codePromoActif].remise : 0;
    var apres_remise = sous_total - remise;
    var livraison  = apres_remise >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON;
    var total      = apres_remise + livraison;
    var reste      = SEUIL_LIVRAISON_GRATUITE - apres_remise;

    var livraison_estimee = calculerLivraisonEstimee();

    var ligne_remise = '';
    if (remise > 0) {
        ligne_remise =
            '<div class="recap-ligne recap-remise">' +
                '<span>' + CODES_PROMO[codePromoActif].label + '</span>' +
                '<span>- ' + remise.toFixed(2) + ' &#8364;</span>' +
            '</div>';
    }

    var bandeau_promo = '';
    if (livraison > 0 && reste > 0) {
        bandeau_promo =
            '<div class="recap-bandeau">' +
                'Plus que <strong>' + reste.toFixed(2) + ' &#8364;</strong> pour la livraison offerte' +
            '</div>';
    } else if (livraison === 0) {
        bandeau_promo = '<div class="recap-bandeau recap-bandeau--vert">Livraison offerte sur cette commande</div>';
    }

    return [
        '<div class="panier-recap fade-in">',

        '    <h2>Recapitulatif</h2>',

        bandeau_promo,

        // Code promo
        '    <div class="recap-promo-form" id="recap-promo-form">',
        '        <input type="text" id="champ-code-promo" placeholder="Code promo" class="input-code-promo">',
        '        <button id="btn-appliquer-promo" class="btn-appliquer">Appliquer</button>',
        '    </div>',
        codePromoActif
            ? '<p class="recap-code-actif">Code <strong>' + codePromoActif + '</strong> applique</p>'
            : '',

        // Lignes de calcul
        '    <div class="recap-lignes">',
        '        <div class="recap-ligne">',
        '            <span>Sous-total</span>',
        '            <span>' + sous_total.toFixed(2) + ' &#8364;</span>',
        '        </div>',
        ligne_remise,
        '        <div class="recap-ligne">',
        '            <span>Livraison</span>',
        '            <span>' + (livraison === 0 ? '<span class="livraison-gratuite">Offerte</span>' : livraison.toFixed(2) + ' &#8364;') + '</span>',
        '        </div>',
        '        <div class="recap-ligne recap-total">',
        '            <span>Total TTC</span>',
        '            <span>' + total.toFixed(2) + ' &#8364;</span>',
        '        </div>',
        '    </div>',

        // TVA
        '    <p class="recap-tva">TVA 20% incluse : ' + (total * 0.2 / 1.2).toFixed(2) + ' &#8364;</p>',

        // Livraison estimee
        '    <p class="recap-livraison-date">Livraison estimee : <strong>' + livraison_estimee + '</strong></p>',

        // Bouton commander
        '    <button class="btn-commander" id="btn-commander">Passer la commande</button>',

        '    <a href="catalogue.html" class="recap-continuer">Continuer mes achats</a>',

        // Badges de confiance
        '    <div class="recap-badges">',
        '        <div class="badge-confiance">Paiement securise</div>',
        '        <div class="badge-confiance">Retours gratuits 14j</div>',
        '        <div class="badge-confiance">SAV disponible</div>',
        '    </div>',

        '</div>'
    ].join('');
}

// ============================================
// INTERACTIONS
// ============================================

function ecouterBoutons() {
    document.querySelectorAll('.btn-moins').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id      = parseInt(btn.getAttribute('data-id'));
            var article = trouverArticle(id);
            if (article) changerQuantite(id, article.quantite - 1);
            afficherPanier();
        });
    });

    document.querySelectorAll('.btn-plus').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id      = parseInt(btn.getAttribute('data-id'));
            var article = trouverArticle(id);
            if (article) changerQuantite(id, article.quantite + 1);
            afficherPanier();
        });
    });

    document.querySelectorAll('.btn-supprimer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(btn.getAttribute('data-id'));
            supprimerDuPanier(id);
            afficherPanier();
        });
    });

    var btnPromo = document.getElementById('btn-appliquer-promo');
    if (btnPromo) {
        btnPromo.addEventListener('click', function() {
            var code = document.getElementById('champ-code-promo').value.trim().toUpperCase();
            if (CODES_PROMO[code]) {
                codePromoActif = code;
                afficherPanier();
            } else {
                document.getElementById('champ-code-promo').style.borderColor = 'var(--rose-fonce)';
                document.getElementById('champ-code-promo').placeholder = 'Code invalide';
            }
        });
    }

    var btnCommander = document.getElementById('btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', function() {
            // Sauvegarder la remise active pour la recuperer sur caisse.html
            var remise = codePromoActif ? getPanierTotal() * CODES_PROMO[codePromoActif].remise : 0;
            sessionStorage.setItem('caisse_remise', remise.toFixed(2));
            window.location.href = 'caisse.html';
        });
    }
}

// ============================================
// UTILITAIRES
// ============================================

function trouverArticle(id) {
    var panier = getPanier();
    for (var i = 0; i < panier.length; i++) {
        if (panier[i].id === id) return panier[i];
    }
    return null;
}

function calculerLivraisonEstimee() {
    var jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var mois  = ['jan.', 'fev.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];
    var date  = new Date();
    date.setDate(date.getDate() + 5);
    // Sauter les weekends
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    return jours[date.getDay()] + ' ' + date.getDate() + ' ' + mois[date.getMonth()];
}

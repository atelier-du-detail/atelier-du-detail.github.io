// ============================================
// CONFIRMATION.JS
// Page affichee apres le paiement.
// URL attendue : confirmation.html?status=succeeded
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var params  = new URLSearchParams(window.location.search);
    var statut  = params.get('status');
    var section = document.getElementById('confirmation-section');

    setTimeout(function() {
        if (statut === 'succeeded') {
            afficherSucces(section);
            viderPanier();
            sessionStorage.removeItem('caisse_remise');
            sessionStorage.removeItem('caisse_total');
        } else {
            afficherEchec(section);
        }

        section.querySelectorAll('.fade-in').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 300);
});

// ============================================
// AFFICHAGE SUCCES
// ============================================

function afficherSucces(section) {
    var client   = lireClient();
    var articles = lireArticlesSauvegardes();
    var total    = sessionStorage.getItem('caisse_total') || '';

    var lignesArticles = articles.map(function(a) {
        return '<div class="conf-article">' +
            '<span class="conf-article-nom">' + echapperHtml(a.nom) + ' x' + a.quantite + '</span>' +
            '<span class="conf-article-prix">' + (a.prix * a.quantite).toFixed(2) + ' &#8364;</span>' +
        '</div>';
    }).join('');

    var ligneTotal = total
        ? '<div class="conf-article conf-article--total"><span>Total paye</span><span>' + total + ' &#8364;</span></div>'
        : '';

    var refCommande = 'ATL-' + Date.now().toString().substring(5);

    section.innerHTML =
        '<div class="confirmation-carte fade-in">' +
            '<div class="conf-icone conf-icone--succes">&#10003;</div>' +
            '<h1 class="conf-titre">Commande confirmee</h1>' +
            '<p class="conf-sous-titre">Merci ' + (client ? echapperHtml(client.prenom) : '') + ' pour votre achat !</p>' +
            '<div class="conf-ref">Reference : <strong>' + refCommande + '</strong></div>' +
            (client && client.email
                ? '<p class="conf-email">Un recapitulatif a ete envoye a <strong>' + echapperHtml(client.email) + '</strong></p>'
                : '') +
            (lignesArticles
                ? '<div class="conf-articles">' + lignesArticles + ligneTotal + '</div>'
                : '') +
            '<p class="conf-livraison">Livraison estimee : <strong>' + calculerLivraisonConf() + '</strong></p>' +
            '<div class="conf-actions">' +
                '<a href="catalogue.html" class="btn-principal">Continuer mes achats</a>' +
                '<a href="index.html" class="btn-secondaire">Retour a l\'accueil</a>' +
            '</div>' +
        '</div>';
}

// ============================================
// AFFICHAGE ECHEC
// ============================================

function afficherEchec(section) {
    section.innerHTML =
        '<div class="confirmation-carte fade-in">' +
            '<div class="conf-icone conf-icone--echec">&#10007;</div>' +
            '<h1 class="conf-titre">Paiement echoue</h1>' +
            '<p>Votre paiement n\'a pas pu etre traite.</p>' +
            '<p>Verifiez vos informations et reessayez.</p>' +
            '<div class="conf-actions">' +
                '<a href="caisse.html" class="btn-principal">Reessayer</a>' +
                '<a href="panier.html" class="btn-secondaire">Retour au panier</a>' +
            '</div>' +
        '</div>';
}

// ============================================
// UTILITAIRES
// ============================================

function lireClient() {
    try {
        var data = sessionStorage.getItem('caisse_client');
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
}

function lireArticlesSauvegardes() {
    try {
        var data = sessionStorage.getItem('caisse_articles_snapshot');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

function calculerLivraisonConf() {
    var jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var mois  = ['jan.', 'fev.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];
    var date  = new Date();
    date.setDate(date.getDate() + 5);
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    return jours[date.getDay()] + ' ' + date.getDate() + ' ' + mois[date.getMonth()];
}

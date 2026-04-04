// ============================================
// CAISSE.JS
// Page de paiement (formulaire simule — sans backend de paiement).
// ============================================

var FRAIS_LIVRAISON_CAISSE   = 4.90;
var SEUIL_LIVRAISON_CAISSE   = 60;

document.addEventListener('DOMContentLoaded', function() {
    var articles = getPanier();

    if (articles.length === 0) {
        window.location.href = 'panier.html';
        return;
    }

    afficherRecapCommande(articles);
    initialiserFormulaire(articles);
    formaterChampsCarteEcole();

    setTimeout(function() {
        document.querySelectorAll('.fade-in').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 80);
});

// ============================================
// RECAP COMMANDE (colonne droite)
// ============================================

function afficherRecapCommande(articles) {
    var sousTotal = 0;
    articles.forEach(function(a) { sousTotal += a.prix * a.quantite; });

    var livraison = sousTotal >= SEUIL_LIVRAISON_CAISSE ? 0 : FRAIS_LIVRAISON_CAISSE;
    var remise    = parseFloat(sessionStorage.getItem('caisse_remise') || '0');
    var total     = sousTotal - remise + livraison;

    sessionStorage.setItem('caisse_total', total.toFixed(2));

    var conteneurArticles = document.getElementById('recap-articles');
    conteneurArticles.innerHTML = articles.map(function(a) {
        return '<div class="recap-article">' +
            '<div class="recap-article-image recap-image--' + echapperHtml(a.categorie) + '"></div>' +
            '<div class="recap-article-info">' +
                '<span class="recap-article-nom">' + echapperHtml(a.nom) + '</span>' +
                '<span class="recap-article-qte">x' + a.quantite + '</span>' +
            '</div>' +
            '<span class="recap-article-prix">' + (a.prix * a.quantite).toFixed(2) + ' &#8364;</span>' +
        '</div>';
    }).join('');

    var ligneRemise = remise > 0
        ? '<div class="recap-caisse-ligne recap-caisse-ligne--remise">' +
              '<span>Reduction</span>' +
              '<span>- ' + remise.toFixed(2) + ' &#8364;</span>' +
          '</div>'
        : '';

    document.getElementById('recap-lignes').innerHTML =
        '<div class="recap-caisse-ligne">' +
            '<span>Sous-total</span><span>' + sousTotal.toFixed(2) + ' &#8364;</span>' +
        '</div>' +
        ligneRemise +
        '<div class="recap-caisse-ligne">' +
            '<span>Livraison</span>' +
            '<span>' + (livraison === 0 ? '<span class="livraison-gratuite">Offerte</span>' : livraison.toFixed(2) + ' &#8364;') + '</span>' +
        '</div>' +
        '<div class="recap-caisse-ligne recap-caisse-ligne--total">' +
            '<span>Total TTC</span><span>' + total.toFixed(2) + ' &#8364;</span>' +
        '</div>';

    document.getElementById('btn-payer-montant').textContent = total.toFixed(2) + ' \u20AC';
}

// ============================================
// FORMULAIRE
// ============================================

function initialiserFormulaire(articles) {
    var form = document.getElementById('form-caisse');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var prenom     = document.getElementById('caisse-prenom').value.trim();
        var nom        = document.getElementById('caisse-nom').value.trim();
        var email      = document.getElementById('caisse-email').value.trim();
        var adresse    = document.getElementById('caisse-adresse').value.trim();
        var codePostal = document.getElementById('caisse-code-postal').value.trim();
        var ville      = document.getElementById('caisse-ville').value.trim();
        var numero     = document.getElementById('carte-numero').value.trim();
        var expiration = document.getElementById('carte-expiration').value.trim();
        var cvc        = document.getElementById('carte-cvc').value.trim();

        if (!prenom || !nom || !email || !adresse || !codePostal || !ville) {
            afficherErreurCaisse('Veuillez remplir tous les champs de livraison.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            afficherErreurCaisse('Adresse email invalide.');
            return;
        }

        if (!numero || !expiration || !cvc) {
            afficherErreurCaisse('Veuillez remplir les informations de paiement.');
            return;
        }

        masquerErreurCaisse();

        var btn = document.getElementById('btn-payer');
        btn.disabled    = true;
        btn.textContent = 'Traitement en cours...';

        sessionStorage.setItem('caisse_client', JSON.stringify({
            prenom: prenom, nom: nom, email: email,
            adresse: adresse, codePostal: codePostal, ville: ville
        }));
        sessionStorage.setItem('caisse_articles_snapshot', JSON.stringify(getPanier()));

        // Simule un delai de traitement avant redirection
        setTimeout(function() {
            window.location.href = 'confirmation.html?status=succeeded';
        }, 1200);
    });
}

// ============================================
// FORMATAGE CHAMPS CARTE (ergonomie)
// ============================================

function formaterChampsCarteEcole() {
    var numero = document.getElementById('carte-numero');
    if (numero) {
        numero.addEventListener('input', function() {
            var valeur = this.value.replace(/\D/g, '').substring(0, 16);
            this.value = valeur.replace(/(.{4})/g, '$1 ').trim();
        });
    }

    var expiration = document.getElementById('carte-expiration');
    if (expiration) {
        expiration.addEventListener('input', function() {
            var valeur = this.value.replace(/\D/g, '').substring(0, 4);
            if (valeur.length >= 3) {
                this.value = valeur.substring(0, 2) + '/' + valeur.substring(2);
            } else {
                this.value = valeur;
            }
        });
    }
}

// ============================================
// MESSAGES
// ============================================

function afficherErreurCaisse(message) {
    var el = document.getElementById('caisse-erreur');
    el.textContent   = message;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function masquerErreurCaisse() {
    var el = document.getElementById('caisse-erreur');
    el.style.display = 'none';
    el.textContent   = '';
}

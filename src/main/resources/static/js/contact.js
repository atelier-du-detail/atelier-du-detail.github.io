// ============================================
// CONTACT.JS
// Validation du formulaire de contact.
// Affiche des erreurs champ par champ,
// puis un message de confirmation a la fin.
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var formulaire = document.getElementById('formulaire-contact');
    if (!formulaire) return;

    formulaire.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validerFormulaire()) {
            afficherSucces();
        }
    });

    // Effacer l'erreur quand l'utilisateur commence a saisir
    var champs = formulaire.querySelectorAll('input, select, textarea');
    champs.forEach(function(champ) {
        champ.addEventListener('input', function() {
            var groupe = document.getElementById('groupe-' + champ.id);
            if (groupe) {
                groupe.classList.remove('champ-erreur');
            }
        });
    });
});

function validerFormulaire() {
    var estValide = true;

    var nom     = document.getElementById('nom');
    var email   = document.getElementById('email');
    var sujet   = document.getElementById('sujet');
    var message = document.getElementById('message');

    // Validation nom
    if (!nom.value.trim()) {
        afficherErreur('groupe-nom');
        estValide = false;
    }

    // Validation email (format basique)
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !regexEmail.test(email.value.trim())) {
        afficherErreur('groupe-email');
        estValide = false;
    }

    // Validation sujet
    if (!sujet.value) {
        afficherErreur('groupe-sujet');
        estValide = false;
    }

    // Validation message
    if (!message.value.trim()) {
        afficherErreur('groupe-message');
        estValide = false;
    }

    return estValide;
}

function afficherErreur(idGroupe) {
    var groupe = document.getElementById(idGroupe);
    if (groupe) {
        groupe.classList.add('champ-erreur');
    }
}

function afficherSucces() {
    var formulaire = document.getElementById('formulaire-contact');
    var succes     = document.getElementById('message-succes');

    formulaire.style.display = 'none';
    succes.style.display = 'block';
}

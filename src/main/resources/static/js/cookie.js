// ============================================
// COOKIE.JS
// Bandeau consentement cookies (RGPD).
// ============================================

var COOKIE_CLE = 'cookie_consent';

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem(COOKIE_CLE)) return;

    var bandeau = document.createElement('div');
    bandeau.className = 'cookie-bandeau';
    bandeau.innerHTML =
        '<p>Nous utilisons des cookies pour ameliorer votre experience. ' +
        'En continuant a naviguer, vous acceptez notre politique de confidentialite.</p>' +
        '<div class="cookie-boutons">' +
            '<button class="btn-cookie-refuser">Refuser</button>' +
            '<button class="btn-cookie-accepter">Accepter</button>' +
        '</div>';

    document.body.appendChild(bandeau);

    // Afficher apres un court delai
    setTimeout(function() {
        bandeau.classList.add('visible');
    }, 800);

    bandeau.querySelector('.btn-cookie-accepter').addEventListener('click', function() {
        localStorage.setItem(COOKIE_CLE, 'accepte');
        fermerBandeau(bandeau);
    });

    bandeau.querySelector('.btn-cookie-refuser').addEventListener('click', function() {
        localStorage.setItem(COOKIE_CLE, 'refuse');
        fermerBandeau(bandeau);
    });
});

function fermerBandeau(bandeau) {
    bandeau.classList.remove('visible');
    setTimeout(function() { bandeau.remove(); }, 400);
}

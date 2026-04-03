// ============================================
// LOADER.JS
// Ecran de chargement anime au lancement de page.
// ============================================

(function() {
    // Creer le loader avant que le DOM soit pret
    var loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML =
        '<div class="loader-contenu">' +
            '<div class="loader-logo">' +
                '<span class="loader-logo-principal">L\'Atelier</span>' +
                '<span class="loader-logo-secondaire">du Detail</span>' +
            '</div>' +
            '<div class="loader-barre">' +
                '<div class="loader-barre-progression"></div>' +
            '</div>' +
        '</div>';

    // Inserer en premier dans le body (ou attendre que body existe)
    if (document.body) {
        document.body.insertBefore(loader, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.insertBefore(loader, document.body.firstChild);
        });
    }

    window.addEventListener('load', function() {
        loader.classList.add('loader-sortie');
        setTimeout(function() {
            loader.style.display = 'none';
        }, 500);
    });
})();

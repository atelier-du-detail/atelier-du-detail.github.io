// ============================================
// THEME.JS
// Applique le theme personnalise par l'admin.
// Doit etre charge dans <head> pour eviter
// un flash de couleurs au chargement.
// ============================================

(function() {
    var CLE_THEME = 'theme_custom';
    var root      = document.documentElement;

    function estCouleurValide(val) {
        return typeof val === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(val);
    }

    function estImageBase64Valide(val) {
        return typeof val === 'string' && val.indexOf('data:image/') === 0;
    }

    var POLICES_AUTORISEES = [
        'Georgia, serif',
        "'Palatino Linotype', Palatino, serif",
        "Garamond, 'EB Garamond', serif",
        "'Book Antiqua', Palatino, serif",
        "'Times New Roman', Times, serif"
    ];

    var donnees = localStorage.getItem(CLE_THEME);
    if (donnees) {
        try {
            var theme = JSON.parse(donnees);
            var couleurs = ['--rose-fonce', '--or', '--blanc-casse', '--texte-fonce', '--rose-poudre', '--rose-moyen'];
            couleurs.forEach(function(v) {
                if (estCouleurValide(theme[v])) root.style.setProperty(v, theme[v]);
            });
            if (theme['--police'] && POLICES_AUTORISEES.indexOf(theme['--police']) !== -1) {
                root.style.setProperty('--police', theme['--police']);
            }
        } catch(e) {}
    }

    // Images de fond des cartes categorie (page d'accueil) : bracelet et foulard.
    // Si l'admin a uploade une photo, on l'applique en variable CSS ; sinon le fallback gradient defini dans style.css est conserve.
    [['bracelet', '--bg-categorie-bracelet'], ['foulard', '--bg-categorie-foulard']].forEach(function(paire) {
        var img = localStorage.getItem('img_categorie_' + paire[0]);
        if (estImageBase64Valide(img)) {
            root.style.setProperty(paire[1], 'url("' + img + '")');
        }
    });
})();

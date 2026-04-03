// ============================================
// THEME.JS
// Applique le theme personnalise par l'admin.
// Doit etre charge dans <head> pour eviter
// un flash de couleurs au chargement.
// ============================================

(function() {
    var CLE_THEME = 'theme_custom';
    var donnees = localStorage.getItem(CLE_THEME);
    if (!donnees) return;

    // Valide qu'une valeur CSS est un code couleur hexadecimal (#rgb, #rrggbb, #rrggbbaa).
    function estCouleurValide(val) {
        return typeof val === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(val);
    }

    // Valide qu'une valeur de police est dans la liste autorisee.
    var POLICES_AUTORISEES = [
        'Georgia, serif',
        "'Palatino Linotype', Palatino, serif",
        "Garamond, 'EB Garamond', serif",
        "'Book Antiqua', Palatino, serif",
        "'Times New Roman', Times, serif"
    ];

    try {
        var theme = JSON.parse(donnees);
        var root  = document.documentElement;
        var couleurs = ['--rose-fonce', '--or', '--blanc-casse', '--texte-fonce', '--rose-poudre', '--rose-moyen'];
        couleurs.forEach(function(v) {
            if (estCouleurValide(theme[v])) root.style.setProperty(v, theme[v]);
        });
        if (theme['--police'] && POLICES_AUTORISEES.indexOf(theme['--police']) !== -1) {
            root.style.setProperty('--police', theme['--police']);
        }
    } catch(e) {}
})();

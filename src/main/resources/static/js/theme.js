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
    try {
        var theme = JSON.parse(donnees);
        var root = document.documentElement;
        var vars = [
            '--rose-fonce', '--or', '--blanc-casse',
            '--texte-fonce', '--rose-poudre', '--rose-moyen', '--police'
        ];
        vars.forEach(function(v) {
            if (theme[v]) root.style.setProperty(v, theme[v]);
        });
    } catch(e) {}

    // Nom du site (applique apres DOMContentLoaded via layout.js qui lit localStorage)
})();

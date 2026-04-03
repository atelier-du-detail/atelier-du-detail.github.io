// ============================================
// UTILS.JS
// Fonctions utilitaires partagees.
// ============================================

// Echappe les caracteres HTML dangereux pour eviter les injections XSS.
function echapperHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

// Verifie qu'une valeur est une image base64 valide (data:image/...).
// Empeche d'injecter du JS dans un attribut style background-image.
function estImageBase64Valide(val) {
    return typeof val === 'string' &&
           /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(val);
}

// Applique une image stockee en localStorage sur un element DOM.
// Utilise le DOM directement (pas de innerHTML) pour eviter les injections.
function appliquerImageStockee(element, produitId) {
    var val = localStorage.getItem('img_' + produitId);
    if (val && estImageBase64Valide(val)) {
        element.style.backgroundImage = 'url(' + val + ')';
        element.style.backgroundSize  = 'cover';
        element.style.backgroundPosition = 'center';
        element.classList.add('avec-photo');
    }
}

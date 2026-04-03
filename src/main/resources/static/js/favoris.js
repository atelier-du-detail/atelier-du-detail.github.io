// ============================================
// FAVORIS.JS
// Gestion de la liste de souhaits via localStorage.
// Structure : clé "favoris" → [1, 3, 7, ...]
// (tableau d'ids de produits)
// ============================================

var FAVORIS_CLE = 'favoris';

function getFavoris() {
    var donnees = localStorage.getItem(FAVORIS_CLE);
    if (!donnees) return [];
    try { return JSON.parse(donnees); } catch (e) { return []; }
}

function sauvegarderFavoris(liste) {
    localStorage.setItem(FAVORIS_CLE, JSON.stringify(liste));
}

// Ajoute ou retire un produit. Retourne true si maintenant en favori.
function toggleFavori(id) {
    var liste = getFavoris();
    var index = liste.indexOf(id);
    if (index === -1) {
        liste.push(id);
    } else {
        liste.splice(index, 1);
    }
    sauvegarderFavoris(liste);
    return liste.indexOf(id) !== -1;
}

function estFavori(id) {
    return getFavoris().indexOf(id) !== -1;
}

function getFavorisCount() {
    return getFavoris().length;
}

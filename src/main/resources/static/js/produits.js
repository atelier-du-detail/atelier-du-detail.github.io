// ============================================
// PRODUITS.JS
// Donnees des produits chargees directement.
// Si l'admin a modifie les produits, ils sont
// stockes dans localStorage sous "produits_custom"
// et ont la priorite sur cette liste par defaut.
// ============================================

var PRODUITS_DEFAUT = [
  {
    "id": 1,
    "nom": "Bracelet Doré Fin",
    "categorie": "bracelet",
    "prix": 24.90,
    "description": "Bracelet fin en plaqué or, délicat et élégant. Idéal à porter seul ou superposé.",
    "image": "bracelet-dore-fin.jpg",
    "stock": 15
  },
  {
    "id": 2,
    "nom": "Bracelet Perles Roses",
    "categorie": "bracelet",
    "prix": 19.90,
    "description": "Bracelet en perles naturelles roses, fermeture en argent 925. Douceur garantie.",
    "image": "bracelet-perles-roses.jpg",
    "stock": 8
  },
  {
    "id": 3,
    "nom": "Bracelet Jonc Gravé",
    "categorie": "bracelet",
    "prix": 34.90,
    "description": "Jonc large en laiton doré avec motif floral gravé à la main. Pièce unique.",
    "image": "bracelet-jonc-grave.jpg",
    "stock": 3
  },
  {
    "id": 7,
    "nom": "Foulard Soie Rose Poudré",
    "categorie": "foulard",
    "prix": 44.90,
    "description": "Foulard 100% soie dans un rose poudré délicat, 70x70 cm. Doux et luxueux.",
    "image": "foulard-soie-rose.jpg",
    "stock": 6
  },
  {
    "id": 8,
    "nom": "Foulard Imprimé Floral",
    "categorie": "foulard",
    "prix": 38.00,
    "description": "Foulard en soie mélangée, imprimé floral beige et or, 90x90 cm. Versatile.",
    "image": "foulard-imprime-floral.jpg",
    "stock": 9
  },
  {
    "id": 9,
    "nom": "Foulard Léopard Doré",
    "categorie": "foulard",
    "prix": 42.00,
    "description": "Foulard motif léopard dans des tons dorés et crème, 80x80 cm. Audacieux et élégant.",
    "image": "foulard-leopard-dore.jpg",
    "stock": 2
  }
];

// Categories valides actuellement vendues. Tout produit ayant une autre
// categorie (ex: ancien "collier" reste en Firestore) est filtre — la liste
// affichee ne contient donc jamais de produit hors catalogue actuel.
var CATEGORIES_VALIDES = ['bracelet', 'foulard'];

function categorieEstValide(p) {
    return p && CATEGORIES_VALIDES.indexOf(p.categorie) !== -1;
}

// Charge les produits : version admin (localStorage) ou liste par defaut
var PRODUITS;
(function() {
    var stockCustom = localStorage.getItem('produits_custom');
    var liste;
    if (stockCustom) {
        try {
            liste = JSON.parse(stockCustom);
        } catch (e) {
            liste = PRODUITS_DEFAUT;
        }
    } else {
        liste = PRODUITS_DEFAUT;
    }
    PRODUITS = Array.isArray(liste) ? liste.filter(categorieEstValide) : [];
})();

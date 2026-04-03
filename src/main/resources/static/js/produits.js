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
    "id": 4,
    "nom": "Collier Sautoir Étoile",
    "categorie": "collier",
    "prix": 29.90,
    "description": "Long sautoir doré avec pendentif étoile, longueur ajustable. Polyvalent et chic.",
    "image": "collier-sautoir-etoile.jpg",
    "stock": 12
  },
  {
    "id": 5,
    "nom": "Collier Ras-de-Cou Perle",
    "categorie": "collier",
    "prix": 39.90,
    "description": "Ras-de-cou avec une perle d'eau douce centrale sur chaîne fine argentée. Intemporel.",
    "image": "collier-ras-cou-perle.jpg",
    "stock": 10
  },
  {
    "id": 6,
    "nom": "Collier Fleur Dorée",
    "categorie": "collier",
    "prix": 27.50,
    "description": "Pendentif fleur en métal doré sur chaîne fine, longueur 45 cm. Romantique et féminin.",
    "image": "collier-fleur-doree.jpg",
    "stock": 0
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

// Charge les produits : version admin (localStorage) ou liste par defaut
var PRODUITS;
(function() {
    var stockCustom = localStorage.getItem('produits_custom');
    if (stockCustom) {
        try {
            PRODUITS = JSON.parse(stockCustom);
        } catch (e) {
            PRODUITS = PRODUITS_DEFAUT;
        }
    } else {
        PRODUITS = PRODUITS_DEFAUT;
    }
})();

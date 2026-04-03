// ============================================
// PANIER.JS
// Gestion du panier via localStorage.
// Chargé sur toutes les pages.
//
// Structure stockée :
// clé "panier" → [{ id, nom, prix, categorie, quantite }, ...]
// ============================================

var PANIER_CLE = 'panier';

function getPanier() {
    var donnees = localStorage.getItem(PANIER_CLE);
    if (donnees === null) {
        return [];
    }
    try {
        return JSON.parse(donnees);
    } catch (e) {
        console.error('Panier corrompu, réinitialisation', e);
        return [];
    }
}

function sauvegarderPanier(panier) {
    localStorage.setItem(PANIER_CLE, JSON.stringify(panier));
}

// Ajoute un produit ou incrémente sa quantité s'il est déjà présent
function ajouterAuPanier(produit) {
    var panier = getPanier();
    var index = -1;
    for (var i = 0; i < panier.length; i++) {
        if (panier[i].id === produit.id) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        panier[index].quantite += 1;
    } else {
        panier.push({
            id:        produit.id,
            nom:       produit.nom,
            prix:      produit.prix,
            categorie: produit.categorie,
            quantite:  1
        });
    }
    sauvegarderPanier(panier);
}

function supprimerDuPanier(idProduit) {
    var panier = getPanier().filter(function(item) {
        return item.id !== idProduit;
    });
    sauvegarderPanier(panier);
}

// Si nouvelleQuantite <= 0, supprime le produit
function changerQuantite(idProduit, nouvelleQuantite) {
    if (nouvelleQuantite <= 0) {
        supprimerDuPanier(idProduit);
        return;
    }
    var panier = getPanier();
    for (var i = 0; i < panier.length; i++) {
        if (panier[i].id === idProduit) {
            panier[i].quantite = nouvelleQuantite;
            break;
        }
    }
    sauvegarderPanier(panier);
}

function viderPanier() {
    localStorage.removeItem(PANIER_CLE);
}

// Nombre total d'articles (somme des quantités)
function getPanierCount() {
    var panier = getPanier();
    var total = 0;
    for (var i = 0; i < panier.length; i++) {
        total += panier[i].quantite;
    }
    return total;
}

// Montant total du panier
function getPanierTotal() {
    var panier = getPanier();
    var total = 0;
    for (var i = 0; i < panier.length; i++) {
        total += panier[i].prix * panier[i].quantite;
    }
    return total;
}

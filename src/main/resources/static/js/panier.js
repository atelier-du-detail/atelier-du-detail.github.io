// ============================================
// PANIER.JS
// Gestion du panier via localStorage.
// Chargé sur toutes les pages.
//
// Structure stockée :
// clé "panier" → [{ id, nom, prix, categorie, quantite, variante? }, ...]
//   variante (optionnel) : { nom, couleur }
// Deux items du panier sont distincts si (id, variante.nom) different.
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

// Identifiant logique d'un item (couple id produit + nom de variante).
// Item sans variante -> "<id>|".
function clePanierItem(id, varianteNom) {
    return String(id) + '|' + (varianteNom || '');
}

function cleItem(item) {
    return clePanierItem(item.id, item.variante ? item.variante.nom : '');
}

// Ajoute un produit ou incrémente sa quantité si une ligne identique existe deja.
// variante (optionnel) : { nom, couleur } - chaque variante d'un meme produit est une ligne distincte.
function ajouterAuPanier(produit, variante) {
    var panier = getPanier();
    var cleCible = clePanierItem(produit.id, variante ? variante.nom : '');
    var index = -1;
    for (var i = 0; i < panier.length; i++) {
        if (cleItem(panier[i]) === cleCible) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        panier[index].quantite += 1;
    } else {
        var nouvel = {
            id:        produit.id,
            nom:       produit.nom,
            prix:      produit.prix,
            categorie: produit.categorie,
            quantite:  1
        };
        if (variante && variante.nom) {
            nouvel.variante = { nom: variante.nom, couleur: variante.couleur || '#cccccc' };
        }
        panier.push(nouvel);
    }
    sauvegarderPanier(panier);
}

function supprimerDuPanier(idProduit, varianteNom) {
    var cleCible = clePanierItem(idProduit, varianteNom);
    var panier = getPanier().filter(function(item) {
        return cleItem(item) !== cleCible;
    });
    sauvegarderPanier(panier);
}

// Si nouvelleQuantite <= 0, supprime la ligne.
function changerQuantite(idProduit, varianteNom, nouvelleQuantite) {
    if (nouvelleQuantite <= 0) {
        supprimerDuPanier(idProduit, varianteNom);
        return;
    }
    var cleCible = clePanierItem(idProduit, varianteNom);
    var panier = getPanier();
    for (var i = 0; i < panier.length; i++) {
        if (cleItem(panier[i]) === cleCible) {
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

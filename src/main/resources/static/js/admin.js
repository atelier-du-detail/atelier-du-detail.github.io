// ============================================
// ADMIN.JS
// Gestion de l'espace administration.
// Authentification par mot de passe (JS),
// CRUD produits sauvegarde dans localStorage.
// ============================================

var MOT_DE_PASSE_ADMIN = 'cassandra_jibril';
var SESSION_CLE        = 'admin_connecte';
var PRODUITS_CLE       = 'produits_custom';

// L'id le plus eleve, pour generer le prochain
var prochainId;

// Produits en cours d'edition (null = ajout)
var idEnEdition = null;

// ============================================
// DEMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem(SESSION_CLE) === 'true') {
        afficherDashboard();
    } else {
        afficherLogin();
    }

    initialiserLogin();
    initialiserNavigation();
    initialiserBoutons();
});

// ============================================
// CONNEXION
// ============================================

function afficherLogin() {
    document.getElementById('ecran-login').style.display  = 'flex';
    document.getElementById('dashboard').style.display    = 'none';
}

function afficherDashboard() {
    document.getElementById('ecran-login').style.display  = 'none';
    document.getElementById('dashboard').style.display    = 'flex';
    chargerTableau();
}

function initialiserLogin() {
    var form = document.getElementById('formulaire-login');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var saisie = document.getElementById('motdepasse').value;

        if (saisie === MOT_DE_PASSE_ADMIN) {
            sessionStorage.setItem(SESSION_CLE, 'true');
            document.getElementById('groupe-motdepasse').classList.remove('champ-erreur');
            afficherDashboard();
        } else {
            document.getElementById('groupe-motdepasse').classList.add('champ-erreur');
            document.getElementById('motdepasse').value = '';
        }
    });
}

// ============================================
// NAVIGATION SIDEBAR
// ============================================

function initialiserNavigation() {
    document.querySelectorAll('.sidebar-lien[data-section]').forEach(function(lien) {
        lien.addEventListener('click', function(e) {
            e.preventDefault();
            var cible = lien.getAttribute('data-section');

            // Activer le bon lien
            document.querySelectorAll('.sidebar-lien').forEach(function(l) {
                l.classList.remove('actif');
            });
            lien.classList.add('actif');

            // Afficher la bonne section
            document.querySelectorAll('.admin-section').forEach(function(s) {
                s.style.display = 'none';
            });
            document.getElementById('section-' + cible).style.display = 'block';
        });
    });

    document.getElementById('btn-deconnexion').addEventListener('click', function() {
        sessionStorage.removeItem(SESSION_CLE);
        afficherLogin();
    });
}

// ============================================
// TABLEAU PRODUITS
// ============================================

function chargerTableau() {
    var produits = lireProduits();
    var corps    = document.getElementById('corps-tableau');

    // Calculer le prochain id disponible
    prochainId = produits.reduce(function(max, p) {
        return p.id > max ? p.id : max;
    }, 0) + 1;

    if (produits.length === 0) {
        corps.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#7a6a6a;padding:2rem">Aucun produit.</td></tr>';
        return;
    }

    corps.innerHTML = produits.map(function(p) {
        var badgeStock = p.stock === 0
            ? '<span class="badge badge--rouge">Epuise</span>'
            : p.stock <= 3
                ? '<span class="badge badge--orange">' + p.stock + '</span>'
                : '<span class="badge badge--vert">' + p.stock + '</span>';

        return [
            '<tr>',
            '    <td class="td-id">' + p.id + '</td>',
            '    <td>' + p.nom + '</td>',
            '    <td><span class="badge-categorie badge-categorie--' + p.categorie + '">' + p.categorie + '</span></td>',
            '    <td>' + p.prix.toFixed(2) + ' &#8364;</td>',
            '    <td>' + badgeStock + '</td>',
            '    <td class="td-actions">',
            '        <button class="btn-table btn-editer" data-id="' + p.id + '">Modifier</button>',
            '        <button class="btn-table btn-supprimer-prod" data-id="' + p.id + '">Supprimer</button>',
            '    </td>',
            '</tr>'
        ].join('');
    }).join('');

    // Ecouter les boutons du tableau
    document.querySelectorAll('.btn-editer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            ouvrirEdition(parseInt(btn.getAttribute('data-id')));
        });
    });

    document.querySelectorAll('.btn-supprimer-prod').forEach(function(btn) {
        btn.addEventListener('click', function() {
            supprimerProduit(parseInt(btn.getAttribute('data-id')));
        });
    });
}

// ============================================
// FORMULAIRE AJOUT / EDITION
// ============================================

function initialiserBoutons() {
    document.getElementById('btn-ouvrir-ajout').addEventListener('click', ouvrirAjout);
    document.getElementById('btn-annuler').addEventListener('click', fermerFormulaire);
    document.getElementById('btn-sauvegarder').addEventListener('click', sauvegarder);
}

function ouvrirAjout() {
    idEnEdition = null;
    document.getElementById('titre-formulaire').textContent = 'Ajouter un produit';
    viderFormulaire();
    document.getElementById('formulaire-admin').style.display = 'block';
    document.getElementById('formulaire-admin').scrollIntoView({ behavior: 'smooth' });
}

function ouvrirEdition(id) {
    var produits = lireProduits();
    var produit  = produits.find(function(p) { return p.id === id; });
    if (!produit) return;

    idEnEdition = id;
    document.getElementById('titre-formulaire').textContent = 'Modifier le produit';
    document.getElementById('champ-id').value          = produit.id;
    document.getElementById('champ-nom').value         = produit.nom;
    document.getElementById('champ-categorie').value   = produit.categorie;
    document.getElementById('champ-prix').value        = produit.prix;
    document.getElementById('champ-stock').value       = produit.stock;
    document.getElementById('champ-description').value = produit.description;

    document.getElementById('formulaire-admin').style.display = 'block';
    document.getElementById('formulaire-admin').scrollIntoView({ behavior: 'smooth' });
}

function fermerFormulaire() {
    document.getElementById('formulaire-admin').style.display = 'none';
    viderFormulaire();
    idEnEdition = null;
}

function viderFormulaire() {
    document.getElementById('champ-id').value          = '';
    document.getElementById('champ-nom').value         = '';
    document.getElementById('champ-categorie').value   = 'bracelet';
    document.getElementById('champ-prix').value        = '';
    document.getElementById('champ-stock').value       = '';
    document.getElementById('champ-description').value = '';
}

function sauvegarder() {
    var nom         = document.getElementById('champ-nom').value.trim();
    var categorie   = document.getElementById('champ-categorie').value;
    var prix        = parseFloat(document.getElementById('champ-prix').value);
    var stock       = parseInt(document.getElementById('champ-stock').value);
    var description = document.getElementById('champ-description').value.trim();

    if (!nom || isNaN(prix) || prix < 0 || isNaN(stock) || stock < 0 || !description) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    var produits = lireProduits();

    if (idEnEdition === null) {
        // Ajout
        produits.push({
            id:          prochainId,
            nom:         nom,
            categorie:   categorie,
            prix:        prix,
            description: description,
            image:       categorie + '-' + prochainId + '.jpg',
            stock:       stock
        });
    } else {
        // Edition
        for (var i = 0; i < produits.length; i++) {
            if (produits[i].id === idEnEdition) {
                produits[i].nom         = nom;
                produits[i].categorie   = categorie;
                produits[i].prix        = prix;
                produits[i].stock       = stock;
                produits[i].description = description;
                break;
            }
        }
    }

    sauvegarderProduits(produits);
    fermerFormulaire();
    chargerTableau();
}

function supprimerProduit(id) {
    if (!confirm('Supprimer ce produit ? Cette action est irreversible.')) return;

    var produits = lireProduits().filter(function(p) { return p.id !== id; });
    sauvegarderProduits(produits);
    chargerTableau();
}

// ============================================
// PERSISTANCE
// ============================================

function lireProduits() {
    var stockCustom = localStorage.getItem(PRODUITS_CLE);
    if (stockCustom) {
        try { return JSON.parse(stockCustom); } catch (e) {}
    }
    // Pas encore de version custom : on part de la liste par defaut
    return PRODUITS_DEFAUT.map(function(p) { return Object.assign({}, p); });
}

function sauvegarderProduits(produits) {
    localStorage.setItem(PRODUITS_CLE, JSON.stringify(produits));
}

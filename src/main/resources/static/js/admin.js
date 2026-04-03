// ============================================
// ADMIN.JS
// Gestion de l'espace administration.
// ============================================

// Mot de passe stocke sous forme de hash SHA-256 (jamais en clair dans le code).
// Pour changer le mot de passe : calculer le SHA-256 du nouveau mot de passe et remplacer cette valeur.
var MOT_DE_PASSE_HASH  = 'b22980535a881fdeb7893f7c7bc6666dd73c52c77cb472c4b77f684ec906e6f8';
var SESSION_CLE        = 'admin_connecte';
var PRODUITS_CLE       = 'produits_custom';
var THEME_CLE          = 'theme_custom';

var prochainId   = 1;
var idEnEdition  = null;
var imageEnCours = null; // base64 ou null (pas de changement) ou '' (suppression)

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
    initialiserApparence();
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
        var btn    = form.querySelector('.btn-login');
        btn.disabled = true;

        hashSHA256(saisie).then(function(hash) {
            btn.disabled = false;
            if (hash === MOT_DE_PASSE_HASH) {
                sessionStorage.setItem(SESSION_CLE, 'true');
                document.getElementById('groupe-motdepasse').classList.remove('champ-erreur');
                afficherDashboard();
            } else {
                document.getElementById('groupe-motdepasse').classList.add('champ-erreur');
                document.getElementById('motdepasse').value = '';
            }
        });
    });
}

function hashSHA256(texte) {
    var data = new TextEncoder().encode(texte);
    return crypto.subtle.digest('SHA-256', data).then(function(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(function(b) { return b.toString(16).padStart(2, '0'); })
            .join('');
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

            document.querySelectorAll('.sidebar-lien').forEach(function(l) {
                l.classList.remove('actif');
            });
            lien.classList.add('actif');

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

    prochainId = produits.reduce(function(max, p) {
        return p.id > max ? p.id : max;
    }, 0) + 1;

    if (produits.length === 0) {
        corps.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#7a6a6a;padding:2rem">Aucun produit.</td></tr>';
        return;
    }

    corps.innerHTML = produits.map(function(p) {
        var badgeStock = p.stock === 0
            ? '<span class="badge badge--rouge">Epuise</span>'
            : p.stock <= 3
                ? '<span class="badge badge--orange">' + p.stock + '</span>'
                : '<span class="badge badge--vert">' + p.stock + '</span>';

        var imgStockee = localStorage.getItem('img_' + p.id);
        var cellImg = (imgStockee && estImageBase64Valide(imgStockee))
            ? '<td><img src="' + imgStockee + '" class="tableau-thumbnail" alt=""></td>'
            : '<td><div class="tableau-thumbnail-vide"></div></td>';

        return [
            '<tr>',
            '    <td class="td-id">' + p.id + '</td>',
            cellImg,
            '    <td>' + echapperHtml(p.nom) + '</td>',
            '    <td><span class="badge-categorie badge-categorie--' + echapperHtml(p.categorie) + '">' + echapperHtml(p.categorie) + '</span></td>',
            '    <td>' + p.prix.toFixed(2) + ' &#8364;</td>',
            '    <td>' + badgeStock + '</td>',
            '    <td class="td-actions">',
            '        <button class="btn-table btn-editer" data-id="' + p.id + '">Modifier</button>',
            '        <button class="btn-table btn-supprimer-prod" data-id="' + p.id + '">Supprimer</button>',
            '    </td>',
            '</tr>'
        ].join('');
    }).join('');

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
    initialiserImageUpload();
}

function ouvrirAjout() {
    idEnEdition  = null;
    imageEnCours = null;
    document.getElementById('titre-formulaire').textContent = 'Ajouter un produit';
    viderFormulaire();
    document.getElementById('formulaire-admin').style.display = 'block';
    document.getElementById('formulaire-admin').scrollIntoView({ behavior: 'smooth' });
}

function ouvrirEdition(id) {
    var produits = lireProduits();
    var produit  = produits.find(function(p) { return p.id === id; });
    if (!produit) return;

    idEnEdition  = id;
    imageEnCours = null; // pas de changement par defaut

    document.getElementById('titre-formulaire').textContent = 'Modifier le produit';
    document.getElementById('champ-id').value          = produit.id;
    document.getElementById('champ-nom').value         = produit.nom;
    document.getElementById('champ-categorie').value   = produit.categorie;
    document.getElementById('champ-prix').value        = produit.prix;
    document.getElementById('champ-stock').value       = produit.stock;
    document.getElementById('champ-description').value = produit.description;

    // Charger l'image existante si dispo
    var imgStockee = localStorage.getItem('img_' + id);
    if (imgStockee) {
        afficherPreviewImage(imgStockee);
    } else {
        reinitialiserPreviewImage();
    }

    document.getElementById('formulaire-admin').style.display = 'block';
    document.getElementById('formulaire-admin').scrollIntoView({ behavior: 'smooth' });
}

function fermerFormulaire() {
    document.getElementById('formulaire-admin').style.display = 'none';
    viderFormulaire();
    idEnEdition  = null;
    imageEnCours = null;
}

function viderFormulaire() {
    document.getElementById('champ-id').value          = '';
    document.getElementById('champ-nom').value         = '';
    document.getElementById('champ-categorie').value   = 'bracelet';
    document.getElementById('champ-prix').value        = '';
    document.getElementById('champ-stock').value       = '';
    document.getElementById('champ-description').value = '';
    reinitialiserPreviewImage();
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
        produits.push({
            id:          prochainId,
            nom:         nom,
            categorie:   categorie,
            prix:        prix,
            description: description,
            image:       categorie + '-' + prochainId + '.jpg',
            stock:       stock
        });
        // Sauvegarder l'image si fournie
        if (imageEnCours) {
            localStorage.setItem('img_' + prochainId, imageEnCours);
        }
    } else {
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
        // Mettre a jour l'image
        if (imageEnCours === '') {
            localStorage.removeItem('img_' + idEnEdition);
        } else if (imageEnCours) {
            localStorage.setItem('img_' + idEnEdition, imageEnCours);
        }
    }

    sauvegarderProduits(produits);
    fermerFormulaire();
    chargerTableau();
}

function supprimerProduit(id) {
    if (!confirm('Supprimer ce produit ? Cette action est irreversible.')) return;
    localStorage.removeItem('img_' + id);
    var produits = lireProduits().filter(function(p) { return p.id !== id; });
    sauvegarderProduits(produits);
    chargerTableau();
}

// ============================================
// IMAGE UPLOAD
// ============================================

function initialiserImageUpload() {
    var zone   = document.getElementById('image-upload-zone');
    var input  = document.getElementById('champ-image');
    var btnSup = document.getElementById('btn-supprimer-image');

    zone.addEventListener('click', function() { input.click(); });

    input.addEventListener('change', function() {
        var fichier = input.files[0];
        if (!fichier) return;
        compresserImage(fichier, function(base64) {
            imageEnCours = base64;
            afficherPreviewImage(base64);
        });
    });

    // Drag & drop
    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        zone.classList.add('drag-actif');
    });
    zone.addEventListener('dragleave', function() {
        zone.classList.remove('drag-actif');
    });
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('drag-actif');
        var fichier = e.dataTransfer.files[0];
        if (!fichier || !fichier.type.startsWith('image/')) return;
        compresserImage(fichier, function(base64) {
            imageEnCours = base64;
            afficherPreviewImage(base64);
        });
    });

    btnSup.addEventListener('click', function() {
        imageEnCours = ''; // marquer comme supprimee
        reinitialiserPreviewImage();
    });
}

function compresserImage(fichier, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var max    = 900;
            var scale  = Math.min(1, max / Math.max(img.width, img.height));
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(fichier);
}

function afficherPreviewImage(src) {
    var preview = document.getElementById('image-preview');
    var label   = document.getElementById('image-upload-label');
    var btnSup  = document.getElementById('btn-supprimer-image');
    preview.src          = src;
    preview.style.display = 'block';
    label.style.display   = 'none';
    btnSup.style.display  = 'inline-block';
}

function reinitialiserPreviewImage() {
    var preview = document.getElementById('image-preview');
    var label   = document.getElementById('image-upload-label');
    var btnSup  = document.getElementById('btn-supprimer-image');
    var input   = document.getElementById('champ-image');
    preview.src           = '';
    preview.style.display = 'none';
    label.style.display   = 'block';
    btnSup.style.display  = 'none';
    input.value           = '';
}

// ============================================
// APPARENCE
// ============================================

function initialiserApparence() {
    chargerThemeExistant();

    // Color pickers — mise a jour en direct
    var pickers = [
        { id: 'color-rose-fonce',  val: 'val-rose-fonce',  variable: '--rose-fonce'  },
        { id: 'color-or',          val: 'val-or',          variable: '--or'          },
        { id: 'color-fond',        val: 'val-fond',        variable: '--blanc-casse' },
        { id: 'color-texte',       val: 'val-texte',       variable: '--texte-fonce' },
        { id: 'color-rose-poudre', val: 'val-rose-poudre', variable: '--rose-poudre' }
    ];

    pickers.forEach(function(p) {
        var input = document.getElementById(p.id);
        var span  = document.getElementById(p.val);
        if (!input) return;
        input.addEventListener('input', function() {
            span.textContent = input.value;
        });
    });

    document.getElementById('btn-sauvegarder-theme').addEventListener('click', function() {
        var theme = {};

        pickers.forEach(function(p) {
            theme[p.variable] = document.getElementById(p.id).value;
        });

        // Police
        var policeChoisie = document.querySelector('input[name="police"]:checked');
        if (policeChoisie) theme['--police'] = policeChoisie.value;

        // Textes
        var nomSite  = document.getElementById('champ-nom-site').value.trim();
        var sousNom  = document.getElementById('champ-sous-nom').value.trim();
        var annonce  = document.getElementById('champ-annonce').value.trim();
        if (nomSite) localStorage.setItem('site_nom', nomSite);
        else         localStorage.removeItem('site_nom');
        if (sousNom) localStorage.setItem('site_sous_nom', sousNom);
        else         localStorage.removeItem('site_sous_nom');
        if (annonce) localStorage.setItem('site_annonce', annonce);
        else         localStorage.removeItem('site_annonce');

        localStorage.setItem(THEME_CLE, JSON.stringify(theme));

        var conf = document.getElementById('apparence-confirmation');
        conf.style.display = 'block';
        setTimeout(function() { conf.style.display = 'none'; }, 3000);
    });

    document.getElementById('btn-reinitialiser-theme').addEventListener('click', function() {
        if (!confirm('Reinitialiser toutes les couleurs et polices par defaut ?')) return;
        localStorage.removeItem(THEME_CLE);
        localStorage.removeItem('site_nom');
        localStorage.removeItem('site_sous_nom');
        localStorage.removeItem('site_annonce');
        location.reload();
    });
}

function chargerThemeExistant() {
    var donnees = localStorage.getItem(THEME_CLE);
    var theme   = donnees ? JSON.parse(donnees) : {};

    var map = {
        '--rose-fonce':  'color-rose-fonce',
        '--or':          'color-or',
        '--blanc-casse': 'color-fond',
        '--texte-fonce': 'color-texte',
        '--rose-poudre': 'color-rose-poudre'
    };

    Object.keys(map).forEach(function(variable) {
        var input = document.getElementById(map[variable]);
        var span  = document.getElementById('val-' + map[variable].replace('color-', ''));
        if (input && theme[variable]) {
            input.value = theme[variable];
            if (span) span.textContent = theme[variable];
        }
    });

    // Police
    if (theme['--police']) {
        document.querySelectorAll('input[name="police"]').forEach(function(radio) {
            if (radio.value === theme['--police']) radio.checked = true;
        });
    }

    // Textes
    var nomSite = localStorage.getItem('site_nom');
    var sousNom = localStorage.getItem('site_sous_nom');
    var annonce = localStorage.getItem('site_annonce');
    if (nomSite) document.getElementById('champ-nom-site').value = nomSite;
    if (sousNom) document.getElementById('champ-sous-nom').value = sousNom;
    if (annonce) document.getElementById('champ-annonce').value  = annonce;
}

// ============================================
// PERSISTANCE PRODUITS
// ============================================

function lireProduits() {
    var stockCustom = localStorage.getItem(PRODUITS_CLE);
    if (stockCustom) {
        try { return JSON.parse(stockCustom); } catch (e) {}
    }
    return PRODUITS_DEFAUT.map(function(p) { return Object.assign({}, p); });
}

function sauvegarderProduits(produits) {
    localStorage.setItem(PRODUITS_CLE, JSON.stringify(produits));
}

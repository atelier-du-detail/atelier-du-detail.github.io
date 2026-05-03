// ============================================
// ADMIN.JS
// Gestion de l'espace administration.
// ============================================

// Authentification via Firebase Auth. L'email est hardcode :
// Cassandra ne tape que le mot de passe, comme avant.
// Le mot de passe Firebase est defini dans la console Firebase, pas dans ce code.
var EMAIL_ADMIN        = 'abonnessansvideos620@gmail.com';
var PRODUITS_CLE       = 'produits_custom';
var THEME_CLE          = 'theme_custom';

var prochainId   = 1;
var idEnEdition  = null;
var imageEnCours = null; // base64 ou null (pas de changement) ou '' (suppression)

// ============================================
// DEMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initialiserLogin();
    initialiserNavigation();
    initialiserBoutons();
    initialiserApparence();
    initialiserExportImport();

    // Reagit a l'etat d'authentification Firebase :
    // - connecte -> on synchronise depuis le cloud puis on affiche le dashboard
    // - deconnecte -> on affiche le login
    if (window.FirebaseSync && FirebaseSync.disponible) {
        FirebaseSync.surChangementAuth(function(user) {
            if (user) {
                FirebaseSync.chargerCloud()
                    .catch(function(err) {
                        console.warn('Sync cloud impossible :', err);
                    })
                    .then(afficherDashboard);
            } else {
                afficherLogin();
            }
        });
    } else {
        // Mode degrade : Firebase indisponible, on reste en localStorage
        afficherLogin();
    }
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

        if (!window.FirebaseSync || !FirebaseSync.disponible) {
            btn.disabled = false;
            document.getElementById('groupe-motdepasse').classList.add('champ-erreur');
            return;
        }

        FirebaseSync.connecter(EMAIL_ADMIN, saisie)
            .then(function() {
                btn.disabled = false;
                document.getElementById('groupe-motdepasse').classList.remove('champ-erreur');
                // L'affichage du dashboard est declenche par surChangementAuth
            })
            .catch(function() {
                btn.disabled = false;
                document.getElementById('groupe-motdepasse').classList.add('champ-erreur');
                document.getElementById('motdepasse').value = '';
            });
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
        if (window.FirebaseSync && FirebaseSync.disponible) {
            FirebaseSync.deconnecter();
            // surChangementAuth se chargera d'afficher le login
        } else {
            afficherLogin();
        }
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

    var idImageAffectee = null;

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
        if (imageEnCours) {
            localStorage.setItem('img_' + prochainId, imageEnCours);
            idImageAffectee = prochainId;
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
        if (imageEnCours === '') {
            localStorage.removeItem('img_' + idEnEdition);
            idImageAffectee = idEnEdition;
        } else if (imageEnCours) {
            localStorage.setItem('img_' + idEnEdition, imageEnCours);
            idImageAffectee = idEnEdition;
        }
    }

    sauvegarderProduits(produits);
    if (idImageAffectee !== null) {
        synchroniserImageCloud(idImageAffectee, imageEnCours);
    }
    fermerFormulaire();
    chargerTableau();
}

function supprimerProduit(id) {
    if (!confirm('Supprimer ce produit ? Cette action est irreversible.')) return;
    localStorage.removeItem('img_' + id);
    var produits = lireProduits().filter(function(p) { return p.id !== id; });
    sauvegarderProduits(produits);
    synchroniserImageCloud(id, ''); // suppression dans Firestore
    chargerTableau();
}

// Repercute la modification d'image dans Firestore (echec silencieux : localStorage reste source de verite locale)
function synchroniserImageCloud(produitId, base64) {
    if (!window.FirebaseSync || !FirebaseSync.disponible) return;
    var promesse = (typeof base64 === 'string' && base64.indexOf('data:image/') === 0)
        ? FirebaseSync.sauvegarderImageCloud(produitId, base64)
        : FirebaseSync.supprimerImageCloud(produitId);
    promesse.catch(function(err) { console.warn('Sync image cloud echouee :', err); });
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
        synchroniserConfigCloud();

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
        synchroniserConfigCloud();
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
    synchroniserConfigCloud();
}

// Pousse produits + theme + textes dans Firestore (echec silencieux, localStorage reste a jour)
function synchroniserConfigCloud() {
    if (!window.FirebaseSync || !FirebaseSync.disponible) return;
    var theme = lireThemeBrut();
    var payload = {
        produits: lireProduits(),
        theme:    theme,
        textes:   {
            nom:     localStorage.getItem('site_nom')      || '',
            sousNom: localStorage.getItem('site_sous_nom') || '',
            annonce: localStorage.getItem('site_annonce')  || ''
        }
    };
    FirebaseSync.sauvegarderCloud(payload).catch(function(err) {
        console.warn('Sync config cloud echouee :', err);
    });
}

// ============================================
// EXPORT / IMPORT DE LA CONFIGURATION
// Permet a l'admin de sauvegarder son travail dans un fichier
// et de le restaurer plus tard ou sur un autre navigateur.
// ============================================

var POLICES_AUTORISEES_EXPORT = [
    'Georgia, serif',
    "'Palatino Linotype', Palatino, serif",
    "Garamond, 'EB Garamond', serif",
    "'Book Antiqua', Palatino, serif",
    "'Times New Roman', Times, serif"
];

function initialiserExportImport() {
    var btnExporter = document.getElementById('btn-exporter-config');
    var btnImporter = document.getElementById('btn-importer-config');
    var inputFichier = document.getElementById('champ-import-config');

    if (!btnExporter || !btnImporter || !inputFichier) return;

    btnExporter.addEventListener('click', exporterConfig);

    btnImporter.addEventListener('click', function() {
        inputFichier.click();
    });

    inputFichier.addEventListener('change', function() {
        var fichier = inputFichier.files[0];
        if (fichier) importerConfig(fichier);
        inputFichier.value = '';
    });
}

function exporterConfig() {
    var config = {
        version:    1,
        exporteLe:  new Date().toISOString(),
        produits:   lireProduits(),
        theme:      lireThemeBrut(),
        textes:     {
            nom:      localStorage.getItem('site_nom')      || '',
            sousNom:  localStorage.getItem('site_sous_nom') || '',
            annonce:  localStorage.getItem('site_annonce') || ''
        },
        images:     collecterImages()
    };

    var blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    var date = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = 'atelier-du-detail-config-' + date + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    afficherMessageSauvegarde('Configuration exportee. Conservez bien ce fichier.', 'succes');
}

function lireThemeBrut() {
    var donnees = localStorage.getItem(THEME_CLE);
    if (!donnees) return {};
    try { return JSON.parse(donnees) || {}; }
    catch (e) { return {}; }
}

function collecterImages() {
    var images = {};
    for (var i = 0; i < localStorage.length; i++) {
        var cle = localStorage.key(i);
        if (cle && cle.indexOf('img_') === 0) {
            var val = localStorage.getItem(cle);
            if (estImageBase64Valide(val)) {
                images[cle.substring(4)] = val;
            }
        }
    }
    return images;
}

function importerConfig(fichier) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var config;
        try {
            config = JSON.parse(e.target.result);
        } catch (err) {
            afficherMessageSauvegarde('Fichier invalide : ce n\'est pas un JSON lisible.', 'erreur');
            return;
        }

        if (!config || typeof config !== 'object' || config.version !== 1) {
            afficherMessageSauvegarde('Fichier invalide : structure inattendue ou version non supportee.', 'erreur');
            return;
        }

        if (!confirm('Importer cette configuration va remplacer tous vos produits, photos, couleurs et textes actuels. Continuer ?')) {
            return;
        }

        try {
            appliquerImport(config);
        } catch (err) {
            afficherMessageSauvegarde('Erreur a l\'import : ' + err.message, 'erreur');
            return;
        }

        afficherMessageSauvegarde('Configuration importee. La page va se recharger.', 'succes');
        setTimeout(function() { location.reload(); }, 1200);
    };
    reader.onerror = function() {
        afficherMessageSauvegarde('Impossible de lire le fichier.', 'erreur');
    };
    reader.readAsText(fichier);
}

function appliquerImport(config) {
    // 1) Produits
    if (Array.isArray(config.produits)) {
        var produitsValides = config.produits.filter(estProduitValide);
        localStorage.setItem(PRODUITS_CLE, JSON.stringify(produitsValides));
    }

    // 2) Theme
    if (config.theme && typeof config.theme === 'object') {
        var themeNettoye = nettoyerTheme(config.theme);
        if (Object.keys(themeNettoye).length > 0) {
            localStorage.setItem(THEME_CLE, JSON.stringify(themeNettoye));
        } else {
            localStorage.removeItem(THEME_CLE);
        }
    }

    // 3) Textes
    if (config.textes && typeof config.textes === 'object') {
        ecrireTexte('site_nom',      config.textes.nom);
        ecrireTexte('site_sous_nom', config.textes.sousNom);
        ecrireTexte('site_annonce',  config.textes.annonce);
    }

    // 4) Images : on remet a zero les images existantes pour eviter le melange
    purgerImages();
    var imagesAUploader = [];
    if (config.images && typeof config.images === 'object') {
        Object.keys(config.images).forEach(function(id) {
            var val = config.images[id];
            if (/^\d+$/.test(id) && estImageBase64Valide(val)) {
                localStorage.setItem('img_' + id, val);
                imagesAUploader.push({ id: id, data: val });
            }
        });
    }

    // 5) Repercussion dans Firestore (best-effort)
    synchroniserConfigCloud();
    if (window.FirebaseSync && FirebaseSync.disponible) {
        imagesAUploader.forEach(function(img) {
            FirebaseSync.sauvegarderImageCloud(img.id, img.data)
                .catch(function(err) { console.warn('Sync image cloud echouee :', err); });
        });
    }
}

function estProduitValide(p) {
    return p && typeof p === 'object'
        && typeof p.id === 'number' && p.id >= 0
        && typeof p.nom === 'string' && p.nom.length > 0
        && typeof p.categorie === 'string'
        && typeof p.prix === 'number' && p.prix >= 0
        && typeof p.stock === 'number' && p.stock >= 0
        && typeof p.description === 'string';
}

function nettoyerTheme(theme) {
    var couleurs = ['--rose-fonce', '--or', '--blanc-casse', '--texte-fonce', '--rose-poudre', '--rose-moyen'];
    var nettoye = {};
    couleurs.forEach(function(v) {
        if (typeof theme[v] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(theme[v])) {
            nettoye[v] = theme[v];
        }
    });
    if (typeof theme['--police'] === 'string' && POLICES_AUTORISEES_EXPORT.indexOf(theme['--police']) !== -1) {
        nettoye['--police'] = theme['--police'];
    }
    return nettoye;
}

function ecrireTexte(cle, valeur) {
    if (typeof valeur === 'string' && valeur.trim() !== '') {
        localStorage.setItem(cle, valeur.trim());
    } else {
        localStorage.removeItem(cle);
    }
}

function purgerImages() {
    var aSupprimer = [];
    for (var i = 0; i < localStorage.length; i++) {
        var cle = localStorage.key(i);
        if (cle && cle.indexOf('img_') === 0) aSupprimer.push(cle);
    }
    aSupprimer.forEach(function(cle) { localStorage.removeItem(cle); });
}

function afficherMessageSauvegarde(texte, type) {
    var zone = document.getElementById('sauvegarde-message');
    if (!zone) return;
    zone.textContent = texte;
    zone.className = 'sauvegarde-message sauvegarde-message--' + type;
    zone.style.display = 'block';
    setTimeout(function() { zone.style.display = 'none'; }, 5000);
}

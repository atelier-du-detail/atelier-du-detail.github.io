// ============================================
// FIREBASE.JS
// Init Firebase + synchronisation cloud des donnees admin.
// Doit etre charge AVANT les autres scripts (theme.js, layout.js, etc.)
// car les helpers FirebaseSync.* sont utilises par admin.js et au demarrage des pages.
//
// Modele Firestore :
//   siteConfig/main  -> { produits, theme, textes, updatedAt }
//   siteImages/<id>  -> { data: "data:image/..." }   (un doc par image, pour ne pas exploser la limite 1 MB par doc)
// ============================================

(function() {

    // -- Configuration Firebase (clefs publiques par design, securite via les regles Firestore) --
    var firebaseConfig = {
        apiKey:            'AIzaSyDHeaL37dynfuzbJgFVtJ5vtbP7DctQ29E',
        authDomain:        'atelier-du-detail.firebaseapp.com',
        projectId:         'atelier-du-detail',
        storageBucket:     'atelier-du-detail.firebasestorage.app',
        messagingSenderId: '977462770684',
        appId:             '1:977462770684:web:140c6f46cdb1cf53011079'
    };

    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK non charge. Le mode hors-ligne (localStorage) sera utilise.');
        window.FirebaseSync = creerFauxSync();
        return;
    }

    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }

    var auth = firebase.auth();
    var db   = firebase.firestore();

    var COL_CONFIG = 'siteConfig';
    var DOC_CONFIG = 'main';
    var COL_IMAGES = 'siteImages';

    // ============================================
    // SYNC CLOUD -> LOCALSTORAGE
    // Lit le document de config + toutes les images, et ecrit dans localStorage.
    // ============================================
    function chargerCloud() {
        return db.collection(COL_CONFIG).doc(DOC_CONFIG).get().then(function(docSnap) {
            if (!docSnap.exists) return false;

            var data = docSnap.data();

            if (Array.isArray(data.produits)) {
                localStorage.setItem('produits_custom', JSON.stringify(data.produits));
            }
            if (data.theme && typeof data.theme === 'object') {
                localStorage.setItem('theme_custom', JSON.stringify(data.theme));
            }
            if (data.textes && typeof data.textes === 'object') {
                ecrireTexteLocal('site_nom',      data.textes.nom);
                ecrireTexteLocal('site_sous_nom', data.textes.sousNom);
                ecrireTexteLocal('site_annonce',  data.textes.annonce);
            }

            return chargerImagesCloud();
        });
    }

    function chargerImagesCloud() {
        return db.collection(COL_IMAGES).get().then(function(snap) {
            // Purge des images locales avant d'appliquer celles du cloud
            var aSupprimer = [];
            for (var i = 0; i < localStorage.length; i++) {
                var cle = localStorage.key(i);
                if (cle && cle.indexOf('img_') === 0) aSupprimer.push(cle);
            }
            aSupprimer.forEach(function(cle) { localStorage.removeItem(cle); });

            snap.forEach(function(doc) {
                var id  = doc.id;
                var img = doc.data().data;
                if (typeof img === 'string' && img.indexOf('data:image/') === 0) {
                    localStorage.setItem('img_' + id, img);
                }
            });
            return true;
        });
    }

    // ============================================
    // SYNC LOCALSTORAGE -> CLOUD
    // Ecrit le doc de config (produits + theme + textes) dans Firestore.
    // ============================================
    function sauvegarderCloud(payload) {
        var doc = {
            produits:  payload.produits  || [],
            theme:     payload.theme     || {},
            textes:    payload.textes    || {},
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        return db.collection(COL_CONFIG).doc(DOC_CONFIG).set(doc, { merge: true });
    }

    function sauvegarderImageCloud(produitId, base64) {
        return db.collection(COL_IMAGES).doc(String(produitId)).set({ data: base64 });
    }

    function supprimerImageCloud(produitId) {
        return db.collection(COL_IMAGES).doc(String(produitId)).delete();
    }

    // ============================================
    // AUTH
    // ============================================
    function connecter(email, motDePasse) {
        return auth.signInWithEmailAndPassword(email, motDePasse);
    }

    function deconnecter() {
        return auth.signOut();
    }

    function utilisateurActuel() {
        return auth.currentUser;
    }

    function surChangementAuth(callback) {
        return auth.onAuthStateChanged(callback);
    }

    // ============================================
    // OUTILS
    // ============================================
    function ecrireTexteLocal(cle, valeur) {
        if (typeof valeur === 'string' && valeur.trim() !== '') {
            localStorage.setItem(cle, valeur.trim());
        } else {
            localStorage.removeItem(cle);
        }
    }

    function creerFauxSync() {
        // Stub utilise quand Firebase n'est pas charge (mode offline)
        var rejet = function() { return Promise.reject(new Error('Firebase non disponible')); };
        return {
            chargerCloud:           function() { return Promise.resolve(false); },
            sauvegarderCloud:       rejet,
            sauvegarderImageCloud:  rejet,
            supprimerImageCloud:    rejet,
            connecter:              rejet,
            deconnecter:            function() { return Promise.resolve(); },
            utilisateurActuel:      function() { return null; },
            surChangementAuth:      function(cb) { cb(null); return function() {}; },
            disponible:             false
        };
    }

    window.FirebaseSync = {
        chargerCloud:           chargerCloud,
        sauvegarderCloud:       sauvegarderCloud,
        sauvegarderImageCloud:  sauvegarderImageCloud,
        supprimerImageCloud:    supprimerImageCloud,
        connecter:              connecter,
        deconnecter:            deconnecter,
        utilisateurActuel:      utilisateurActuel,
        surChangementAuth:      surChangementAuth,
        disponible:             true
    };

    // ============================================
    // SYNC AUTO POUR LES PAGES PUBLIQUES
    // L'admin.html gere son propre cycle de sync (apres login).
    // Sur les autres pages : on lit Firestore et, si la donnee a change
    // par rapport a localStorage, on recharge UNE fois la page (flag sessionStorage)
    // pour que toute l'UI (catalogue, theme, header, etc.) reflete la version cloud.
    // ============================================
    function pageEstAdmin() {
        return /admin\.html$/i.test(location.pathname);
    }

    function snapshotLocal() {
        return [
            localStorage.getItem('produits_custom') || '',
            localStorage.getItem('theme_custom')    || '',
            localStorage.getItem('site_nom')        || '',
            localStorage.getItem('site_sous_nom')   || '',
            localStorage.getItem('site_annonce')    || ''
        ].join('|');
    }

    if (!pageEstAdmin()) {
        var avant = snapshotLocal();
        chargerCloud().then(function(ok) {
            if (!ok) return;
            var apres = snapshotLocal();
            if (avant !== apres && !sessionStorage.getItem('firebase_synced')) {
                sessionStorage.setItem('firebase_synced', '1');
                location.reload();
            }
        }).catch(function(err) {
            console.warn('Sync cloud (lecture) echouee :', err);
        });
    }

})();

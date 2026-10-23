/* =====================================================================
   VILLA VERDUN — CASSIS
   Interactions de la page : navigation, révélations, modale brochure,
   galerie plein écran.
   ===================================================================== */
(function () {
  'use strict';

  /* =====================================================================
     FOND ANIMÉ DU HERO

     Deux sources possibles, dans cet ordre de préférence :

     1. HERO_VIDEO — des fichiers servis depuis le dépôt. C'est la
        meilleure option : pas de tiers, pas de logo, contrôle total du
        cadrage et de la boucle. À privilégier dès que des images
        propres au bien seront disponibles.

     2. HERO_VIDEO_ID — une vidéo YouTube intégrée via l'API officielle,
        en domaine sans cookie. Nécessite l'accord de son auteur pour un
        usage commercial.

     Dans les deux cas la photo reste dessous : elle s'affiche tout de
     suite et prend le relais si la vidéo ne démarre pas.
     ===================================================================== */
  /* Teaser tourné pour le bien. Deux définitions : la légère est servie aux
     petits écrans, où elle pèse moins du tiers de la large. Les deux sont
     muettes (l'autoplay l'exige) et encodées en faststart, pour que la lecture
     démarre sans attendre la fin du téléchargement. */
  /* Fond du hero, sur grand écran seulement. Le fichier est amputé de ses sept
     premières secondes : le carton-titre « Villa VERDUN » s'y affichait
     derrière le titre de la page et rendait les deux illisibles. Couper plutôt
     que se positionner à la lecture, pour que la boucle reparte au bon endroit
     à chaque tour. Sur petit écran, le fond reste la photo et la vidéo est
     présentée telle quelle, en lecteur, sous le texte. */
  var HERO_VIDEO = [
    ['assets/video/fond-verdun-720.webm', 'video/webm'],
    ['assets/video/fond-verdun-720.mp4',  'video/mp4']
  ];
  var HERO_VIDEO_ID    = 'UE3kntZkW8o';     /* repli : Cassis vue du ciel — Polychronis Film */
  var HERO_VIDEO_START = 40;                /* secondes */

  var heroVideo = document.getElementById('heroVideo');

  function prefersStillImage() {
    /* Animations désactivées, écran étroit, ou forfait en données réduites :
       on garde la photo, qui est plus légère et tout aussi juste. */
    if (!heroVideo) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    var c = navigator.connection;
    if (c && (c.saveData || /^(slow-)?2g$/.test(c.effectiveType || ''))) return true;
    /* En dessous de 1200 px, la carte de capture passe sous le texte et la
       visite vidéo s'intercale entre les deux : le fond ferait double emploi,
       deux lectures simultanées pour un seul teaser. La photo reste. */
    if (window.matchMedia('(max-width: 1200px)').matches) return true;
    return false;
  }

  function mountFichier() {
    var v = document.createElement('video');
    /* Le WebM d'abord : plus léger, lu par tout ce qui n'est pas un vieux
       Safari, qui prend alors le MP4. Le navigateur choisit la première
       source qu'il sait lire, on ne décide rien à sa place. */
    for (var i = 0; i < HERO_VIDEO.length; i++) {
      var s = document.createElement('source');
      s.src = HERO_VIDEO[i][0];
      s.type = HERO_VIDEO[i][1];
      v.appendChild(s);
    }
    v.muted = true; v.defaultMuted = true;
    v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('preload', 'metadata');
    v.addEventListener('playing', function () { heroVideo.classList.add('is-playing'); });
    heroVideo.appendChild(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* refus d'autoplay : la photo reste */ });
  }

  var ytPlayer = null;

  function mountYouTube() {
    var holder = document.createElement('div');
    holder.id = 'heroYt';
    heroVideo.appendChild(holder);

    window.onYouTubeIframeAPIReady = function () {
      ytPlayer = new YT.Player('heroYt', {
        videoId: HERO_VIDEO_ID,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, disablekb: 1,
          start: HERO_VIDEO_START, playsinline: 1,
          modestbranding: 1, rel: 0, fs: 0, iv_load_policy: 3
        },
        events: {
          onReady: function (e) { e.target.mute(); e.target.playVideo(); },
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.PLAYING) {
              heroVideo.classList.add('is-playing');
            } else if (e.data === YT.PlayerState.ENDED) {
              /* Le paramètre loop repartirait de zéro : on revient au
                 point de départ choisi. */
              e.target.seekTo(HERO_VIDEO_START, true);
              e.target.playVideo();
            }
          },
          onError: function () { heroVideo.classList.remove('is-playing'); }
        }
      });
    };

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  }

  if (!prefersStillImage()) {
    if (HERO_VIDEO) mountFichier();
    else if (HERO_VIDEO_ID) mountYouTube();
  }

  /* Le hero sort du champ : on met en pause pour épargner la batterie. */
  if (heroVideo && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      var v = heroVideo.querySelector('video');
      if (v) { visible ? v.play().catch(function () {}) : v.pause(); }
      else if (ytPlayer && ytPlayer.playVideo) {
        visible ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
      }
    }, { threshold: 0 }).observe(document.getElementById('hero'));
  }

  /* ---------- Nav : état au scroll ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('navBurger');
  var navMobile = document.getElementById('navMobile');
  if (burger && navMobile) {
    burger.addEventListener('click', function () {
      var open = navMobile.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- CTA flottante : visible dès qu'aucune autre n'est à l'écran ---
     Elle suivait la sortie du HERO. Le hero mesure près de 1 000 px sur
     mobile : il fallait donc le traverser en entier — titre, sous-titre et
     vidéo — avant qu'un bouton n'apparaisse. Pendant tout ce temps, un
     visiteur venu d'une publicité n'avait rien à toucher.

     Elle suit maintenant le bouton du premier écran, ce qui exprime la vraie
     règle : « aucun appel à l'action visible → en montrer un ». Le relais se
     fait au pixel près, sans recouvrement et sans trou. */
  var stickyCta = document.getElementById('stickyCta');
  var carte = document.getElementById('brochureForm');
  /* On suit le BOUTON de la carte, pas la carte.
     Sur un grand écran, la carte entrait dans le champ alors que son bouton
     etait encore dessous : la barre s'eteignait, et il ne restait rien a
     toucher. Le bouton est la seule chose dont l'absence compte. */
  var boutonCarte = carte && carte.querySelector('.js-open-brochure');
  if (stickyCta && boutonCarte && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 1 }).observe(boutonCarte);
  } else if (stickyCta) {
    /* Sans IntersectionObserver, mieux vaut une barre toujours là qu'un
       visiteur sans bouton : le défaut est le choix sûr. */
    stickyCta.classList.add('is-visible');
  }

  /* ---------- Le cadenas de la carte s'ouvre quand elle arrive ----------
     Il se déverrouille UNE fois, à l'entrée à l'écran. Rejouer l'animation à
     chaque passage la transformerait en clignotement, et un mouvement qui se
     répète cesse d'être lu comme un signal. */
  if (carte && 'IntersectionObserver' in window) {
    var sceau = new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      /* Un temps avant l'ouverture : le geste doit être VU, et il ne l'est
         pas s'il a déjà eu lieu quand le regard arrive. */
      setTimeout(function () { carte.classList.add('is-ouvert'); }, 420);
      obs.disconnect();
    }, { threshold: 0.35 });
    sceau.observe(carte);
  } else if (carte) {
    carte.classList.add('is-ouvert');
  }

  /* ---------- Chiffres qui s'incrémentent ----------
     Les nombres de la carte d'identité montent depuis zéro à leur première
     apparition. Rien ne bouge si l'utilisateur a réduit les animations : la
     valeur finale est déjà écrite dans le HTML, elle reste simplement
     affichée — et il en va de même sans JavaScript. */
  var compteurs = document.querySelectorAll('.tile__num');
  var animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function incrementer(el) {
    var cible = parseInt(el.dataset.vers, 10);
    if (isNaN(cible)) return;
    var duree = 1100;
    var debut = null;
    function pas(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      /* Décélération : le chiffre part vite et se pose sur sa valeur. */
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(cible * e);
      if (p < 1) requestAnimationFrame(pas);
      else el.textContent = cible;
    }
    requestAnimationFrame(pas);
  }

  if (compteurs.length && !animationsReduites && 'IntersectionObserver' in window) {
    var obsChiffres = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        incrementer(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    compteurs.forEach(function (el) { el.textContent = '0'; obsChiffres.observe(el); });
  }

  /* ---------- Révélations au scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =====================================================================
     MODALE BROCHURE
     ===================================================================== */
  var modal = document.getElementById('brochureModal');
  var formContainer = document.getElementById('brochureFormContainer');
  var openBtns = document.querySelectorAll('.js-open-brochure');
  var closeEls = document.querySelectorAll('.js-close-modal');
  var scrollY = 0;
  var lastFocused = null;

  /* ---------- LA VISITE VIDÉO : lecture automatique, et plein écran en un geste
     ----------------------------------------------------------------------
     TROIS DÉFAUTS CONSTATÉS, MESURÉS SUR LES FICHIERS RÉELS.

     1. ON NE TROUVAIT PAS LE PLEIN ÉCRAN. La vignette fait 350 x 233 px sur
        un téléphone, et la commande était une icône de 18 px dans son coin.
        Le geste naturel — toucher la vidéo — ne faisait rien, parce que le
        <video> est en pointer-events: none (sans quoi les contrôles d'iOS
        s'ouvrent par-dessus les nôtres). Désormais la surface entière ouvre
        le plein écran, avec le son, et elle le dit.

     2. SUR GRAND ÉCRAN, IL N'Y AVAIT AUCUNE PORTE. Au-dessus de 1200 px la
        vignette est masquée et c'est la vidéo de couverture qui joue :
        décorative, sans piste audio, sans commande. On ne pouvait donc pas
        regarder la visite depuis un ordinateur. La pilule « Voir la visite »
        ouvre le même lecteur.

     3. LA LECTURE N'ÉTAIT PAS FLUIDE SUR ORDINATEUR, et pour une raison
        invisible : la vignette masquée se téléchargeait et se décodait quand
        même. 10,2 Mo de vidéo et deux décodages simultanés à 30 images par
        seconde, dont un pour une image que personne ne voyait. La lecture
        n'est plus lancée que là où la vignette est visible.

     CE QUI N'EST PAS POSSIBLE, ET QU'IL FAUT DIRE : ouvrir le plein écran
     TOUT SEUL au chargement. Tous les navigateurs l'exigent déclenché par un
     geste. Le plus direct qu'on puisse faire, et qui est fait ici, c'est un
     seul contact n'importe où sur la vidéo. */
  var visite = document.querySelector('.hero__shot video');
  var figure = document.querySelector('.hero__shot');
  var couche = document.getElementById('visite');
  var scene  = document.getElementById('visiteScene');
  var bSon   = document.querySelector('.js-son');

  if (visite) {

    /* Vrai pendant que la couche « grand écran » est ouverte : la mise en
       pause hors champ ne doit pas s'appliquer à une vidéo qu'on regarde. */
    var estOuverte = false;

    /* ---- Lecture en vignette, là où la vignette existe ---- */

    /* Le même seuil que la feuille de style. Les deux doivent rester d'accord :
       lancer la lecture d'un élément masqué, c'est le défaut nº 3. */
    var enVignette = window.matchMedia('(max-width: 1200px)');

    function marquerArretee(oui) {
      if (figure) figure.classList.toggle('is-arretee', oui);
    }

    function lancer() {
      /* Un play() sur une vidéo qui joue déjà ne sert à rien. */
      if (!visite.paused) return;
      if (!enVignette.matches) return;
      if (visite.preload !== 'auto') visite.preload = 'auto';
      var p = visite.play();
      if (p && p.catch) p.catch(function () { marquerArretee(true); });
    }

    visite.addEventListener('playing', function () { marquerArretee(false); });

    /*
     * ON RELANCE QUAND LES IMAGES ARRIVENT, et pas seulement au chargement.
     * À la première visite le fichier n'est pas en cache : le premier play()
     * partait alors qu'aucune image n'était disponible, et s'il échouait, RIEN
     * ne réessayait. Au rechargement la vidéo était en cache et elle partait —
     * d'où « il faut rafraîchir pour qu'elle se lance ».
     */
    ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (e) {
      visite.addEventListener(e, lancer);
    });

    /* Revenir sur l'onglet, ou sortir du multitâche : iOS suspend la lecture
       et ne la reprend pas toujours seul. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) lancer();
    });

    /* Dernier recours, le geste du visiteur. */
    ['touchstart', 'pointerdown'].forEach(function (e) {
      document.addEventListener(e, lancer, { once: true, passive: true });
    });

    /* Le refus de lecture automatique est SILENCIEUX : mode économie d'énergie
       sur iPhone, navigateur intégré de Facebook ou d'Instagram, réglage
       « ne jamais lire » de Safari. Sans ce contrôle, il ne restait qu'une
       affiche immobile et rien ne disait quoi faire. */
    setTimeout(function () {
      if (enVignette.matches && visite.paused) marquerArretee(true);
    }, 1800);

    /* Hors champ, on met en pause : la batterie d'abord. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (entrees[i].isIntersecting) lancer();
          else if (!estOuverte) visite.pause();
        }
      }, { threshold: 0.25 }).observe(visite);
    }

    /* Le navigateur qu'on redimensionne, ou le téléphone qu'on tourne. */
    var surChangement = function () {
      if (enVignette.matches) lancer();
      else { visite.pause(); marquerArretee(false); }
    };
    if (enVignette.addEventListener) enVignette.addEventListener('change', surChangement);
    else if (enVignette.addListener) enVignette.addListener(surChangement);
    lancer();

    /* ---- Le son, sans quitter la page ---- */
    if (bSon) {
      bSon.addEventListener('click', function (e) {
        e.stopPropagation();          /* sinon on ouvre aussi le plein écran */
        visite.muted = !visite.muted;
        majBoutonSon();
        if (!visite.muted) lancer();
      });
    }

    function majBoutonSon() {
      if (!bSon) return;
      bSon.classList.toggle('is-audible', !visite.muted);
      bSon.setAttribute('aria-label', visite.muted ? 'Activer le son' : 'Couper le son');
    }

    /* ---- Le plein écran, en un seul contact ---- */

    function pleinEcranPossible() {
      return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    }

    function demanderPleinEcran(el) {
      var f = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (!f) return;
      try {
        var r = f.call(el);
        /* Un refus n'est pas un échec : la couche occupe déjà tout l'écran. */
        if (r && r.catch) r.catch(function () {});
      } catch (err) { /* idem */ }
    }

    /*
     * LA HAUTE DÉFINITION, AU PLEIN ÉCRAN SEULEMENT.
     *
     * La vignette fait 350 px de large : une source 720p y est déjà au-delà
     * du nécessaire, et elle démarre toute seule — lui imposer la 1080p
     * ferait payer à chaque visiteur un débit qu'il ne verra pas.
     *
     * Le plein écran, lui, est un geste délibéré. Sur un téléphone en
     * paysage, l'image occupe plus de 2500 pixels de large : c'est là que la
     * définition se voit, et c'est là qu'on la sert.
     *
     * On ne redescend PAS en 720p en sortant : la haute définition est déjà
     * téléchargée, et recharger coûterait une seconde d'attente pour rien.
     */
    function passerEnHauteDefinition() {
      var hd = visite.getAttribute("data-hd");
      if (!hd || visite.dataset.enHd === "1") return;
      visite.dataset.enHd = "1";
      var instant = visite.currentTime;
      var jouait = !visite.paused;
      visite.src = hd;                 /* `src` prime sur les <source> */
      visite.load();
      var reprendre = function () {
        visite.removeEventListener("loadedmetadata", reprendre);
        try { visite.currentTime = instant; } catch (e) { /* source trop courte */ }
        if (jouait) { var p = visite.play(); if (p && p.catch) p.catch(function () {}); }
      };
      visite.addEventListener("loadedmetadata", reprendre);
    }

    function ouvrirVisite(ev) {
      /* Les portes sont des liens vers le fichier, pour que la visite reste
         accessible sans JavaScript. Ici, on fait mieux que le lecteur brut. */
      if (ev && ev.preventDefault) ev.preventDefault();
      passerEnHauteDefinition();
      visite.muted = false;
      majBoutonSon();

      /*
       * SAFARI SUR IPHONE n'a de plein écran que sur l'élément vidéo lui-même
       * (`webkitEnterFullscreen`), jamais sur un conteneur. Il faut l'appeler
       * DANS le geste, sans attendre une promesse : différer, c'est perdre
       * l'autorisation que le contact venait de donner.
       */
      if (!pleinEcranPossible() && typeof visite.webkitEnterFullscreen === 'function') {
        visite.setAttribute('controls', '');
        var p = visite.play();
        if (p && p.catch) p.catch(function () {});
        if (visite.readyState >= 1) {
          try { visite.webkitEnterFullscreen(); return; } catch (err) { /* on continue */ }
        }
        /* Métadonnées pas encore là : on tente dès qu'elles arrivent. Le
           navigateur peut refuser, et la couche ci-dessous prend le relais. */
        visite.addEventListener('loadedmetadata', function une() {
          visite.removeEventListener('loadedmetadata', une);
          try { visite.webkitEnterFullscreen(); } catch (err) { ouvrirCouche(); }
        });
        return;
      }

      ouvrirCouche();
    }

    function ouvrirCouche() {
      if (!couche || !scene) return;
      estOuverte = true;
      visite.setAttribute('controls', '');
      /* On DÉPLACE la vidéo du flux : elle est déjà en mémoire tampon. Un
         second élément aurait retéléchargé le teaser, et une vidéo qui
         repart de zéro n'est pas « direct en grand écran ». */
      scene.appendChild(visite);
      couche.hidden = false;
      document.body.classList.add('visite-ouverte');
      demanderPleinEcran(couche);
      var p = visite.play();
      if (p && p.catch) p.catch(function () {});
    }

    function fermerVisite() {
      if (!estOuverte) return;
      estOuverte = false;
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        var x = document.exitFullscreen || document.webkitExitFullscreen;
        if (x) { try { x.call(document); } catch (err) {} }
      }
      if (couche) couche.hidden = true;
      document.body.classList.remove('visite-ouverte');
      visite.removeAttribute('controls');
      visite.muted = true;
      majBoutonSon();
      /* Remise à sa place, devant la légende. */
      if (figure) figure.insertBefore(visite, figure.firstChild);
      lancer();
    }

    var portes = document.querySelectorAll('.js-visite');
    for (var i = 0; i < portes.length; i++) {
      portes[i].addEventListener('click', ouvrirVisite);
    }

    var bFermer = document.getElementById('visiteFermer');
    if (bFermer) bFermer.addEventListener('click', fermerVisite);

    /* Sortir du plein écran par la croix du navigateur ferme aussi la couche :
       rester sur une vidéo géante au milieu de la page serait incompréhensible. */
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (e) {
      document.addEventListener(e, function () {
        if (estOuverte && !document.fullscreenElement && !document.webkitFullscreenElement) {
          fermerVisite();
        }
      });
    });

    /* iPhone : la sortie du lecteur natif remet la vidéo en vignette muette. */
    visite.addEventListener('webkitendfullscreen', function () {
      visite.removeAttribute('controls');
      visite.muted = true;
      majBoutonSon();
      lancer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerVisite();
    });
  }

  /* ---------- Le reflet des CTA ne tourne qu'à l'écran ----------
     Une animation en boucle continue de consommer hors du champ. Sur un
     téléphone, trois boutons qui scintillent pour personne, c'est de la
     batterie dépensée pour rien. La feuille de style les met en pause par
     défaut ; ils ne repartent que lorsqu'ils sont visibles. */
  var eclats = document.querySelectorAll('.btn--eclat');
  if (eclats.length) {
    if ('IntersectionObserver' in window) {
      var oEclat = new IntersectionObserver(function (entrees) {
        for (var e = 0; e < entrees.length; e++) {
          entrees[e].target.classList.toggle('est-en-vue', entrees[e].isIntersecting);
        }
      }, { threshold: 0 });
      for (var ec = 0; ec < eclats.length; ec++) oEclat.observe(eclats[ec]);
    } else {
      /* Sans observateur, on anime : mieux vaut un reflet de trop qu'un
         bouton qui ne bouge jamais. */
      for (var ec2 = 0; ec2 < eclats.length; ec2++) eclats[ec2].classList.add('est-en-vue');
    }
  }

  /* ---------- Formulaire Prodigio ----------
     L'iframe est écrit directement dans la modale, en loading="lazy" : il
     n'est chargé qu'à la première ouverture. Il annonce sa hauteur par
     postMessage, que l'on applique ici pour qu'il n'ait ni barre de
     défilement interne ni blanc en dessous. */
  var PRODIGIO_ORIGINE = 'https://go.prodigio.fr';
  var cadre = document.getElementById('prodigio-form');
  var attente = formContainer ? formContainer.querySelector('.modal__spinner') : null;

  /* ---------- Report de l'attribution publicitaire ----------
     Le formulaire vit sur go.prodigio.fr, dans un cadre : il ne voit donc
     ni le fbclid ni les UTM que la publicite a deposes sur CETTE page.
     Sans eux, Meta recoit bien le prospect, mais ne peut plus le rattacher
     au clic qui l'a amene : l'attribution retombe sur la seule
     correspondance e-mail / telephone, nettement moins fiable.

     On recopie donc ces parametres sur l'adresse du cadre. Liste fermee :
     rien d'autre ne passe, pour ne pas transporter par megarde ce qu'un
     visiteur aurait colle dans son URL. */
  var PARAMS_ATTRIBUTION = [
    'fbclid', 'gclid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'
  ];

  function reporterAttribution() {
    if (!cadre) return;
    var entrants;
    try {
      entrants = new URLSearchParams(window.location.search);
    } catch (e) {
      return; // Navigateur sans URLSearchParams : on ne casse rien.
    }
    var retenus = [];
    for (var i = 0; i < PARAMS_ATTRIBUTION.length; i++) {
      var cle = PARAMS_ATTRIBUTION[i];
      var brut = entrants.get(cle);
      if (!brut) continue;
      var valeur = brut.trim();
      if (!valeur) continue;
      /* Meme plafond que le serveur, qui tronque a 300 caracteres. */
      retenus.push(encodeURIComponent(cle) + '=' + encodeURIComponent(valeur.slice(0, 300)));
    }
    if (!retenus.length) return ''; // Visite directe : il n'y a rien a reporter.
    return '?' + retenus.join('&');
  }

  /* ---------- Chargement anticipe du formulaire ----------
     L'adresse n'est pas dans src : c'est ici qu'on la pose. Laissee dans src
     avec loading="lazy", dans une modale en display:none, elle n'etait
     demandee qu'au clic — le visiteur ouvrait la modale et regardait un cadre
     vide pendant toute la requete, qui part sur un autre domaine et traverse
     un rendu serveur.

     On la pose donc des que l'intention se manifeste : un survol, un doigt
     pose, une mise au point clavier sur l'un des boutons. Et, a defaut, au
     repos de la page : un visiteur arrive sur cette page pour le dossier,
     charger le formulaire d'avance n'est pas du gaspillage.

     Idempotent : la premiere pose gagne, les suivantes ne font rien. */
  var formDemande = false;
  var formCharge = false;

  /* Delai laisse au formulaire pour annoncer sa hauteur APRES que sa page est
     arrivee. Passe ce delai, on l'affiche quand meme, a sa hauteur minimale.

     Le dialogue de hauteur reste la bonne facon de faire : il dit a la fois
     « je suis la » et « voila ma taille ». Mais il peut ne jamais venir pour
     une raison qui ne regarde pas le visiteur — le formulaire charge pendant
     que la modale est masquee, donc a une hauteur de zero, et une version du
     formulaire qui ne republie pas sa hauteur a l'ouverture laisse l'hote dans
     le noir. Entre montrer un formulaire charge sans connaitre sa taille et ne
     rien montrer du tout, le choix est vite fait : le repli WhatsApp reste
     dessous, et la hauteur affinera l'affichage si elle arrive ensuite.

     Ce delai valait 2500 ms : deux secondes et demie de squelette APRES que la
     page du formulaire etait deja arrivee et peinte dans le cadre. On attendait
     un message de hauteur pour afficher quelque chose qui etait pret. Le cadre
     s'affiche donc maintenant des que sa page a fini de charger ; la hauteur,
     si elle arrive ensuite, ne fait qu'ajuster la boite de quelques dizaines de
     pixels. */
  var DELAI_AFFICHAGE_FORCE = 0;
  function chargerLeFormulaire() {
    if (formDemande || !cadre) return;
    formDemande = true;
    /* On NOTE l'arrivee de la page, on ne declenche aucun compte a rebours :
       le visiteur n'attend rien encore, la modale n'est pas ouverte. */
    cadre.addEventListener('load', function () {
      formCharge = true;
      /* On n'affiche QUE si la modale est ouverte : afficher un cadre dans une
         modale fermee ne sert a rien et ferait disparaitre l'esquisse trop
         tot. */
      setTimeout(function () {
        if (!modal || !modal.classList.contains('is-open')) return;
        afficherSansHauteur();
      }, DELAI_AFFICHAGE_FORCE);
    }, { once: true });

    /* Le script en ligne de index.html a normalement deja pose l'adresse : il
       vit dans le meme fichier que le cadre, il ne peut pas etre d'une autre
       version. Ce qui suit n'est qu'un filet, pour le cas ou ce fichier serait
       plus ancien que celui-ci. */
    if (cadre.getAttribute('src')) return;
    var base = cadre.getAttribute('data-src');
    if (!base) return;
    cadre.setAttribute('src', base + reporterAttribution());
  }

  if (cadre) {
    var boutons = document.querySelectorAll('.js-open-brochure');
    for (var b = 0; b < boutons.length; b++) {
      boutons[b].addEventListener('pointerenter', chargerLeFormulaire, { once: true });
      boutons[b].addEventListener('focus', chargerLeFormulaire, { once: true });
      boutons[b].addEventListener('touchstart', chargerLeFormulaire, { once: true, passive: true });
    }
    /* Immediat : le cadre est deja en train de charger, on se contente de
       suivre son arrivee. */
    chargerLeFormulaire();
  }

  /* L'esquisse et le mot d'attente partent ENSEMBLE, au moment ou le
     formulaire annonce sa hauteur. Laisser l'esquisse derriere un cadre
     devenu opaque ne se verrait pas, mais elle continuerait a s'animer dans
     le vide, pour rien. */
  var esquisse = formContainer ? formContainer.querySelector('.modal__esquisse') : null;
  function retirerAttente() {
    if (attente && attente.parentNode) { attente.parentNode.removeChild(attente); attente = null; }
    if (esquisse && esquisse.parentNode) { esquisse.parentNode.removeChild(esquisse); esquisse = null; }
  }

  /* Repli : si le formulaire n'annonce jamais sa hauteur (réseau coupé,
     bloqueur de contenu, bien pas encore publié dans le CRM), on propose
     WhatsApp plutôt qu'une boîte vide. Réversible : si la hauteur finit
     par arriver, on rend la main à l'iframe. */
  var repli = null;
  /* Passe a true des que le formulaire a annonce sa hauteur. Le repli ne
     doit JAMAIS effacer un formulaire qui fonctionne : sans ce garde-fou,
     le minuteur remplacait le formulaire au bout de six secondes, en plein
     milieu de la saisie. */
  var pret = false;
  /* Passe a true des que le cadre est reellement sous les yeux du visiteur,
     avec ou sans message de hauteur. C'est CE drapeau qui protege le
     formulaire, et non `pret`.

     La panne vue en production tenait a cette confusion : le minuteur ne
     regardait que `pret`, c'est-a-dire l'arrivee du message de hauteur. Or ce
     message est publie par le JavaScript du formulaire, apres hydratation.
     S'il n'arrive pas — bloqueur de contenu, extension de confidentialite, un
     fragment JS qui ne passe pas chez CE visiteur-la — le formulaire reste
     parfaitement utilisable : il est rendu cote serveur, affiche, cliquable.
     Le minuteur l'effacait quand meme, huit secondes apres l'ouverture, pour
     mettre WhatsApp a sa place. C'est exactement la capture d'ecran recue. */
  var affiche = false;
  function replier() {
    if (pret || repli || !formContainer || !cadre) return;
    /* La page du cadre est arrivee, elle ne s'est simplement pas encore
       signalee. On ne lui prend PAS sa place : une ligne discrete en dessous,
       le temps que son JavaScript finisse d'arriver. Mesure a l'appui, sur un
       reseau 3G bride, ce signal met trente et une secondes — l'ancien delai
       de huit secondes effacait donc un formulaire qui marchait tres bien. */
    if (formCharge) { afficherSansHauteur(); poserLaLigne(); return; }

    /* La page du cadre n'est pas encore arrivee. Deux situations opposees se
       ressemblent ici : un service injoignable, et une page qui descend
       lentement. Les confondre a un cout : en 3G bridee, mesure, le gros bloc
       WhatsApp s'affichait a vingt secondes PUIS laissait la place au
       formulaire a trente-trois — le visiteur voyait donc exactement la
       capture d'ecran signalee, pour une page qui arrivait tres bien.

       Une requete simple tranche : elle ne depend d'aucun JavaScript tiers et
       echoue tout de suite quand le service est coupe. */
    sonderLeService(function (joignable) {
      if (pret || repli || !formContainer || !cadre) return;
      if (!joignable) { annoncerFormulaireIndisponible(); return; }
      /* Le service repond : la page descend, voila tout. On garde l'esquisse,
         qui dit honnetement « ca charge », et on ajoute la sortie de secours
         sans rien effacer. */
      poserLaLigne();
    });
  }

  /* Le mot d'attente : il s'ajoute, il ne remplace rien, et il disparait de
     lui-meme des que le formulaire se signale.

     Il portait « Un souci avec le formulaire ? Ecrivez-nous sur WhatsApp ».
     Retire le 23 octobre : cette ligne sort quand le formulaire est LENT, pas
     quand il est casse. Sur un reseau bride elle proposait donc une sortie a
     un visiteur dont le formulaire marchait tres bien — et le visiteur la
     prenait, sans jamais laisser ses coordonnees. C'est precisement la fuite
     d'opt-in qu'on supprime. On rassure, on ne detourne plus. */
  function poserLaLigne() {
    if (pret || repli || !formContainer) return;
    var ligne = document.createElement('p');
    ligne.style.cssText = 'font-size:13px;line-height:1.6;color:#8095A6;margin:14px 0 0;text-align:center';
    ligne.textContent = "Le formulaire met un instant a s'afficher. Merci de patienter.";
    formContainer.appendChild(ligne);
    repli = [ligne];
  }

  /* Le cadre est d'une autre origine : rien, depuis cette page, ne permet de
     voir ce qu'il contient — `contentDocument` vaut `null` aussi bien pour un
     formulaire parfaitement affiche que pour un cadre refuse, verifie. On pose
     donc la seule question a laquelle on peut repondre sans lui : la page du
     formulaire repond-elle ? La reponse est opaque, on ne lit que le fait
     qu'elle soit arrivee. */
  function sonderLeService(suite) {
    var adresse = cadre.getAttribute('src') || cadre.getAttribute('data-src');
    if (!adresse || typeof fetch !== 'function') { suite(true); return; }
    var encours = true;
    function repondre(joignable) {
      if (!encours) return;
      encours = false;
      clearTimeout(garde);
      suite(joignable);
    }
    /* Une sonde qui traine ne doit pas retenir la suite indefiniment : on
       penche alors du cote qui n'efface rien. */
    var garde = setTimeout(function () { repondre(true); }, 4000);
    try {
      fetch(adresse, { mode: 'no-cors', cache: 'no-store', credentials: 'omit' })
        .then(function () { repondre(true); })
        .catch(function () { repondre(false); });
    } catch (e) {
      repondre(true);
    }
  }

  /* Derniere echeance. Le formulaire s'envoie en JavaScript : sans son signal,
     il est affiche mais muet, et le visiteur le remplirait pour rien. Passe ce
     delai — tres au-dela des trente et une secondes mesurees sur reseau bride —
     on arrete de l'attendre et WhatsApp prend toute la place. Reversible
     jusqu'au bout : si le signal arrive ensuite, le formulaire reprend sa
     place. */
  function constaterLeSilence() {
    minuteurMort = null;
    if (pret || !cadre) return;
    deplier();
    annoncerFormulaireIndisponible();
  }

  /* Le service est injoignable. On le DIT, au lieu de proposer un numero.

     Ce bloc offrait « Ecrire sur WhatsApp » : c'etait la derniere porte du
     site vers un contact direct. Elle part avec les autres le 23 octobre. Le
     compromis est assume : pendant une panne du formulaire, un visiteur
     repartira sans avoir laisse ses coordonnees. Mais pendant une panne il
     n'y a de toute facon pas d'opt-in — et le reste du temps, cette porte
     captait des demandes que le formulaire devait recueillir.

     Nom change avec le contenu : une fonction qui s'appellerait encore
     `remplacerParWhatsapp` sans parler de WhatsApp est un mensonge qui
     survivrait a celui qui l'a ecrit. */
  function annoncerFormulaireIndisponible() {
    if (pret || repli || !formContainer || !cadre) return;
    retirerAttente();
    /* Hors du flux, mais toujours mesure : voir `.is-replie` dans styles.css. */
    cadre.classList.add('is-replie');
    affiche = false;
    var p = document.createElement('p');
    p.style.cssText = 'font-size:14.5px;line-height:1.7;color:#5E7386;margin:0 0 16px';
    p.textContent = "Le formulaire est momentanement indisponible. " +
                    'Reessayez dans quelques instants.';
    formContainer.appendChild(p);
    repli = [p];
  }
  /* Affiche le cadre sans attendre sa hauteur. Il garde sa hauteur minimale
     (520 px) ; la modale defile si le formulaire est plus grand. */
  function afficherSansHauteur() {
    if (!cadre || affiche) return;
    affiche = true;
    /* Retire un repli deja pose : le cadre revenu a la vie reprend sa place.
       Sans effet quand il n'y en a pas — c'est le cas normal. */
    deplier();
    retirerAttente();
    cadre.classList.add('is-ready');
  }

  function deplier() {
    if (!repli) return;
    for (var i = 0; i < repli.length; i++) {
      if (repli[i].parentNode) repli[i].parentNode.removeChild(repli[i]);
    }
    repli = null;
    cadre.classList.remove('is-replie');
  }

  if (cadre) {
    /* On n'écoute pas 'load' : une page d'erreur du service se charge elle
       aussi avec succès. Seul le message de hauteur prouve que le
       formulaire est bien là, d'où l'iframe masqué jusque-là. */
    cadre.addEventListener('error', replier);

    window.addEventListener('message', function (e) {
      /* Double vérification : la fenêtre émettrice doit être cet iframe,
         et son origine celle du service. */
      if (e.origin !== PRODIGIO_ORIGINE) return;
      if (e.source !== cadre.contentWindow) return;
      if (!e.data) return;

      /* Demande enregistree : le formulaire nous passe l'adresse du dossier,
         et c'est NOUS qui nous y rendons. L'ecran « Votre demande est
         enregistree » faisait cliquer pour rien — la page de remise porte
         deja la meme phrase.

         Garde-fou : on ne se deplace que vers une adresse de NOTRE propre
         origine. Meme si le CRM pointait un jour ailleurs, ce cadre ne peut
         pas emmener le visiteur sur un site tiers. */
      if (e.data.type === 'prodigio:buyer-form:brochure') {
        if (typeof e.data.url !== 'string' || !e.data.url) return;
        var destination;
        try {
          destination = new URL(e.data.url, window.location.href);
        } catch (err) {
          return;
        }
        if (destination.origin !== window.location.origin) return;
        unlockScroll();
        window.location.href = destination.href;
        return;
      }

      if (e.data.type !== 'prodigio:buyer-form:height') return;
      if (typeof e.data.height !== 'number' || e.data.height <= 0) return;
      pret = true;
      affiche = true;
      if (minuteurForm !== null) { clearTimeout(minuteurForm); minuteurForm = null; }
      if (minuteurMort !== null) { clearTimeout(minuteurMort); minuteurMort = null; }
      deplier();
      retirerAttente();
      cadre.classList.add('is-ready');
      cadre.style.height = e.data.height + 'px';
      cadre.style.minHeight = '0';
    });
  }

  /* Combien de temps on laisse au formulaire avant de proposer WhatsApp.
     Six secondes à plat ne suffisaient pas : la page du formulaire est
     rendue à la demande, et un démarrage à froid du service, sur un réseau
     mobile, dépasse ce délai sans que rien ne soit cassé — le visiteur
     voyait alors le repli s'afficher à la place d'un formulaire qui
     arrivait très bien.

     Trois échéances, et ce qu'elles déclenchent diffère :

     — quinze secondes pour que la page du formulaire ARRIVE. Passé ce délai
       sans rien, le cadre est vide : WhatsApp prend toute la place.
     — douze secondes, une fois la page arrivée, pour qu'elle SE SIGNALE. Le
       formulaire reste affiché ; on ajoute seulement une ligne discrète.
     — quarante-cinq secondes, et là seulement on considère qu'il ne se
       signalera jamais.

     Ces chiffres ne sont pas arbitraires. Le signal de hauteur part du
     JavaScript du formulaire, après hydratation. Mesuré sur la vraie page,
     avec bridage réseau et processeur : 3,5 s en 4G, et **31,1 s en 3G
     lente**. L'ancien délai de huit secondes effaçait donc un formulaire
     parfaitement sain sur toute connexion un peu lente — c'est la panne
     signalée, et elle n'avait rien d'aléatoire. */
  var DELAI_TOTAL = 15000;
  var DELAI_APRES_CHARGEMENT = 12000;
  var DELAI_SILENCE = 45000;

  var minuteurForm = null;
  var minuteurMort = null;
  function armer(delai) {
    if (minuteurForm !== null) clearTimeout(minuteurForm);
    minuteurForm = setTimeout(replier, delai);
    if (minuteurMort === null) minuteurMort = setTimeout(constaterLeSilence, DELAI_SILENCE);
  }
  function loadForm() {
    if (minuteurForm !== null || !cadre || pret) return;
    /* Le compte a rebours part d'ICI, a l'ouverture de la modale : c'est le
       moment ou le visiteur commence a attendre. Le faire partir du
       chargement de la page, depuis que le formulaire est demande d'avance,
       posait le repli AVANT meme qu'on ouvre la modale — c'est ce qui a ete
       observe en production.

       Si la page du formulaire est deja arrivee, il ne reste qu'a se
       signaler : le delai court suffit. Sinon on laisse le delai complet. */
    armer(formCharge ? DELAI_APRES_CHARGEMENT : DELAI_TOTAL);
    if (!formCharge) {
      cadre.addEventListener('load', function () {
        if (pret || minuteurForm === null) return;
        armer(DELAI_APRES_CHARGEMENT);
      }, { once: true });
    }
  }

  /* Verrouillage du scroll compatible iOS : on fige le body en position
     fixe et on mémorise la position pour la restaurer à la fermeture. */
  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollY + 'px';
    document.body.style.width = '100%';
  }
  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    chargerLeFormulaire();
    /* Le repli est pose : le service etait injoignable la derniere fois. Il
       est peut-etre revenu depuis — on relance le cadre plutot que de laisser
       le visiteur devant un repli definitif. Le repli reste affiche tant que
       le formulaire ne s'est pas signale. */
    if (repli && cadre && !formCharge) {
      var adresse = cadre.getAttribute('src') || cadre.getAttribute('data-src');
      if (adresse) { cadre.removeAttribute('src'); cadre.setAttribute('src', adresse); }
    }
    loadForm();
    /* La page du formulaire est deja arrivee : on arme le secours ici, sinon
       il n'aurait couru qu'au chargement, modale fermee. */
    if (formCharge && !pret) setTimeout(afficherSansHauteur, DELAI_AFFICHAGE_FORCE);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll();
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    unlockScroll();
    if (lastFocused) lastFocused.focus();
  }

  openBtns.forEach(function (btn) { btn.addEventListener('click', openModal); });
  closeEls.forEach(function (el) { el.addEventListener('click', closeModal); });

  /* =====================================================================
     GALERIE PLEIN ÉCRAN
     ===================================================================== */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbCap = document.getElementById('lightboxCap');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lbIndex = 0;
  var lbOpener = null;

  var slides = items.map(function (item) {
    var img = item.querySelector('img');
    var cap = item.querySelector('.gallery__cap');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      cap: cap ? cap.textContent.trim() : ''
    };
  });

  function showSlide(i) {
    if (!slides.length) return;
    lbIndex = (i + slides.length) % slides.length;
    var s = slides[lbIndex];
    lbImg.src = s.src;
    lbImg.alt = s.alt;
    lbCap.textContent = s.cap + '  ·  ' + (lbIndex + 1) + ' / ' + slides.length;
  }
  function openLb(i) {
    if (!lightbox) return;
    lbOpener = document.activeElement;
    showSlide(i);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lockScroll();
    var closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }
  function closeLb() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    unlockScroll();
    if (lbOpener) lbOpener.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { openLb(i); });
  });
  document.querySelectorAll('.js-close-lb').forEach(function (el) {
    el.addEventListener('click', closeLb);
  });
  if (lbPrev) lbPrev.addEventListener('click', function () { showSlide(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { showSlide(lbIndex + 1); });

  /* Balayage tactile */
  var touchX = null;
  if (lightbox) {
    lightbox.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 55) showSlide(lbIndex + (delta < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Clavier ---------- */
  document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showSlide(lbIndex - 1);
      else if (e.key === 'ArrowRight') showSlide(lbIndex + 1);
      return;
    }
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });
})();

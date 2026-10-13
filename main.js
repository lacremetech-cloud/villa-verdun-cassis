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

  /* ---------- CTA flottante : visible une fois le hero passé ----------
     On attend la sortie du hero pour ne pas recouvrir le formulaire
     qui s'y trouve déjà sur mobile. */
  var stickyCta = document.getElementById('stickyCta');
  var hero = document.getElementById('hero');
  if (stickyCta && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' }).observe(hero);
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

  /* ---------- Visite vidéo dans le flux (écrans étroits) ----------
     iOS refuse parfois la lecture automatique au premier chargement : on la
     relance au premier contact. Hors écran, on met en pause, par égard pour
     la batterie. Les deux commandes sont les nôtres, celles du système
     restant neutralisées par pointer-events: none. */
  var visite = document.querySelector('.hero__shot video');
  if (visite) {
    var lancer = function () { var p = visite.play(); if (p && p.catch) p.catch(function () {}); };
    lancer();
    document.addEventListener('touchstart', lancer, { once: true, passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (entrees[i].isIntersecting) lancer();
          else visite.pause();
        }
      }, { threshold: 0.25 }).observe(visite);
    }

    var bSon = document.querySelector('.js-son');
    if (bSon) {
      bSon.addEventListener('click', function () {
        visite.muted = !visite.muted;
        bSon.classList.toggle('is-audible', !visite.muted);
        bSon.setAttribute('aria-label', visite.muted ? 'Activer le son' : 'Couper le son');
        if (!visite.muted) lancer();
      });
    }

    var bPlein = document.querySelector('.js-plein-ecran');
    if (bPlein) {
      bPlein.addEventListener('click', function () {
        /* Safari iOS n'implémente le plein écran que sur l'élément vidéo. */
        if (typeof visite.webkitEnterFullscreen === 'function') visite.webkitEnterFullscreen();
        else if (typeof visite.requestFullscreen === 'function') visite.requestFullscreen().catch(function () {});
        else if (typeof visite.webkitRequestFullscreen === 'function') visite.webkitRequestFullscreen();
      });
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
     dessous, et la hauteur affinera l'affichage si elle arrive ensuite. */
  var DELAI_AFFICHAGE_FORCE = 2500;
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
  function replier() {
    if (pret || repli || !formContainer || !cadre) return;
    retirerAttente();
    /* Hors du flux, mais toujours mesure : voir `.is-replie` dans styles.css. */
    cadre.classList.add('is-replie');
    var p = document.createElement('p');
    p.style.cssText = 'font-size:14.5px;line-height:1.7;color:#5E7386;margin:0 0 16px';
    p.textContent = "Le formulaire ne s'affiche pas ? Écrivez-nous directement, " +
                    'nous vous transmettons le dossier sous 24 heures ouvrées.';
    var a = document.createElement('a');
    a.className = 'btn btn--primary btn--block';
    a.href = 'https://wa.me/33668680407';
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = 'Écrire sur WhatsApp';
    formContainer.appendChild(p);
    formContainer.appendChild(a);
    repli = [p, a];
  }
  /* Affiche le cadre sans attendre sa hauteur. Il garde sa hauteur minimale
     (520 px) ; la modale defile si le formulaire est plus grand. */
  function afficherSansHauteur() {
    if (!cadre || pret) return;
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
      if (minuteurForm !== null) { clearTimeout(minuteurForm); minuteurForm = null; }
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

     Deux échéances donc, plutôt qu'une : quinze secondes au total pour que
     la page arrive ET se signale ; et, une fois la page arrivée, cinq
     secondes pour qu'elle annonce sa hauteur — passé ce délai, c'est
     qu'elle a répondu autre chose que le formulaire (page d'erreur, bien
     inconnu), et là le repli est la bonne réponse. */
  var DELAI_TOTAL = 15000;
  var DELAI_APRES_CHARGEMENT = 8000;

  var minuteurForm = null;
  function armer(delai) {
    if (minuteurForm !== null) clearTimeout(minuteurForm);
    minuteurForm = setTimeout(replier, delai);
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
    if (repli && cadre) {
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

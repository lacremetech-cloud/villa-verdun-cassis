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

     1. HERO_VIDEO_MP4 — un fichier servi depuis le dépôt. C'est la
        meilleure option : pas de tiers, pas de logo, contrôle total du
        cadrage et de la boucle. À privilégier dès que des images
        propres au bien seront disponibles.

     2. HERO_VIDEO_ID — une vidéo YouTube intégrée via l'API officielle,
        en domaine sans cookie. Nécessite l'accord de son auteur pour un
        usage commercial.

     Dans les deux cas la photo reste dessous : elle s'affiche tout de
     suite et prend le relais si la vidéo ne démarre pas.
     ===================================================================== */
  var HERO_VIDEO_MP4   = '';                /* ex. 'assets/video/hero.mp4' */
  var HERO_VIDEO_ID    = 'UE3kntZkW8o';     /* Cassis vue du ciel — Polychronis Film */
  var HERO_VIDEO_START = 40;                /* secondes */

  var heroVideo = document.getElementById('heroVideo');

  function prefersStillImage() {
    /* Animations désactivées, écran étroit, ou forfait en données réduites :
       on garde la photo, qui est plus légère et tout aussi juste. */
    if (!heroVideo) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    if (window.matchMedia('(max-width: 760px)').matches) return true;
    var c = navigator.connection;
    if (c && (c.saveData || /^(slow-)?2g$/.test(c.effectiveType || ''))) return true;
    return false;
  }

  function mountMp4() {
    var v = document.createElement('video');
    v.src = HERO_VIDEO_MP4;
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
    if (HERO_VIDEO_MP4) mountMp4();
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

  /* ---------- Chiffres qui s'incrémentent ----------
     Les nombres de la carte d'identité montent depuis zéro à leur première
     apparition. Rien ne bouge si l'utilisateur a réduit les animations : la
     valeur finale est déjà dans le HTML, elle reste simplement affichée. */
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
  /* ---------- Formulaire Prodigio ----------
     L'iframe est écrit directement dans la modale, en loading="lazy" : il
     n'est chargé qu'à la première ouverture. Il annonce sa hauteur par
     postMessage, que l'on applique ici pour qu'il n'ait ni barre de
     défilement interne ni blanc en dessous. */
  var PRODIGIO_ORIGINE = 'https://go.prodigio.fr';
  var cadre = document.getElementById('prodigio-form');
  var attente = formContainer ? formContainer.querySelector('.modal__spinner') : null;

  function retirerAttente() {
    if (attente && attente.parentNode) { attente.parentNode.removeChild(attente); attente = null; }
  }

  /* Si le formulaire ne s'affiche pas (réseau coupé, bloqueur, service
     indisponible), on propose WhatsApp plutôt qu'une boîte vide. */
  var replides = false;
  function replier() {
    if (replides || !formContainer) return;
    replides = true;
    retirerAttente();
    if (cadre) cadre.style.display = 'none';
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
  }

  if (cadre) {
    cadre.addEventListener('load', retirerAttente);
    cadre.addEventListener('error', replier);

    window.addEventListener('message', function (e) {
      /* Double vérification : la fenêtre émettrice doit être cet iframe,
         et son origine celle du service. */
      if (e.origin !== PRODIGIO_ORIGINE) return;
      if (e.source !== cadre.contentWindow) return;
      if (!e.data || e.data.type !== 'prodigio:buyer-form:height') return;
      if (typeof e.data.height !== 'number' || e.data.height <= 0) return;
      retirerAttente();
      cadre.style.height = e.data.height + 'px';
      cadre.style.minHeight = '0';
    });
  }

  /* Au premier clic, on laisse dix secondes au formulaire pour apparaître. */
  var minuteurForm = null;
  function surveillerForm() {
    if (minuteurForm !== null || !cadre) return;
    minuteurForm = setTimeout(function () {
      if (!cadre.style.height) replier();
    }, 10000);
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
    surveillerForm();
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

// Bandeau de consentement cookies (RGPD), relié au Google Consent Mode v2.
// Le signal de consentement par défaut (refusé) est défini très tôt dans le <head>
// de chaque page, avant même le chargement de Google Analytics — voir le tag
// gtag('consent', 'default', ...) dans le <head>. Ce fichier ne fait que mettre
// à jour ce signal (gtag('consent', 'update', ...)) selon le choix du visiteur.
(function () {
  var STORAGE_KEY = 'gl_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function updateAnalyticsConsent(granted) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Gestion des cookies');
    el.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p>Nous utilisons des cookies pour assurer le bon fonctionnement du site et mesurer son audience. ' +
        'Vous pouvez accepter ou refuser leur utilisation. <a href="/mentions-legales/#cookies">En savoir plus</a></p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-cookie-action="reject">Refuser</button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-cookie-action="accept">Accepter</button>' +
        '</div>' +
      '</div>';
    return el;
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    var banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });

    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie-action]');
      if (!btn) return;
      var accepted = btn.getAttribute('data-cookie-action') === 'accept';
      setConsent(accepted ? 'accepted' : 'rejected');
      updateAnalyticsConsent(accepted);
      hideBanner(banner);
    });
  }

  function hideBanner(banner) {
    banner.classList.remove('is-visible');
    setTimeout(function () { banner.remove(); }, 250);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!getConsent()) showBanner();

    Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var existing = document.querySelector('.cookie-banner');
        if (existing) existing.remove();
        showBanner();
      });
    });
  });
})();

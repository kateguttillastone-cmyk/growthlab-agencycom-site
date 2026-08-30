// Navigation mobile, sélecteur d'offres, lien actif
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  // Sélecteur de packs : PME & TPE / E-commerçants
  var switchBtns = document.querySelectorAll('.switch-btn[data-offres]');
  function selectOffres(key) {
    Array.prototype.forEach.call(switchBtns, function (b) {
      var on = b.getAttribute('data-offres') === key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-offres-panel]'), function (panel) {
      panel.hidden = panel.getAttribute('data-offres-panel') !== key;
    });
  }
  if (switchBtns.length) {
    Array.prototype.forEach.call(switchBtns, function (btn) {
      btn.addEventListener('click', function () { selectOffres(btn.getAttribute('data-offres')); });
    });
    // Liens internes qui basculent le sélecteur sans être des onglets
    Array.prototype.forEach.call(document.querySelectorAll('[data-offres-goto]'), function (link) {
      link.addEventListener('click', function () { selectOffres(link.getAttribute('data-offres-goto')); });
    });
  }
  // Sélecteur de canal du Pack Starter : Google Ads / Meta Ads
  var canalBtns = document.querySelectorAll('.switch-btn[data-canal]');
  Array.prototype.forEach.call(canalBtns, function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-canal');
      Array.prototype.forEach.call(canalBtns, function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-canal-panel]'), function (panel) {
        panel.hidden = panel.getAttribute('data-canal-panel') !== key;
      });
    });
  });
});

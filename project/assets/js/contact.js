/* Le formulaire envoie les données à une fonction Netlify (/.netlify/functions/contact)
   qui relaie ensuite vers le webhook n8n en y ajoutant le secret côté serveur.
   Voir netlify/functions/contact.js — la config (URL + secret) vit uniquement
   dans les variables d'environnement Netlify, jamais dans ce fichier. */
var FORM_ENDPOINT = '/.netlify/functions/contact';
var FORM_TIMEOUT_MS = 12000;

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('audit-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  function show(type, text) {
    msg.className = 'form-msg is-' + type;
    msg.textContent = text;
  }

  function invalid(field, text) {
    show('error', text);
    if (field && field.focus) field.focus();
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validation côté client (le formulaire est en novalidate pour garder
    // tous les messages dans #form-msg plutôt que dans les bulles natives).
    var entreprise = form.entreprise.value.trim();
    var site = form.site.value.trim();
    var email = form.email.value.trim();
    var telephone = form.telephone ? form.telephone.value.trim() : '';
    var objet = form.objet ? form.objet.value.trim() : '';
    var message = form.message ? form.message.value.trim() : '';
    if (!entreprise) return invalid(form.entreprise, "Merci d'indiquer le nom de votre entreprise.");
    if (!site) return invalid(form.site, "Merci d'indiquer l'adresse de votre site web.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return invalid(form.email, 'Merci de saisir une adresse email valide.');
    if (telephone && !/^[0-9+\s().-]{6,20}$/.test(telephone)) return invalid(form.telephone, 'Merci de saisir un numéro de téléphone valide.');
    if (form.objet && !objet) return invalid(form.objet, "Merci d'indiquer l'objet de votre demande.");
    if (form.message && !message) return invalid(form.message, 'Merci de décrire votre demande en quelques mots.');
    if (form.consent && !form.consent.checked) return invalid(form.consent, "Merci de cocher la case pour accepter d'être contacté·e.");

    var payload = {
      entreprise: entreprise,
      site: site,
      email: email,
      telephone: telephone,
      objet: objet,
      message: message,
      page: window.location.href
    };

    if (submit) { submit.disabled = true; submit.textContent = 'Envoi en cours…'; }
    msg.className = 'form-msg';

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, FORM_TIMEOUT_MS);

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        show('ok', 'Merci, votre demande est bien reçue. Vous recevez les résultats de votre audit par email sous 48h.');
        form.reset();
      })
      .catch(function (err) {
        var timeout = (err && err.name === 'AbortError');
        console.error('[GrowthLab] Envoi du formulaire échoué :', err);
        if (timeout) {
          show('error', "L'envoi a pris trop de temps. Réessayez dans un instant ou écrivez-nous à contact@growthlab-agencycom.com.");
        } else {
          show('error', "Une erreur est survenue lors de l'envoi. Écrivez-nous à contact@growthlab-agencycom.com, nous traitons votre demande à la main.");
        }
      })
      .then(function () {
        clearTimeout(timer);
        if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
      });
  });
});

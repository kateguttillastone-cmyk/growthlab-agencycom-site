// Relais serveur vers le webhook n8n : garde N8N_WEBHOOK_URL et
// N8N_WEBHOOK_SECRET côté serveur (configurés dans Netlify → Site
// configuration → Environment variables), jamais exposés au navigateur.
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var webhookUrl = process.env.N8N_WEBHOOK_URL;
  var webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.error('[contact] N8N_WEBHOOK_URL ou N8N_WEBHOOK_SECRET manquant côté serveur.');
    return { statusCode: 500, body: JSON.stringify({ error: 'server_misconfigured' }) };
  }

  var data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  var entreprise = String(data.entreprise || '').trim();
  var site = String(data.site || '').trim();
  var email = String(data.email || '').trim();
  var telephone = String(data.telephone || '').trim();
  var objet = String(data.objet || '').trim();
  var message = String(data.message || '').trim();

  if (!entreprise || !site || !email || !objet || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing_fields' }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_email' }) };
  }
  if (telephone && !/^[0-9+\s().-]{6,20}$/.test(telephone)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_phone' }) };
  }

  try {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 10000);

    var res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret
      },
      body: JSON.stringify({
        entreprise: entreprise,
        site: site,
        email: email,
        telephone: telephone,
        objet: objet,
        message: message,
        source: 'formulaire audit gratuit',
        page: data.page || '',
        date: new Date().toISOString()
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error('[contact] n8n a répondu HTTP ' + res.status);
      return { statusCode: 502, body: JSON.stringify({ error: 'upstream_error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('[contact] échec de l\'appel au webhook n8n :', err);
    return { statusCode: 504, body: JSON.stringify({ error: 'upstream_timeout' }) };
  }
};

export async function sendWhatsApp(phone, body) {
  const { TWILIO_SID: sid, TWILIO_TOKEN: token, TWILIO_WHATSAPP_FROM: from } = process.env;
  const to = `whatsapp:+57${phone.replace(/\D/g, "").slice(-10)}`;
  if (!sid || !token) return console.log(`[WhatsApp demo] → ${to}\n${body}`);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64") },
    body: new URLSearchParams({ From: from, To: to, Body: body }),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}`);
}

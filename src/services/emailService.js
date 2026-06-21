const API_URL = 'https://api.sendpulse.com';

const sendReportResponseEmail = async ({ to, userName, response }) => {
  const apiKey = process.env.SENDPULSE_API_SECRET;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color:#023E73;padding:30px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;">EcoRutas</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 30px;">
                  <h2 style="color:#1a1a1a;margin:0 0 10px;font-size:20px;">Hola, ${userName}</h2>
                  <p style="color:#555;margin:0 0 20px;font-size:15px;line-height:1.6;">
                    Tu reporte ha sido revisado por nuestro equipo. A continuacion encontraras la respuesta:
                  </p>
                  <div style="background-color:#f0f7fc;border-left:4px solid #023E73;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                    <p style="color:#333;margin:0;font-size:14px;line-height:1.6;">${response}</p>
                  </div>
                  <p style="color:#999;margin:0;font-size:13px;text-align:center;">
                    Este es un correo automatico, por favor no responder.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f0f7fc;padding:20px 30px;text-align:center;">
                  <p style="color:#999;margin:0;font-size:12px;">EcoRutas - Sistema de Gestion de Recoleccion de Residuos</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const emailBody = {
    email: {
      html: Buffer.from(html).toString('base64'),
      text: `Hola ${userName}, tu reporte ha sido revisado. Respuesta: ${response}`,
      subject: 'Respuesta a tu reporte - EcoRutas',
      from: {
        name: process.env.EMAIL_FROM_NAME,
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          name: userName,
          email: to,
        },
      ],
    },
  };

  const res = await fetch(`${API_URL}/smtp/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(emailBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendPulse send failed (${res.status}): ${text}`);
  }

  return res.json();
};

module.exports = { sendReportResponseEmail };

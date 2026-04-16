import { Resend } from "resend";

/**
 * Cliente Resend — envio de emails transacionais.
 *
 * Emails implementados:
 *  - sendOtpEmail: envia código OTP de verificação (6 dígitos)
 *
 * TODO (time de tech):
 *  - Criar templates React Email para visual bonito
 *  - Adicionar DKIM / SPF no domínio ladob.com.br antes de produção
 */

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurado");
  }
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM_EMAIL || "LADO ₿ <noreply@ladob.com.br>";

/**
 * Envia código OTP para verificação de email.
 */
export async function sendOtpEmail(email: string, code: string) {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM,
    to: [email],
    subject: `Seu código LADO ₿: ${code}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0;padding:40px 20px;background:#000;color:#fff;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:500px;margin:0 auto;background:#0a0a0a;border:1px solid rgba(255,198,10,0.2);border-radius:16px;padding:32px;">
            <h1 style="margin:0 0 8px;color:#ffc60a;font-size:24px;">LADO ₿</h1>
            <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:13px;">by Vault Capital</p>

            <h2 style="margin:0 0 12px;color:#fff;font-size:20px;">Seu código de verificação</h2>
            <p style="margin:0 0 24px;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Use o código abaixo para liberar seu link de indicação exclusivo.
            </p>

            <div style="background:rgba(255,198,10,0.1);border:1px solid rgba(255,198,10,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
              <div style="font-family:ui-monospace,monospace;font-size:32px;letter-spacing:8px;color:#ffc60a;font-weight:bold;">
                ${code}
              </div>
            </div>

            <p style="margin:0;color:rgba(255,255,255,0.4);font-size:12px;">
              O código expira em 10 minutos. Se você não solicitou, pode ignorar este email.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Erro ao enviar OTP via Resend:", error);
    throw error;
  }
}

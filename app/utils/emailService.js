import nodemailer from "nodemailer";

/**
 * Generate welcome email HTML template
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email address
 * @returns {string} HTML email template
 */
export function getWelcomeEmailTemplate(firstName, lastName, email) {
  return `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur l'espace publication de SINESE</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f7f8fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f8fc;">
      <tr>
        <td style="padding: 40px 20px;">
          <!-- Main Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 10px 0; font-size: 28px; font-weight: 700;">
                  Bienvenue sur l'espace publication de SINESE !
                </h1>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1e3a8a; margin-top: 0; font-size: 22px; font-weight: 600;">
                  Bonjour ${firstName} ${lastName},
                </h2>

                <p style="color: #374151; line-height: 1.6; font-size: 16px; margin: 20px 0;">
                  Votre compte a été créé avec succès.
                </p>

                <p style="color: #374151; line-height: 1.6; font-size: 16px; margin: 20px 0;">
Accédez à votre espace pour publier l'Empreinte Sociétale de votre entreprise 
ou de vos clients et partager vos données transparentes.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="text-align: center; padding: 25px 0;">
                      <a href="https://sinese.fr/publications/espace/publier"
                         style="display: inline-block; background-color: #e74c5a; color: white;
                                padding: 16px 40px; text-decoration: none; border-radius: 6px;
                                font-weight: 600; font-size: 16px; text-align: center;">
                        Publier mon Empreinte Sociétale
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- About SINESE -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 25px;">
                  <tr>
                    <td>
                      <p style="color: #374151; line-height: 1.6; font-size: 14px; margin: 0;">
                        <strong style="color: #1e3a8a;">À propos de SINESE :</strong><br>
                        Le Système d'Information National sur l'Empreinte Sociétale des Entreprises, développé par La Société Nouvelle pour rendre transparents les impacts sociaux et environnementaux des entreprises françaises.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f7f8fc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 15px; line-height: 1.5;">
                  <strong style="color: #1e3a8a;">La Société Nouvelle</strong><br>
                  165 avenue de Bretagne, 59000 LILLE
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
                  Questions ?
                  <a href="mailto:contact@lasocietenouvelle.org"
                     style="color: #6c7fdd; text-decoration: none; font-weight: 500;">
                    contact@lasocietenouvelle.org
                  </a>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
                  <a href="https://sinese.fr"
                     style="color: #6c7fdd; text-decoration: none; font-weight: 500;">
                    sinese.fr
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Send welcome email to newly registered user
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.firstName - User's first name
 * @param {string} params.lastName - User's last name
 * @returns {Promise<void>}
 */
export async function sendWelcomeEmail({ to, firstName, lastName }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
      : undefined,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || "SINESE <no-reply@lasocietenouvelle.org>",
    to,
    subject: "Votre espace de publication SINESE est prêt !",
    html: getWelcomeEmailTemplate(firstName, lastName, to),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${to}:`, error);
    throw error;
  }
}

/**
 * Generic email sending function (for future use)
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email HTML content
 * @param {string} [params.from] - Sender email (optional, uses default from env)
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, html, from }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
      : undefined,
  });

  const mailOptions = {
    from: from || process.env.SMTP_FROM || "SINESE <no-reply@lasocietenouvelle.org>",
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

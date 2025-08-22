import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // Configure le transporteur email
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      } : undefined,
    });

    const contactEmail = process.env.CONTACT_EMAIL || 'contact@lasocietenouvelle.org';

    // Email vers l'équipe
    const mailToTeam = {
      from: process.env.SMTP_FROM || `"${name}" <${email}>`,
      to: contactEmail,
      replyTo: email,
      subject: `[Contact SINESE] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b4d8f 0%, #6c7fdd 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nouveau message de contact</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fc; border-left: 4px solid #3b4d8f;">
            <h2 style="color: #3b4d8f; margin-top: 0;">Informations du contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;"><strong>Nom :</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;"><strong>Email :</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;"><strong>Sujet :</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecf3;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h3 style="color: #3b4d8f;">Message :</h3>
            <div style="background-color: #f8f9fc; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c5a;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6c757d; border-top: 1px solid #e9ecf3;">
            <small>Envoyé depuis le portail SINESE - ${new Date().toLocaleString('fr-FR')}</small>
          </div>
        </div>
      `
    };

    // Email de confirmation à l'utilisateur
    const confirmationMail = {
      from: process.env.SMTP_FROM || contactEmail,
      to: email,
      subject: 'Confirmation de réception - Contact SINESE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b4d8f 0%, #6c7fdd 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Message bien reçu !</h1>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <p style="font-size: 16px;">Bonjour <strong>${name}</strong>,</p>
            
            <p>Nous accusons bonne réception de votre message concernant "<strong>${subject}</strong>".</p>
            
            <div style="background-color: #f8f9fc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b4d8f; margin: 20px 0;">
              <h4 style="color: #3b4d8f; margin-top: 0;">Votre message :</h4>
              <p style="font-style: italic;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.</p>
            
            <p>Merci de nous avoir contactés !</p>
            
            <p style="margin-top: 30px;">
              Cordialement,<br>
              <strong>L'équipe de La Société Nouvelle</strong>
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #f8f9fc; border-top: 1px solid #e9ecf3;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              <strong>La Société Nouvelle</strong><br>
              165 avenue de Bretagne, 59000 LILLE<br>
              <a href="https://lasocietenouvelle.org" style="color: #3b4d8f;">lasocietenouvelle.org</a>
            </p>
          </div>
        </div>
      `
    };

    // Envoi des emails
    await transporter.sendMail(mailToTeam);
    await transporter.sendMail(confirmationMail);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Votre message a été envoyé avec succès. Un email de confirmation vous a été envoyé.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail de contact:', error);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
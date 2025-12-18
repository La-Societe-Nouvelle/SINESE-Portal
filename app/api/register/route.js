import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/config/db";
import { sendWelcomeEmail } from "@/utils/emailService";

export async function POST(request) {
  const { email, password, firstName, lastName, profile } = await request.json();

  // Vérifier si l'utilisateur existe déjà
  const existing = await pool.query("SELECT id FROM publications.users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Un compte existe déjà avec cette adresse email. Veuillez en utiliser une autre ou vous connecter." }, { status: 400 });
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insérer l'utilisateur
  await pool.query(
    "INSERT INTO publications.users (email, password, first_name, last_name, profile) VALUES ($1, $2, $3, $4, $5)",
    [email, hashedPassword, firstName, lastName, profile]
  );

  // Envoyer l'email de bienvenue
  try {
    await sendWelcomeEmail({
      to: email,
      firstName,
      lastName,
    });
  } catch (emailError) {
    console.error("Error sending welcome email:", emailError);
    // L'utilisateur est créé même si l'email échoue
  }

  return NextResponse.json({ success: true });
}

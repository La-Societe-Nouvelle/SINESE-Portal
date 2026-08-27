"use server";

import bcrypt from "bcrypt";
import pool from "@/config/db";
import { sendWelcomeEmail } from "@/utils/emailService";

export async function registerUser({ email, password, firstName, lastName, profile }) {
  const existing = await pool.query("SELECT id FROM publications.users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    return { error: "Un compte existe déjà avec cette adresse email. Veuillez en utiliser une autre ou vous connecter." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO publications.users (email, password, first_name, last_name, profile) VALUES ($1, $2, $3, $4, $5)",
    [email, hashedPassword, firstName, lastName, profile]
  );

  try {
    await sendWelcomeEmail({ to: email, firstName, lastName });
  } catch (emailError) {
    console.error("Error sending welcome email:", emailError);
  }

  return { success: true };
}

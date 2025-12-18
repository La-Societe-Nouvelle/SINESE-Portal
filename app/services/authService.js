export async function register({ email, password, profile, firstName, lastName }) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, profile, firstName, lastName }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de l'inscription.");
  }

  return await res.json();
}

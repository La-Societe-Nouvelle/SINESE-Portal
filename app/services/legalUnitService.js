export async function deleteLegalUnit(id) {
  const res = await fetch(`/api/legal-units/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la suppression.");
  }

  return await res.json();
}

export async function fetchLegalUnits() {
  const res = await fetch("/api/legal-units", {
    method: "GET",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de la récupération des entreprises.");
  }

  return await res.json();
}

export async function addLegalUnit({ siren, denomination }) {
  const res = await fetch("/api/legal-units", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siren, denomination }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Erreur lors de l'ajout de l'entreprise.");
  }

  return await res.json();
}

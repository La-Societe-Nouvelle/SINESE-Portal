export async function addPublication({ legalUnit, declarationData, documents = [], year, status, periodStart, periodEnd }) {
  const formData = new FormData();
  formData.append("legalUnit", JSON.stringify(legalUnit));
  formData.append("declarationData", JSON.stringify(declarationData));
  formData.append("documents", JSON.stringify(documents));
  formData.append("year", year);
  formData.append("status", status);
  formData.append("periodStart", periodStart);
  formData.append("periodEnd", periodEnd);

  const response = await fetch("/api/publications", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erreur lors de l'envoi de la publication");
  }

  return await response.json();
}
export async function updatePublicationStatus(id, status) {
  const res = await fetch(`/api/publications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour du statut");
  }
  return res.json();
}

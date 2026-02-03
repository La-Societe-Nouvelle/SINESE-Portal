export async function addPublication({ legalUnit, declarationData, documents = [], year, status, periodStart, periodEnd }) {
  const formData = new FormData();
  formData.append("legalUnit", JSON.stringify(legalUnit));
  formData.append("declarationData", JSON.stringify(declarationData));
  formData.append("documents", JSON.stringify(documents));
  formData.append("year", year);
  formData.append("status", status);
  // Ne pas envoyer si null/undefined (FormData convertit null en "null")
  if (periodStart) formData.append("periodStart", periodStart);
  if (periodEnd) formData.append("periodEnd", periodEnd);

  const response = await fetch("/api/publications", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    const error = new Error(data.error || "Erreur lors de l'envoi de la publication");
    error.isApiError = true;
    throw error;
  }

  return await response.json();
}
export async function addReport({ reportId, publicationId, type, fileUrl, fileName, fileSize, mimeType, storageType }) {
  const formData = new FormData();
  if (reportId) formData.append("reportId", reportId);
  formData.append("publicationId", publicationId);
  formData.append("type", type);
  formData.append("fileUrl", fileUrl);
  if (fileName) formData.append("fileName", fileName);
  if (fileSize) formData.append("fileSize", fileSize);
  if (mimeType) formData.append("mimeType", mimeType);
  formData.append("storageType", storageType || "ovh");

  const response = await fetch("/api/reports", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Erreur lors de la soumission du rapport");
    error.isApiError = true;
    throw error;
  }

  return data;
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

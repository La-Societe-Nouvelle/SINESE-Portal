import indicators from "./../_lib/indicators.json";

// Validations - Helper function for robust number validation
function isValidNumber(value) {
  // Rejette les valeurs vides, nulles, undefined
  if (value === "" || value === null || value === undefined) return false;
  // Convertit en nombre et vérifie que c'est un nombre valide
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

export function isIndicatorComplete(indicator, data) {
  const indicatorData = data[indicator.name];
  if (!indicatorData) return false;

  // Pour les indicateurs supplémentaires, on ne valide que value
  if (indicator.category === "Indicateurs supplémentaires") {
    return isValidNumber(indicatorData.value);
  }

  // Pour les autres, on valide value ET uncertainty
  return isValidNumber(indicatorData.value) && isValidNumber(indicatorData.uncertainty);
}

export function isIndicatorInvalid(indicator, data) {
  const ind = data[indicator.name];

  // Si l'indicateur n'existe pas ou est complètement vide, pas d'erreur (utilisateur n'a pas commencé)
  if (!ind || (ind.value === "" && (ind.uncertainty === undefined || ind.uncertainty === ""))) {
    return false;
  }

  // Si l'utilisateur a commencé à remplir, on valide
  // Pour les indicateurs supplémentaires, on ne valide que value
  if (indicator.category === "Indicateurs supplémentaires") {
    return !isValidNumber(ind.value);
  }

  // Pour les autres, on valide value ET uncertainty
  return !isValidNumber(ind.value) || !isValidNumber(ind.uncertainty);
}

export function validatePeriod(periodStart, periodEnd) {
  if (!periodStart && !periodEnd) return "Veuillez renseigner les dates de début et de fin de l'exercice (ex: 01/01/2024 au 31/12/2024).";
  if (!periodStart) return "Veuillez renseigner la date de début de l'exercice.";
  if (!periodEnd) return "Veuillez renseigner la date de fin de l'exercice.";

  if (periodStart > periodEnd) {
    return "La date de fin de période doit être postérieure à la date de début. Vérifiez l'ordre des dates.";
  }

  const endYear = new Date(periodEnd).getFullYear();
  const currentYear = new Date().getFullYear();
  if (endYear > currentYear) {
    return `L'année de fin (${endYear}) ne peut pas être dans le futur. Veuillez sélectionner une année antérieure ou égale à ${currentYear}.`;
  }

  return null;
}

export function validateEmpreinte(declarationData) {
  const eseIndicators = Object.entries(indicators)
    .filter(([_, meta]) =>
      ["Création de la valeur", "Empreinte sociale", "Empreinte environnementale"].includes(meta.category)
    )
    .map(([key]) => key);

  // Trouver les indicateurs commencés
  const started = eseIndicators.filter((key) => {
    const indicator = declarationData[key];
    return indicator && indicator.value !== undefined && indicator.value !== "";
  });

  if (started.length === 0) {
    return "Veuillez déclarer au moins un indicateur.";
  }

  // Vérifier que chaque indicateur commencé est bien complété et valide
  const invalidIndicators = [];
  started.forEach((key) => {
    const indicator = declarationData[key];
    if (!indicator || !isValidNumber(indicator.value) || !isValidNumber(indicator.uncertainty)) {
      const meta = indicators[key];
      invalidIndicators.push(meta.libelle);
    }
  });

  if (invalidIndicators.length > 0) {
    return `Les indicateurs suivants sont incomplets ou invalides : ${invalidIndicators.join(", ")}. Chaque indicateur commencé doit avoir une valeur numérique et une incertitude (en %) valides.`;
  }

  return null;
}

export function validateExtraIndic(declarationData) {
  const extraKeys = Object.entries(indicators)
    .filter(([_, meta]) => meta.category === "Indicateurs supplémentaires")
    .map(([key]) => key);

  const started = extraKeys.filter((key) => {
    const indicator = declarationData[key];
    return indicator && indicator.value !== undefined && indicator.value !== "";
  });

  if (started.length === 0) return null;

  // Vérifier que chaque indicateur commencé est valide
  const invalidIndicators = [];
  started.forEach((key) => {
    const indicator = declarationData[key];
    if (!indicator || !isValidNumber(indicator.value)) {
      const meta = indicators[key];
      invalidIndicators.push(meta.libelle);
    }
  });

  if (invalidIndicators.length > 0) {
    return `Les indicateurs supplémentaires suivants sont incomplets : ${invalidIndicators.join(", ")}. Veuillez saisir une valeur numérique valide (ex: 12.5).`;
  }

  return null;
}

//

export function getStatusVariant(status) {
  switch (status) {
    case "published":
      return "success"; // vert
    case "pending":
      return "info"; // bleu clair
    case "draft":
      return "light"; // gris
    case "rejected":
      return "danger"; // rouge
    case "unpublish_requested":
      return "warning"; // orange
    case "unpublished":
      return "dark"; // gris foncé
    default:
      return "light";
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case "published":
      return "Publiée";
    case "pending":
      return "En cours de traitement";
    case "draft":
      return "Brouillon";
    case "rejected":
      return "Rejetée";
    case "unpublish_requested":
      return "Demande de retrait";
    case "unpublished":
      return "Retirée";
    default:
      return status;
  }
}


export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
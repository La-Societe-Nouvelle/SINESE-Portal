// Libellés affichés en remplacement des codes bruts de la base pour certaines
// valeurs par défaut, dont le label DB n'est pas assez explicite côté utilisateur.
const LABEL_OVERRIDES = {
  TOTAL: "Toutes les activités",
};

export function getDisplayLabel(code, fallbackLabel) {
  return LABEL_OVERRIDES[code] || fallbackLabel;
}

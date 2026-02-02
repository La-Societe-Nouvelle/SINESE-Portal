import { Building, FileText, BarChart3, CheckCircle } from "lucide-react";
import { usePublicationFormContext } from "../../_context/PublicationFormContext";

const LUCIDE_ICONS = { Building, FileText, BarChart3, CheckCircle };

const STEP_DESCRIPTIONS = {
  formEntreprise: "Sélectionnez ou ajoutez une entreprise.",
  formIndicateurs: "Renseignez les indicateurs que vous souhaitez publier. Vous pouvez aussi passer cette étape si vous souhaitez uniquement publier un rapport.",
  formRapport: "Choisissez le type de rapport et joignez le document ou indiquez son URL. Vous pouvez passer cette étape si vous souhaitez uniquement publier des indicateurs.",
  formRecap: "Vérifiez et validez votre demande de publication au sein du répertoire SINESE.",
};

export default function StepHeader() {
  const { steps, currentStepIndex, currentStep } = usePublicationFormContext();
  const step = steps[currentStepIndex];
  const IconComponent = step.icon ? LUCIDE_ICONS[step.icon] : null;

  return (
    <div className="form-section-header">
      <h3>
        {IconComponent && <IconComponent size={20} className="me-2" style={{ display: 'inline' }} />}
        {step.label}
      </h3>
      <div className="text-muted">
        {STEP_DESCRIPTIONS[currentStep]}
      </div>
    </div>
  );
}

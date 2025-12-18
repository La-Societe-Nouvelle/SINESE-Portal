import { useState, useMemo } from "react";

const DEFAULT_STEPS = [
  { key: "formEntreprise", label: "Entreprise", icon: "Building" },
  { key: "formDeclaration", label: "Déclaration", icon: "FileText", disabled: true },
  { key: "formEmpreinte", label: "Empreinte Sociétale", parent: "formDeclaration" },
  { key: "formExtraIndic", label: "Indicateurs supplémentaires", parent: "formDeclaration" },
  { key: "formDocuments", label: "Rapports RSE/ESG", icon: "FileText" },
  { key: "formRecap", label: "Récapitulatif", icon: "BarChart3" },
];

export default function usePublicationSteps({ initialStep = "formEntreprise", steps = DEFAULT_STEPS } = {}) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const currentStepIndex = useMemo(() => steps.findIndex((step) => step.key === currentStep), [steps, currentStep]);

  const goToNextStep = () => {
    let nextIndex = currentStepIndex + 1;
    while (nextIndex < steps.length && steps[nextIndex].disabled) {
      nextIndex++;
    }
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPrevStep = () => {
    let prevIndex = currentStepIndex - 1;
    while (prevIndex >= 0 && steps[prevIndex].disabled) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const goToStep = (key) => {
    if (steps.some((step) => step.key === key)) {
      setCurrentStep(key);
    }
  };

  return {
    steps,
    currentStep,
    setCurrentStep,
    currentStepIndex,
    goToNextStep,
    goToPrevStep,
    goToStep,
  };
}

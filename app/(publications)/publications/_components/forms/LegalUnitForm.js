import { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Plus,  AlertTriangle, ExternalLink } from "lucide-react";
import Select from "react-select";
import AddLegalUnitModal from "../modals/AddLegalUnitModal";
import YearSelector from "./YearSelector";
import { addLegalUnit } from "@/services/legalUnitService";

export default function LegalUnitForm({
  selectedLegalUnit,
  setSelectedLegalUnit,
  periodEnd,
  setPeriodEnd,
  periodStart,
  setPeriodStart,
  selectedYear,
  setSelectedYear,
  showDetailPeriod,
  setShowDetailPeriod,
  mode,
  setErrors,
  isLegalUnitPreselected = false,
  hidePeriod = false,
}) {
  const [showAddModal, setShowAddModal] = useState(false);

  const [legalUnits, setLegalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishedYears, setPublishedYears] = useState([]);

  useEffect(() => {
    async function fetchLegalUnits() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/legal-units");
        if (res.ok) {
          const data = await res.json();
          setLegalUnits(data);
        } else {
          setError("Erreur lors de la récupération des entreprises.");
        }
      } catch {
        setError("Une erreur est survenue.");
      }
      setLoading(false);
    }
    fetchLegalUnits();
  }, []);

  // Ensure selected legal unit is in the list (important for edit mode)
  useEffect(() => {
    if (selectedLegalUnit && selectedLegalUnit.siren && legalUnits.length > 0) {
      const existsInList = legalUnits.some((unit) => unit.siren === selectedLegalUnit.siren);

      if (!existsInList) {
        // Add the selected legal unit to the list if it's not already there
        setLegalUnits((prev) => [
          ...prev,
          {
            id: selectedLegalUnit.id,
            siren: selectedLegalUnit.siren,
            denomination: selectedLegalUnit.denomination,
          },
        ]);
      }
    }
  }, [selectedLegalUnit, legalUnits]);

  useEffect(() => {
    const legalUnit = legalUnits.find((u) => u.siren === selectedLegalUnit.siren);
    setPublishedYears(legalUnit?.publishedYears || []);
  }, [selectedLegalUnit, legalUnits]);

  const handleAdd = async (legalunit) => {
    setLoading(true);
    setError("");
    try {
      const newLegalUnit = await addLegalUnit({ siren: legalunit.siren, denomination: legalunit.denomination });
      setLegalUnits((prev) => [
        ...prev,
        newLegalUnit,
      ]);
      setSelectedLegalUnit({
        id: newLegalUnit.id,
        siren: newLegalUnit.siren,
        denomination: newLegalUnit.denomination,
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout de l'entreprise.");
    }
    setLoading(false);
  };

  // Format legal units for React Select
  const selectOptions = legalUnits.map((unit) => ({
    value: unit.siren,
    label: `${unit.denomination} (${unit.siren})`,
    data: unit,
  }));

  const selectedValue = selectedLegalUnit?.siren
    ? selectOptions.find((opt) => opt.value === selectedLegalUnit.siren)
    : null;

  // Custom styles for React Select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.25rem",
      fontSize: "0.95rem",
      backgroundColor: "#ffffff",
      color: "#1f2937",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(30, 64, 175, 0.1)" : "none",
      borderColor: state.isFocused ? "#1e40af" : "#d1d5db",
      "&:hover": {
        borderColor: "#9ca3af",
        backgroundColor: "#fafbfc",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "rgba(30, 64, 175, 0.1)" : "#ffffff",
      color: state.isSelected ? "#1e40af" : "#1f2937",
      padding: "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.15s ease",
      fontWeight: state.isSelected ? "600" : "400",
      borderLeft: state.isSelected ? "3px solid #1e40af" : "3px solid transparent",
      paddingLeft: "0.75rem",
      "&:active": {
        backgroundColor: "rgba(30, 64, 175, 0.15)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#1f2937",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.5rem 0",
    }),
  };

  const handleSelectChange = (option) => {
    if (option) {
      setSelectedLegalUnit({
        id: option.data.id,
        siren: option.data.siren,
        denomination: option.data.denomination,
      });
    } else {
      setSelectedLegalUnit(null);
    }
  };
  return (
    <>
      <Form.Group className="form-group" controlId="legalUnit">

        <div className="d-flex align-items-flex-start gap-3">
          <div style={{ flex: 1 }}>
            {legalUnits.length > 0 && (
              <Select
                options={selectOptions}
                value={selectedValue}
                onChange={handleSelectChange}
                isDisabled={mode === "edit" || loading || isLegalUnitPreselected}
                isLoading={loading}
                placeholder="Sélectionner une entreprise"
                isClearable={mode !== "edit" && !isLegalUnitPreselected}
                styles={selectStyles}
                aria-label="Sélectionner une entreprise"
                classNamePrefix="react-select"
              />
            )}
            {loading && legalUnits.length === 0 && (
              <div className="d-flex justify-content-center p-3">
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            )}
          </div>
          {mode !== "edit" && !isLegalUnitPreselected && (
            <Button
              variant="primary"
              className="flex-shrink-0"
              onClick={() => setShowAddModal(true)}
              aria-label="Ajouter une entreprise"
              title="Ajouter une nouvelle entreprise"
            >
              <Plus size={16} className="me-1" style={{ display: 'inline' }} />
              <span className="ms-1">Ajouter</span>
            </Button>
          )}
        </div>
        {
          selectedLegalUnit && (
            <div className="p-2">
              <ExternalLink size={16} className="me-2 mt-2" />
              <Button variant="link"
                target="_blank"
                href={`/entreprise/${selectedLegalUnit.siren}`} className="mt-2 p-0" aria-label="Voir les dernières données publiées">
                Voir les dernières données publiées
              </Button>
            </div>
          )
        }


      </Form.Group>

      {!hidePeriod && (
        <YearSelector
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          periodStart={periodStart}
          setPeriodStart={setPeriodStart}
          periodEnd={periodEnd}
          setPeriodEnd={setPeriodEnd}
          showDetailPeriod={showDetailPeriod}
          setShowDetailPeriod={setShowDetailPeriod}
          publishedYears={publishedYears}
          setErrors={setErrors}
        />
      )}

      {error && (
        <Alert variant="danger" className="alert mb-0">
          <AlertTriangle size={16} className="me-2" style={{ display: 'inline' }} />
          <div>{error}</div>
        </Alert>
      )}

      <AddLegalUnitModal show={showAddModal} onHide={() => setShowAddModal(false)} onAdd={handleAdd} />
    </>
  );
}

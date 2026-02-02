"use client";
import { Form } from "react-bootstrap";
import { Calendar, Check } from "lucide-react";

export default function YearSelector({
  selectedYear,
  setSelectedYear,
  periodStart,
  setPeriodStart,
  periodEnd,
  setPeriodEnd,
  showDetailPeriod,
  setShowDetailPeriod,
  publishedYears = [],
  setErrors,
}) {
  const currentYear = new Date().getFullYear();
  const startYear = 2015;
  
  // Generate array of years from 2015 to current year
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();

  const handleYearChange = (e) => {
    const year = e.target.value ? parseInt(e.target.value, 10) : "";
    setSelectedYear(year);

    if (year) {
      // Set default period dates (January 1st to December 31st of selected year)
      setPeriodStart(`${year}-01-01`);
      setPeriodEnd(`${year}-12-31`);

      const existingPublication = publishedYears.find((y) => Number(y.year) === year);

      setErrors((prev) => {
        if (existingPublication) {
          return {
            ...prev,
            formEntreprise: `Une demande de publication a déjà été faite pour l'année ${year}.`,
          };
        } else {
          const { formEntreprise, ...rest } = prev;
          return rest;
        }
      });
    } else {
      // Clear period dates if no year selected
      setPeriodStart("");
      setPeriodEnd("");
    }
  };

  const handleDetailPeriodChange = (e) => {
    setShowDetailPeriod(e.target.checked);
  };

  return (
    <>
      <Form.Group className="form-group" controlId="year">
        <Form.Label>Année concernée</Form.Label>
        <Form.Select
          value={selectedYear || ""}
          onChange={handleYearChange}
          aria-label="Sélectionner l'Année concernée"
          style={{ maxWidth: '250px' }}
        >
          <option value="">Sélectionner une année</option>
          {years.map((year) => {
            const isPublished = publishedYears.some((y) => Number(y.year) === year);
            return (
              <option key={year} value={year} disabled={isPublished}>
                {year}
              </option>
            );
          })}
        </Form.Select>
        {publishedYears.length > 0 && (
          <Form.Text className="text-muted">
            Les années grisées ont déjà une demande de publication en cours ou validée.
          </Form.Text>
        )}
      </Form.Group>

      {selectedYear && (
        <Form.Group className="form-group">
          {/* Carte cliquable pour préciser la période */}
          <div
            onClick={() => setShowDetailPeriod(!showDetailPeriod)}
            className={`year-selector-card ${showDetailPeriod ? 'active' : ''} mb-3`}
            onMouseEnter={(e) => {
              // Hover effect handled by SCSS
            }}
            onMouseLeave={(e) => {
              // Hover effect handled by SCSS
            }}
          >
            <div className="year-selector-card-content">
              <div className="year-selector-card-left">
                <div className="year-selector-card-icon">
                  <Calendar />
                </div>
                <div className="year-selector-card-text">
                  <h6>Préciser la période de l'exercice</h6>
                  <p>Indiquez les dates exactes de début et de fin</p>
                </div>
              </div>
              <div className="year-selector-card-checkbox">
                {showDetailPeriod && <Check />}
              </div>
            </div>
          </div>

          {showDetailPeriod && (
            <div className="year-selector-period-section">
              <h5>Période de l'exercice</h5>
              <div className="period-inputs">
                <div className="period-input-group">
                  <Form.Label className="small">Date de début</Form.Label>
                  <Form.Control
                    type="date"
                    value={periodStart || ""}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    aria-label="Date de début"
                  />
                </div>
                <span className="period-separator">au</span>
                <div className="period-input-group">
                  <Form.Label className="small">Date de fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={periodEnd || ""}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    aria-label="Date de fin"
                    min={periodStart || ""}
                  />
                </div>
              </div>
            </div>
          )}
        </Form.Group>
      )}
    </>
  );
}

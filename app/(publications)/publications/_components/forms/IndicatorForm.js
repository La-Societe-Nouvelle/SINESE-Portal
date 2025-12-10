import { Form, InputGroup, Row, Col } from "react-bootstrap";
import { HelpCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function IndicatorForm({ name, unit, data, category, onChange, url }) {
  const indicator = data[name] || {};
  const [fieldErrors, setFieldErrors] = useState({});

  const isValidNumber = (value) => {
    if (value === "" || value === null || value === undefined) return true; // Acceptable (vide = pas commencé)
    const num = Number(value);

    return !isNaN(num) && isFinite(num);
  };

  const handleInputChange = (e) => {
    const { name: field, value } = e.target;
    let newIndicator = { ...indicator };
    // Validation en temps réel pour les nombres
    if ((field === "value" || field === "uncertainty") && value !== "") {
      
      if (!isValidNumber(value)) {
        setFieldErrors((prev) => ({ ...prev, [field]: `La ${field} doit être un nombre valide` }));
      } else {
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    } else {
      // Nettoyer l'erreur si le champ devient vide
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    if (field === "value") newIndicator.value = value;
    if (field === "uncertainty") newIndicator.uncertainty = value;
    if (field === "comment") newIndicator.comment = value;
    onChange({ ...data, [name]: newIndicator });
  };

  return (
    <Form.Group controlId={`indicator-${name}`} className="indicator-form">
      <Row className="align-items-start g-3">
        {/* Valeur & Incertitude */}
        <Col md={category === "Indicateurs supplémentaires" ? 12 : 7} xs={12}>
          <div className="d-flex flex-column gap-3">
            <div className="indicator-input-group">
              <Form.Label className="indicator-form-label">Valeur</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  name="value"
                  value={indicator.value || ""}
                  onChange={handleInputChange}
                  placeholder="Entrez la valeur"
                  className={fieldErrors.value ? "is-invalid" : ""}
                />
                {unit && <InputGroup.Text className="indicator-unit-badge">{unit}</InputGroup.Text>}
              </InputGroup>
              {fieldErrors.value && (
                <div className="invalid-feedback" style={{ display: "block", marginTop: "0.5rem", color: "#e74c5a" }}>
                  <AlertCircle size={14} className="me-1" style={{ display: "inline" }} />
                  {fieldErrors.value}
                </div>
              )}
            </div>
            {category !== "Indicateurs supplémentaires" && (
              <div className="indicator-input-group">
                <Form.Label className="indicator-form-label">Incertitude</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    name="uncertainty"
                    value={indicator.uncertainty || ""}
                    onChange={handleInputChange}
                    placeholder="Entrez l'incertitude"
                    aria-label="Incertitude (%)"
                    className={fieldErrors.uncertainty ? "is-invalid" : ""}
                  />
                  <InputGroup.Text className="indicator-unit-badge">%</InputGroup.Text>
                </InputGroup>
                {fieldErrors.uncertainty && (
                  <div className="invalid-feedback" style={{ display: "block", marginTop: "0.5rem", color: "#e74c5a" }}>
                    <AlertCircle size={14} className="me-1" style={{ display: "inline" }} />
                    {fieldErrors.uncertainty}
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
        {/* Commentaire */}
        <Col md={category === "Indicateurs supplémentaires" ? 12 : 5} xs={12}>
          <div className="indicator-input-group">
            <Form.Label className="indicator-form-label">Commentaire public</Form.Label>
            <Form.Control
              as="textarea"
              rows={category === "Indicateurs supplémentaires" ? 2 : 5}
              name="comment"
              value={indicator.comment || ""}
              onChange={handleInputChange}
              placeholder="Ajoutez des détails ou contexte..."
            />
          </div>
        </Col>
      </Row>
      {url && (
        <div className="indicator-doc-link mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center gap-2"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
          >
            <HelpCircle size={16} />
            <span>Voir la documentation</span>
          </a>
        </div>
      )}
    </Form.Group>
  );
}

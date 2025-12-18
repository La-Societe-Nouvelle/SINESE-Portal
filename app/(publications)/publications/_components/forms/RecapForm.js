import indicators from "./../../_lib/indicators.json";
import { Table, Form, ListGroup } from "react-bootstrap";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

export default function RecapForm({
  legalUnit,
  declarationData,
  documents = [],
  periodEnd,
  confirmationChecked,
  setConfirmationChecked
}) {
  const extraIndicators = Object.entries(indicators).filter(
    ([_, meta]) => meta.category === "Indicateurs supplémentaires"
  );

  return (
    <div>
      <div className="recap-section">
        <div className="recap-info">
          <p>
            <b>Entreprise:</b> {legalUnit?.denomination} {legalUnit?.siren ? `(${legalUnit?.siren})` : ""}
          </p>
          <p>
            <b>Année de référence:</b> {new Date(periodEnd).getFullYear() || "Non spécifiée"}
          </p>
        </div>
      </div>

      <div className="recap-section">
        <h4>
          <BarChart3 size={20} className="me-2" style={{ display: 'inline' }} />
          Empreinte sociétale
        </h4>
        <Table className="table-striped">
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>Valeur</th>
              <th>Incertitude (%)</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(indicators).map(([key, meta]) => {
              const indicator = declarationData?.[key];
              if (!indicator || indicator.value === undefined || indicator.value === "") return null;
              if (meta.category === "Indicateurs supplémentaires") return null;
              return (
                <tr key={key}>
                  <td>{meta.libelle}</td>
                  <td className="fw-500">{indicator.value}</td>
                  <td>{indicator.uncertainty ?? <span className="text-muted">-</span>}</td>
                  <td>{indicator.comment || <span className="text-muted">-</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {extraIndicators.some(
        ([key]) => declarationData?.[key] && declarationData[key].value !== undefined && declarationData[key].value !== ""
      ) && (
        <div className="recap-section">
          <h4>
            <TrendingUp size={20} className="me-2" style={{ display: 'inline' }} />
            Indicateurs supplémentaires
          </h4>
          <Table className="table-striped">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Valeur</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {extraIndicators.map(([key, meta]) => {
                const indicator = declarationData?.[key];
                if (!indicator || indicator.value === undefined || indicator.value === "") return null;
                return (
                  <tr key={key}>
                    <td>{meta.libelle}</td>
                    <td className="fw-500">{indicator.value}</td>
                    <td>{indicator.comment || <span className="text-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {documents.length > 0 && (
        <div className="recap-section">
          <h4>
            <FileText size={20} className="me-2" style={{ display: 'inline' }} />
            Documents joints ({documents.length})
          </h4>
          <ListGroup variant="flush">
            {documents.map((doc) => (
              <ListGroup.Item key={doc.id} className="d-flex align-items-center gap-2">
                <FileText size={16} className="text-primary" />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 500 }}>{doc.name}</div>
                  <small className="text-muted">
                    {Math.round(doc.size / 1024)} KB
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}

        <Form.Check
          type="checkbox"
          id="honor-check"
          label="Je certifie sur l'honneur l'exactitude des informations fournies dans cette déclaration et confirme que je suis autorisé à publier ces données."
          required
          checked={confirmationChecked}
          onChange={(e) => setConfirmationChecked(e.target.checked)}
        />
    </div>
  );
}

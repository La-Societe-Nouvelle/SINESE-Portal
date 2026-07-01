// La Société Nouvelle

//-- Bootstrap
import { Image,Badge, Card, Row, Col } from "react-bootstrap"

//-- Packages
import _ from "lodash";
import { Calendar, Info, RefreshCw, AlertTriangle, Check, EqualApproximately, CircleQuestionMark } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

//-- Components
import Description from "../indic/Description";

//-- Utils
import { getFlagLabel } from "@/_utils/utils";

//-- Libs
import metaIndics from "@/_libs/indics";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const InformationDetailsModal = ({
  indic,
  footprint,
  history = [],
}) => {

  const {
    unitSymbol,
    nbDecimals
  } = metaIndics[indic];

  const {
    value,
    uncertainty,
    year,
    flag,
    lastupdate,
    source,
    info
  } = footprint[indic]

  const getFlagBadgeVariant = (flag) => {
    switch (flag) {
      case 'p': return 'success';
      case 'e': return 'warning';
      case 'd': return 'secondary';
      default: return 'secondary';
    }
  };

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'p': return <Check size={14} />;
      case 'e': return <EqualApproximately size={14} />;
      case 'd': return <CircleQuestionMark size={14} />;
      default: return <CircleQuestionMark size={14} />;
    }
  };

  return(
    <div className="indicator-details-content">

      {/* Valeur principale */}
      <Card className="mb-3 border-0 bg-light">
        <Card.Body className="text-center py-3">
          <div className="display-6 fw-bold text-primary mb-2">
            {_.round(value, nbDecimals).toLocaleString('fr-FR', {
              minimumFractionDigits: nbDecimals,
              maximumFractionDigits: nbDecimals
            })}
            <span className="fs-5 text-muted ms-2">{unitSymbol}</span>
          </div>
          <Badge bg={getFlagBadgeVariant(flag)} className="d-inline-flex align-items-center gap-1 px-3 py-2">
            {getFlagIcon(flag)}
            {getFlagLabel(flag)}
          </Badge>
          {year && <div className="mt-1"><small className="text-muted">{year}</small></div>}
        </Card.Body>
      </Card>

      {/* Graphique d'évolution */}
      {history.length > 1 && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="py-3 px-3">
            <h6 className="text-primary mb-3 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} className="me-2" />
              Évolution
            </h6>
            <Line
              data={{
                labels: history.map(d => d.year),
                datasets: [{
                  data: history.map(d => d.value),
                  borderColor: '#3b4d8f',
                  backgroundColor: 'rgba(59,77,143,0.08)',
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  borderWidth: 2,
                  fill: true,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 3.5,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: ctx => `${_.round(ctx.parsed.y, nbDecimals)} ${unitSymbol}` }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 10 }, callback: v => `${_.round(v, nbDecimals)} ${unitSymbol}` },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    border: { display: false },
                  },
                  x: {
                    ticks: {
                      font: { size: 11, weight: '500' },
                      color: '#6c757d',
                      maxRotation: 0,
                    },
                    grid: { display: false },
                    border: { display: false },
                  }
                }
              }}
            />
          </Card.Body>
        </Card>
      )}

      {/* Informations techniques */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <Info size={16} className="me-2" />
                Données techniques
              </h6>
              <div className="info-grid">
                <div className="info-item mb-3">
                  <div className="d-flex align-items-center text-muted mb-1">
                    <AlertTriangle size={14} className="me-2" />
                    <small>Incertitude</small>
                  </div>
                  <div className="fw-semibold">{uncertainty}%</div>
                </div>
                {lastupdate && (
                  <div className="info-item">
                    <div className="d-flex align-items-center text-muted mb-1">
                      <RefreshCw size={14} className="me-2" />
                      <small>Dernière mise à jour</small>
                    </div>
                    <div className="fw-semibold">
                      {new Date(lastupdate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-primary mb-3">Informations complémentaires</h6>
              {info ? (
                <p className="mb-0 text-muted small">{info}</p>
              ) : (
                <p className="mb-0 text-muted fst-italic small">Aucune précision ajoutée.</p>
              )}
              {source && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">Source :</small>
                  <div className="fw-semibold">{source}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Description */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="small">
          <h6 className="text-primary mb-3">À propos de cet indicateur</h6>
          <Description indic={indic} />
        </Card.Body>
      </Card>
    </div>
  )
}

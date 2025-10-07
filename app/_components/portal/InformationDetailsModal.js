// La Société Nouvelle

//-- Bootstrap
import { Image,Badge, Card, Row, Col } from "react-bootstrap"

//-- Packages
import _ from "lodash";
import { Calendar, Info, RefreshCw, AlertTriangle, ExternalLink, Check, EqualApproximately, CircleQuestionMark } from "lucide-react";

//-- Components
import Description from "../indic/Description";

//-- Utils
import { getFlagLabel } from "@/_utils/utils";

//-- Libs
import metaIndics from "@/_libs/indics";

export const InformationDetailsModal = ({
  indic,
  footprint
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
      {/* Valeur principale en highlight */}
      <Card className="mb-4 border-0 bg-light">
        <Card.Body className="text-center py-4">
          <div className="display-6 fw-bold text-primary mb-2">
            {_.round(value, nbDecimals).toLocaleString('fr-FR', { 
              minimumFractionDigits: nbDecimals, 
              maximumFractionDigits: nbDecimals 
            })}
            <span className="fs-4 text-muted ms-2">{unitSymbol}</span>
          </div>
          <Badge 
            bg={getFlagBadgeVariant(flag)} 
            className="d-inline-flex align-items-center gap-1 px-3 py-2"
          >
            {getFlagIcon(flag)}
            {getFlagLabel(flag)}
          </Badge>
        </Card.Body>
      </Card>

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
                {flag === "p" && (
                  <div className="info-item mb-3">
                    <div className="d-flex align-items-center text-muted mb-1">
                      <Calendar size={14} className="me-2" />
                      <small>Année de référence</small>
                    </div>
                    <div className="fw-semibold">{year}</div>
                  </div>
                )}
                <div className="info-item mb-3">
                  <div className="d-flex align-items-center text-muted mb-1">
                    <AlertTriangle size={14} className="me-2" />
                    <small>Incertitude</small>
                  </div>
                  <div className="fw-semibold">{uncertainty}%</div>
                </div>
                <div className="info-item">
                  <div className="d-flex align-items-center text-muted mb-1">
                    <RefreshCw size={14} className="me-2" />
                    <small>Dernière mise à jour</small>
                  </div>
                  <div className="fw-semibold">
                    {new Date(lastupdate).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-primary mb-3">Informations complémentaires</h6>
              {info ? (
                <p className="mb-0 text-muted">{info}</p>
              ) : (
                <p className="mb-0 text-muted fst-italic">Aucune précision ajoutée.</p>
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
      {/* Description de l'indicateur avec ODDs intégrés */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="small">
          <h6 className="text-primary mb-3">À propos de cet indicateur</h6>
            <Description indic={indic} />
        </Card.Body>
      </Card>
    </div>
  )
}

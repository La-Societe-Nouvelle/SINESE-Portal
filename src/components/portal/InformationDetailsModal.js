// La Société Nouvelle

//-- Bootstrap
import { Modal } from "react-bootstrap"

//-- Packages
import _ from "lodash";

//-- Components
import Description from "../indic/Description";

//-- Utils
import { getFlagLabel } from "../../utils/utils";

//-- Libs
import metaIndics from "../../lib/indics.json";

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

  return(
    <div>
      <h4>Informations</h4>
      <ul className="list-unstyled">
        <li className="mb-1">
          Valeur : <b>{_.round(value, nbDecimals).toFixed(nbDecimals) + unitSymbol}</b>
        </li>
        <li className="mb-1">
          Type de donnée : <b>{getFlagLabel(flag)}</b>
        </li>
        {flag == "p" && (
          <li className="mb-1">
            Année de référence : <b>{year}</b>
          </li>
        )}
        <li className="mb-1">
          Incertitude : <b> {uncertainty}%</b>
        </li>
        <li className="mb-1">
          Dernière mise à jour :{" "}
          <b>{new Date(lastupdate).toLocaleDateString("fr-FR")}</b>
        </li>
      </ul>
      <h5>Informations complémentaires</h5>
      {/* {description && <p>{description}</p>} */}
      {info ? (
        <p>{info}</p>
      ) : (
        <p className="fst-italic">Aucune précision ajoutée.</p>
      )}
      {source && <p>Source : {source} </p>}
      <h5>Précisions sur l'indicateur</h5>
      <Description 
        indic={indic}
      />
    </div>
  )
}

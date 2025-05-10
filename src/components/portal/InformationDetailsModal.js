// La Société Nouvelle

//-- Bootstrap
import { Image, Modal } from "react-bootstrap"

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
    nbDecimals,
    description,
    odds
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
          Valeur : <b>{_.round(value, nbDecimals).toFixed(nbDecimals) +" " + unitSymbol}</b>
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
          Dernière mise à jour (Répertoire SINESE) :{" "}
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
      <p>
        {description}
      </p>
      {/* <p>
        <a
          href={"/indicateurs/"+indic.toLowerCase()}
          target="_blank"
          className="text-decoration-underline"
          title="En savoir plus sur l'indicateur"
        >
          En savoir plus &raquo;
        </a>
      </p> */}
      {odds.length>0 &&
        <>
          <h5>Objectifs de développement durable associés</h5>
          {odds.map((odd) =>
            <Image
              id="logo-odd"
              src={"/images/odd/F-WEB-Goal-"+odd+".png"}
              alt="logo odd"
              className="mb-3 me-2"
              height={60}
            />
          )}
        </>}
    </div>
  )
}

import React from "react";
import { Image } from "react-bootstrap";

const Description = ({ indic }) => {
  let description = "";

  switch (indic) {
    case "ART":
      description = (
        <div>
          <p>
            Indicateur de la part de la valeur produite par des entreprises
            artisanales, créatives ou reconnues pour leur savoir-faire (en %).
            Vise à valoriser les savoir-faire artisanaux auprès des
            consommateurs.
          </p>
          <a
            href={"/indicateurs/art"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
            height={60}
          />
          <Image
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-09.png"
            alt="logo odd"
            className="mb-3"
            height={60}
          />
        </div>
      );
      break;
    case "ECO":
      description = (
        <div>
          <p>
            Indicateur de la part de la valeur produite sur le territoire
            français (en %). Vise à informer sur la localisation des activités
            (France ou étranger).
          </p>
          <a
            href={"/indicateurs/eco"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
            height={60}
          />
          <Image
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-09.png"
            alt="logo odd"
            className="mb-3 me-2"
            height={60}
          />
          <Image
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3"
            height={60}
          />
        </div>
      );
      break;
    case "GEQ":
      description = (
        <div>
          <p>
            Indicateur de l'écart de salaires entre les femmes et les hommes
            dans les entreprises ayant contribué à la production de la valeur.
            Vise à réduire l'écart de rémunération entre les hommes et les
            femmes.
          </p>
          <a
            href={"/indicateurs/geq"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-05.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-10.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "GHG":
      description = (
        <div>
          <p>
            Indicateur de la quantité de gaz à effet de serre émise par unité de
            valeur produite (gCO2e/€). Informe sur les émissions liées à la
            production de l'entreprise et vise à identifier les entreprises les
            plus performantes en matière d'émissions.
          </p>
          <a
            href={"/indicateurs/ghg"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-07.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-13.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-14.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-15.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
        </div>
      );
      break;
    case "HAZ":
      description = (
        <div>
          <p>
            Indicateur de la quantité de produits dangereux pour la santé et
            l'environnement utilisée par unité de valeur produite (g/€). Ne
            prend pas en compte les dangers physiques. Basé sur les pictogrammes
            de danger sur les produits. Vise à réduire l'utilisation de ces
            produits nocifs pour la santé et l'environnement (pesticides, etc.).
          </p>
          <a
            href={"/indicateurs/haz"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-03.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-14.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-15.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "IDR":
      description = (
        <div>
          <p>
            Indicateur de l'écart des rémunérations au sein des entreprises
            ayant contribué à la production de la valeur. Vise à identifier les
            entreprises qui ont un partage plus équitable de la valeur produite
            et encourager ces pratiques.
          </p>
          <a
            href={"/indicateurs/idr"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-10.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "KNW":
      description = (
        <div>
          <p>
            Indicateur de la part de la valeur produite allouée à la recherche,
            la formation et l'enseignement (en %). Informe sur la part des
            revenus de l'entreprise consacrés à ces activités.
          </p>
          <a
            href={"/indicateurs/knw"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-04.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-09.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "MAT":
      description = (
        <div>
          <p>
            Indicateur de la quantité de matières premières extraites (minerais,
            fossiles, biomasse) par unité de valeur produite (g/€). Informe sur
            le recours à l'extraction de ressources naturelles, la réutilisation
            de matières premières est exclue de la mesure.
          </p>
          <a
            href={"/indicateurs/mat"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-14.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-15.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "NRG":
      description = (
        <div>
          <p>
            Indicateur de la consommation d'énergie primaire par unité de valeur
            produite (kJ/€). De nombreux enjeux sont liés à l'énergie tels que
            la consommation de ressources naturelles ou les émissions de gaz à
            effet de serre. L'indicateur informe sur la pression exercée sur
            l'environnement.
          </p>
          <a
            href={"/indicateurs/nrg"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-07.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-13.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "SOC":
      description = (
        <div>
          <p>
            Indicateur de la part de la valeur produite en lien avec une mission
            ou une raison d'être socialement responsable (en %). Vise à mesurer
            l'engagement de l'entreprise en termes d'enjeux environnementaux et
            sociétaux et donner un sens à ses activités en dehors de la
            recherche de profit.
          </p>
          <a
            href={"/indicateurs/soc"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "WAS":
      description = (
        <div>
          <p>
            Indicateur de la quantité de déchets produite par unité de valeur
            produite (g/€). Vise à réduire la quantité de déchets générés et
            informe sur les efforts de l'entreprise en termes de gestion des
            déchets.
          </p>
          <a
            href={"/indicateurs/was"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-03.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-06.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-11.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-14.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-15.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "IEP":
      description = (
        <div>
          <p>
            L'index de l'égalité professionnelle est un outil visant à calculer les écarts de rémunération entre les femmes et les hommes dans l'entreprise. Il est obligatoire pour toute entreprise présentant au moins 50 salariés au cours de l'année écoulée. Il doit être publié chaque année, au plus tard le 1er mars.
          </p>
          <a
            href="https://egapro.travail.gouv.fr/"
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="Accéder au site EgaPro"
          >
            Accéder à EgaPro &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-05.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-10.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "BEGES":
      description = (
        <div>
          <p>
            Le bilan GES (Gaz à Effet de Serre) est un outil de diagnostic qui permet de connaître les émissions directes et indirectes de gaz à effet de serre d'une organisation. Il est obligatoire pour certaines entreprises et collectivités et constitue un préalable à la mise en place d'une stratégie de réduction des émissions.
          </p>
          <a
            href="https://bilans-ges.ademe.fr/"
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="Accéder au site Bilans GES ADEME"
          >
            Accéder à Bilans GES &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-07.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-13.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    case "WAT":
      description = (
        <div>
          <p>
            Indicateur de la quantité d'eau consommée par unité de valeur
            produite (L/€). Vise à informer sur l'utilisation de la ressource
            eau et s'inscrit dans une volonté de gestion globale des ressources
            naturelles, en particulier dans le contexte de la diminution des
            quantités d'eau disponibles lié au changement climatique.
          </p>
          <a
            href={"/indicateurs/wat"}
            target="_blank"
            className="btn btn-primary btn-sm mb-4"
            title="En savoir plus sur l'indicateur"
          >
            En savoir plus &raquo;
          </a>{" "}
          <h6>Objectifs de développement durable associés</h6>
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-03.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-06.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-08.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-12.png"
            alt="logo odd"
            className="mb-3 me-2"
          />
          <Image
            height={60}
            id="logo-odd"
            src="/images/odd/F-WEB-Goal-15.png"
            alt="logo odd"
            className="mb-3"
          />
        </div>
      );
      break;
    default:
      break;
  }

  return description;
};

export default Description;

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, Button, Col, Container, Image, Row } from "react-bootstrap";
import ErrorAlert from "../../../src/components/Error";
import { ContentSocialFootprint } from "../../../_components/portal/ContentSocialFootprint";
import Header from "@/_components/header";

const CompanyData = () => {
  const { siren } = useParams();

  const [error, setError] = useState();
  const [dataFetched, setDataFetched] = useState(false);
  const [legalUnit, setLegalUnit] = useState();
  const [footprint, setFootprint] = useState();
  const [additionnalData, setAdditionnalData] = useState();
  const [divisionFootprint, setDivisionFootprint] = useState();
  const [historicalDivisionFootprint, setHistoricalDivisionFootprints] = useState();
  const [meta, setMeta] = useState();

  useEffect(() => {
    if (siren) {
      getLegalUnitFootprint(siren);
    }
    // eslint-disable-next-line
  }, [siren]);

  useEffect(() => {
    if (legalUnit) {
      const code = legalUnit.activitePrincipaleCode?.slice(0, 2);
      if (code) {
        getDivisionFootprint(code);
        getHistoricalDivisionFootprint(code);
      }
    }
    // eslint-disable-next-line
  }, [legalUnit]);

  async function getLegalUnitFootprint(siren) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/legalunitFootprint/${siren}`);
      const response = await res.json();
      if (response.header?.code === 200) {
        setLegalUnit(response.legalUnit);
        setFootprint(response.footprint);
        setAdditionnalData(response.additionnalData);
        setMeta(response.metaData);
      } else {
        setError(response.header);
      }
    } catch (error) {
      setError({ code: 500 });
    }
  }

  async function getDivisionFootprint(code) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/defaultfootprint/?code=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();
      setDataFetched(true);
      if (response.header?.code === 200) {
        setDivisionFootprint(response.footprint);
      } else {
        setError(response.header);
      }
    } catch (error) {
      setError({ code: 500 });
    }
  }

  async function getHistoricalDivisionFootprint(code) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/macrodata/macro_fpt_a88?division=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();
      setDataFetched(true);
      if (response.header?.code === 200) {
        let divisionFootprints = {};
        response.data.forEach((element) => {
          const indic = element.indic;
          if (!divisionFootprints[indic]) {
            divisionFootprints[indic] = [];
          }
          divisionFootprints[indic].push(element);
        });
        setHistoricalDivisionFootprints(divisionFootprints);
      } else {
        setError(response.header);
      }
    } catch (error) {
      setError({ code: 500 });
    }
  }

  let printMessage =
    dataFetched &&
    footprint &&
    ["ECO", "ART", "SOC", "IDR", "GEQ", "KNW", "GHG", "NRG", "WAT", "MAT", "WAS", "HAZ"].some(
      (indic) => footprint[indic]?.flag === "d"
    );

  return (
    <>
      <Header />
      <div className="open-data-portal ">
        <Container>
          {!error && !dataFetched && (
            <div className="bg-white p-5 rounded-3">
              <h2 className="text-center">
                Empreinte Sociétale de l'entreprise <b>#{siren}</b>
              </h2>
              <div className="text-center">
                <p>Chargement des données... </p>
                <div className="dot-pulse m-auto"></div>
              </div>
            </div>
          )}

          {error && <ErrorAlert code={error.code} />}

          {dataFetched && footprint && divisionFootprint && meta && (
            <>
              <div className="box">
                <Row>
                  <h2 className="mb-4 border-bottom border-3 pb-2">Empreinte Sociétale de l'entreprise</h2>
                  <Col lg={4}>
                    <h2 className="text-wrap mb-2">
                      {legalUnit.statutdiffusion ? legalUnit.denomination : legalUnit.siren}
                    </h2>
                    {!legalUnit.statutdiffusion && (
                      <p className="small" title="Informations partiellement rendues publiques par l'entreprise">
                        <i className="bi bi-exclamation-triangle-fill"> Diffusion partielle</i>
                      </p>
                    )}
                    {legalUnit.statutdiffusion && legalUnit.denominationUsuelle && (
                      <h3>({legalUnit.denominationUsuelle})</h3>
                    )}

                    {legalUnit.societeMission && (
                      <Badge pill bg="secondary" className="me-2">
                        Société à mission
                      </Badge>
                    )}
                    {legalUnit.economieSocialeSolidaire && (
                      <Badge pill bg="secondary" className="me-2">
                        Économie sociale et solidaire
                      </Badge>
                    )}
                    {legalUnit.hasCraftedActivities && (
                      <Badge pill bg="secondary" className="">
                        Activité(s) enregistrée(s) au registre des métiers
                      </Badge>
                    )}
                  </Col>
                  <Col>
                    <p>
                      <b>SIREN</b> : {legalUnit.siren}
                    </p>
                    <p>
                      <b>Activité principale </b> : {legalUnit.activitePrincipaleLibelle} (
                      {legalUnit.activitePrincipaleCode})
                    </p>
                    <p>
                      <b>Siège</b>:{" "}
                      {legalUnit.statutdiffusion
                        ? `${legalUnit.codePostalSiege} ${legalUnit.communeSiege}`
                        : legalUnit.communeSiege}
                    </p>
                  </Col>
                </Row>
              </div>

              {printMessage && (
                <div className="alert alert-warning d-flex justify-content-between p-4">
                  <p className="p-0 m-0">
                    <i className="bi bi-exclamation-circle me-1"></i> Certaines données affichées correspondent à{" "}
                    <strong>des valeurs par défaut affectées à l'unité légale</strong>. Elles permettent une estimation
                    des impacts indirects d'une dépense auprès de cette entreprise, en s'appuyant sur ses
                    caractéristiques (activité principale, tranche d'effectifs, etc.).
                  </p>
                  <a href="/publier-empreinte" target="_blank" className="btn btn-primary w-50 p-auto m-auto ms-4">
                    <i className="bi bi-check2-square"></i> Actualiser mon empreinte
                  </a>
                </div>
              )}

              <div className="footprint">
                <ContentSocialFootprint
                  footprint={footprint}
                  historicalDivisionFootprint={historicalDivisionFootprint}
                  divisionFootprint={divisionFootprint}
                  additionnalData={additionnalData}
                />
              </div>
            </>
          )}
        </Container>
        <div>
          <Container>
            <Row>
              <Col>
                <div className="box">
                  <Image
                    src="/illustrations/default-data-illu.png"
                    alt="Illustration calcul données par défaut"
                    className="mx-auto d-block"
                  />
                  <h4 className="my-3 text-center">A quoi correspondent les valeurs par défaut ?</h4>
                  <p className="my-4">
                    Les données par défaut correspondent aux valeurs utilisées lorsque l'empreinte sociétale d'une
                    entreprise n'est pas publiée. Elles visent à permettre une estimation des impacts indirects d'une
                    dépense auprès de cette entreprise, en s'appuyant sur ses caractéristiques (activité principale,
                    effectifs, etc.).
                  </p>
                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      href="https://docs.lasocietenouvelle.org/donnees"
                      target="_blank"
                      title="Accéder à la documentation complète"
                    >
                      Voir la documentation
                    </Button>
                  </div>
                </div>
              </Col>
              <Col>
                <div className="box ">
                  <Image
                    src="/illustrations/publish-footprint-illu.png"
                    alt="Illustration publication de données"
                    className="mx-auto d-block"
                  />
                  <h4 className="my-3 text-center">Comment publier mon empreinte sociétale ?</h4>
                  <p className="my-4">
                    Une demande de publication doit être envoyée via le formulaire de publication, accessible
                    ci-dessous. Un outil libre et open source est à votre disposition pour faciliter la mesure des
                    indicateurs. Vous pouvez également solliciter votre expert comptable sur ce sujet.
                  </p>
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      href="/publier-empreinte"
                      target="_blank"
                      title="Publier directement vos résultats"
                      className="me-2"
                    >
                      Publier mon empreinte
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default CompanyData;

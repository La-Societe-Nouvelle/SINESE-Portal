// La Société Nouvelle

// Reatc
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Helmet } from "react-helmet";

// Components
import CustomNav from "../components/navbar";
import { LineChart } from "../components/charts/LineChart";

const portail = () => 
{
  const [metadata, setMetadata] = useState({});
  const [data, setData] = useState(null);
  const dataset = "macro_fpt";
  const [selectedValues, setSelectedValues] = useState({
    industry: "TOTAL",
    country: "FRA",
    aggregate: "PRD"
  });

  // --------------------------------------------------
  // fetching data

  const fetchMetadata = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/macrodata/metadata/macro_fpt`);
    const results = await response.json();
    setMetadata(results.metadata);
  };

  const fetchData = async () => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/macrodata/${dataset}?`
      + Object.entries(selectedValues).map(([param,value]) => param+"="+value).join("&");
    const response = await fetch(baseUrl);
    const results = await response.json();
    setData(results.data);
  };

  // --------------------------------------------------
  // effect

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchData()
  }, [selectedValues]);

  // --------------------------------------------------

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setSelectedValues({
      industry: 'TOTAL',
      country: 'FRA',
      aggregate: 'PRD'
    });
  };

  // --------------------------------------------------

  return (
    <>
      <Helmet>
        <title>
          La Société Nouvelle | Portail des empreintes sociétales des
          entreprises françaises
        </title>

        <meta
          property="og:title"
          content="Portail des empreintes sociétales des
          entreprises françaises"
        />
        <meta
          property="og:url"
          content="https://lasocietenouvelle.org/"
        />
        <meta
          property="og:description"
          content="Consultez librement les données publiées sur les impacts de la valeur produite par les entreprises françaises."
        />
        <meta
          property="og:image"
          content="/portail.jpg"
        />
      </Helmet>
      <Row>
        <Col md={3} lg={2} className="navbar-menu d-none d-md-block">
          <CustomNav
            li={[
              ["Entreprises", "Empreintes des entreprises françaises", "/"],
              ["Macroéconomie", "Empreintes des activités économiques", "/macro"],
              // ["Collectivités", "Empreintes des collectivités territoriales", "/macro"]
            ]}
          />
        </Col>
        <Col md={9} lg={10} className="p-0">
          <section className="bg-primary py-3 px-4">
            <h1 className="text-white">Panorama de l'empreinte des activités économiques</h1>
          </section>
          <section className="open-data-portal">
            <Container className="mb-3 px-5">
              <Form className="filter-form">
                <Row>
                  <Col key={"industry"} md={4}>
                    <Form.Group controlId={"industry"} className="mb-2">
                      <Form.Label>{"Secteur"}</Form.Label>
                      <Form.Control
                        as="select"
                        name={"industry"}
                        value={selectedValues["industry"] || ""}
                        onChange={handleSelectChange}
                      >
                        {metadata?.industry?.map(({ code, label }) => (
                          <option key={code} value={code}>
                            {code !== label ? `${code} - ${label}` : label}
                          </option>))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col key={"country"} md={3}>
                    <Form.Group controlId={"country"} className="mb-2">
                      <Form.Label>{"Pays"}</Form.Label>
                      <Form.Control
                        as="select"
                        name={"country"}
                        value={selectedValues["country"] || ""}
                        onChange={handleSelectChange}
                      >
                        {metadata?.country?.map(({ code, label }) => (
                          <option key={code} value={code}>
                            {code !== label ? `${code} - ${label}` : label}
                          </option>))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col key={"aggregate"} md={3}>
                    <Form.Group controlId={"aggregate"} className="mb-2">
                      <Form.Label>{"Agrégat"}</Form.Label>
                      <Form.Control
                        as="select"
                        name={"aggregate"}
                        value={selectedValues["aggregate"] || ""}
                        onChange={handleSelectChange}
                      >
                        {metadata?.aggregate?.map(({ code, label }) => (
                          <option key={code} value={code}>
                            {code !== label ? `${code} - ${label}` : label}
                          </option>))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <div className=" my-3 mt-4">
                      <Button variant="info" size="sm" onClick={handleCancel}>
                        Effacer les filtres
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>              
            </Container>
            <Container className="px-5">
              {data && 
                <>
                  <h2>Indicateurs - Création de la valeur</h2>
                  <Row className="px-2 mb-4">
                    <Col className="data-visual">
                      <h3 className="mb-1">Contribution à l'économie nationale</h3>
                      <p>en %</p>
                      <LineChart data={data.filter((item) => item.indic == "ECO")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Contribution aux métiers d'art et aux savoir-faire</h3>
                      <p>en %</p>
                      <LineChart data={data.filter((item) => item.indic == "ART")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Contribution aux acteurs d'intérêt social</h3>
                      <p>en %</p>
                      <LineChart data={data.filter((item) => item.indic == "SOC")} />
                    </Col>
                  </Row>
                  <h2>Indicateurs - Empreinte sociale</h2>
                  <Row className="px-2 mb-4">
                    <Col className="data-visual">
                      <h3 className="mb-1">Ecart de rémunération femmes/hommes</h3>
                      <p>en % du taux horaire moyen</p>
                      <LineChart data={data.filter((item) => item.indic == "GEQ")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Ecart des rémunérations</h3>
                      <p>Ratio sans unité</p>
                      <LineChart data={data.filter((item) => item.indic == "IDR")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Contribution à l'évolution des compétences et des connaissances</h3>
                      <p>en %</p>
                      <LineChart data={data.filter((item) => item.indic == "KNW")} />
                    </Col>
                  </Row>
                  <h2>Indicateurs - Empreinte environnementale</h2>
                  <Row className="px-2">
                    <Col className="data-visual">
                      <h3 className="mb-1">Intensité d'émission de gaz à effet de serre</h3>
                      <p>en gCO2e/€</p>
                      <LineChart data={data.filter((item) => item.indic == "GHG")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Intensité de consommation d'énergie</h3>
                      <p>en kJ/€</p>
                      <LineChart data={data.filter((item) => item.indic == "NRG")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Intensité de consommation d'eau</h3>
                      <p>en L/€</p>
                      <LineChart data={data.filter((item) => item.indic == "WAT")} />
                    </Col>
                  </Row>
                  <Row className="px-2 mb-4">
                    <Col className="data-visual">
                      <h3 className="mb-1">Intensité d'extraction de matières premières</h3>
                      <p>en g/€</p>
                      <LineChart data={data.filter((item) => item.indic == "MAT")} />
                    </Col>
                    <Col className="data-visual">
                      <h3 className="mb-1">Intensité de production de déchets</h3>
                      <p>en g/€</p>
                      <LineChart data={data.filter((item) => item.indic == "WAS")} />
                    </Col>
                    <Col className="data-visual bg-white">
                      <h3 className="mb-1">Intensité d'utilisation de produits dangereux</h3>
                      <p>en g/€</p>
                      <LineChart data={data.filter((item) => item.indic == "HAZ")} />
                    </Col>
                  </Row>
                </>}
            </Container>
          </section>
        </Col>
      </Row>
    </>
  );
};

export default portail;

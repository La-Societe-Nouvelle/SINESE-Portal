import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Helmet } from "react-helmet";

import axios from "axios";

import CustomNav from "../components/navbar";
import ErrorAlert from "../components/Error";
import PaginatedLegalunit from "../components/PaginatedLegalunit";
import { LineChart } from "../components/charts/LineChart";

const portail = () => 
{
  const [search, setSearch] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [legalUnits, setLegalUnits] = useState([]);
  const [error, setError] = useState();
  const router = useRouter();
  const [metadata, setMetadata] = useState({});
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const dataset = "macro_fpt";
  const [selectedValues, setSelectedValues] = useState({
    industry: "TOTAL",
    country: "FR",
    aggregate: "PRD"
  });

  const inputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode == 13) {
      handleClick();
      return true;
    } else {
      return false;
    }
  };

  const handleClick = async () => {
    setLegalUnits([]);
    setError();
    setIsLoading(true);
    await searchLegalUnits(search);
  };

  const searchLegalUnits = async (search) => {
    // replace accents
    let string = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    await axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/legalunit/${string}`, {
        timeout: 15000,
      })
      .then((response) => {
        if (response.data.header.code == 200) {
          const legalUnits = response.data.legalUnits;
          if (legalUnits.length === 1) {
            const siren = legalUnits[0].siren;
            // Redirect to the specific company page 
            router.push(`/company/${siren}`);
          } else {
            setLegalUnits(legalUnits);
          }
        } else {
          setError(response.data.header.code);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError(504);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const fetchDataMeta = async () => {
      if (dataset) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/macrodata/metadata/${dataset}`
        );
        const results = await response.json();
        setMetadata(results.metadata);
      }
    };
    fetchDataMeta();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/macrodata/${dataset}?`
        + Object.entries(selectedValues).map(([param,value]) => param+"="+value).join("&");
      
      const response = await fetch(baseUrl);
      const results = await response.json();
      setData(results.data);
      setColumns(Object.keys(results.data[0]));
    };
    fetchData()
  }, [selectedValues]);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setSelectedValues({});
    setFilteredData([]);
  };

  const generateOptions = (key) => {
    console.log(key);
    console.log(metadata);
    console.log(metadata[key]);
    console.log([...metadata[key]]);
    const values = [...metadata[key]];

    if(key == "branch" || key == "indic" || key == "division") {
      values.sort((a, b) => {
        return a.code.localeCompare(b.code);
      }); 
    }
    else {
      values.sort((a, b) => {
        if (a.label === null || b.label === null) {
          return 0; // Ignore the sorting if label is null
        }
        return a.label.localeCompare(b.label);
      }); 
    }
   
    return values.map(({ code, label }) => (
      <option key={code} value={code}>
        {code !== label ? `${code} - ${label}` : label}
      </option>
    ));
  };

  console.log(data);
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
              ["Collectivités", "Empreintes des collectivités territoriales", "/macro"]
            ]}
          />
        </Col>
        <Col md={9} lg={10}>
          <section className="open-data-portal">
            <Container>
            <Form className={"filter-form"}>
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
                  <Col key={"country"} md={4}>
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
                  <Col key={"aggregate"} md={4}>
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
                </Row>
                <div className=" my-3">
                  <Button variant="info" size="sm" onClick={handleCancel}>
                    Effacer les filtres
                  </Button>
                </div>
              </Form>              
            </Container>
            <Container>
              {data && 
                <>
                  <Row>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "ECO")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "ART")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "SOC")} />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "GEQ")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "IDR")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "KNW")} />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "GHG")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "NRG")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "WAT")} />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "MAT")} />
                    </Col>
                    <Col>
                      <LineChart data={data.filter((item) => item.indic == "WAS")} />
                    </Col>
                    <Col>
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

import { Container, Row, Col, Image } from "react-bootstrap";
import PageHeader from "../../_components/PageHeader";

export default function Newsletter() {
  return (
    <>
      <PageHeader title="Inscription à notre Newsletter" path="newsletter" />
      <Container>
        <div>
          <Row>
            <Col lg={7}>
              <iframe
                width="100%"
                height="800px"
                src="https://a2dec458.sibforms.com/serve/MUIEAE87cWMEBduAwTKh6kNCKZRFF4iVG4F1d0WT5TuD4LYdWSn_LdL8FHgC0SuDGKSKe7PVrx-vcOQn8KwHR6JmimxBzdH7seeIYDD_5K31DYP3Y-qGV8gcbVSHehd2qWU8j90PIYaydyKOEGO6S_ijEsBCiialfd2BEvM6AB8_FZXMOJgtsFu6sOOtOd7zLqnu4tEIEE8HEHTc"
                frameBorder="0"
              ></iframe>
            </Col>
            <Col>
              <Image
                className="mt-5"
                fluid
                src="illustrations/newsletter.svg"
              ></Image>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
}

export const metadata = {
  title: "La Société Nouvelle | Newsletter",
};
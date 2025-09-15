import React from 'react';
import { Row, Col } from 'react-bootstrap';

const SearchResultsDivider = ({ withDataCount, withoutDataCount }) => {
  if (withoutDataCount === 0) return null;

  return (
    <Row className="search-results-divider my-4">
      <Col>
        <div className="d-flex align-items-center">

          <hr className="flex-grow-1" />
        </div>
        <div className="text-center  mt-2">
          <small className="text-muted">
            Les entreprises suivantes correspondent à votre recherche mais n'ont pas encore publié leur empreinte sociétale.
          </small>
        </div>
      </Col>
    </Row>
  );
};

export default SearchResultsDivider;
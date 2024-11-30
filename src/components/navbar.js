import React, { useState } from "react";
import {
    Col,
    Container,
    Dropdown,
    Image,
    Nav,
    Navbar,
    NavDropdown,
    Row,
  } from "react-bootstrap";

const CustomNav = ({ li }) => {
  const [window, setWindow] = useState(false);

  let openClose = () => {
    if (window === false) {
      setWindow(true);
    } else {
      setWindow(false);
    }
  };
  return (
    <nav>
      <ul className="navbar__list">
        {li.map((item, i) => (
          <Nav.Link className="navbar__li-box d-flex justify-content-between align-items-center gap-2" href={item[2]} key={i}>
            <li
              className="navbar__li"
            >
                <p className="m-0 fw-bold">{item[0]}</p>
                <p className="small text-gray700 m-0 fw-light">{item[1]}</p>
            </li>
            <i className="bi bi-chevron-right"></i>
          </Nav.Link>
        ))}
      </ul>
    </nav>
  );
};

export default CustomNav;

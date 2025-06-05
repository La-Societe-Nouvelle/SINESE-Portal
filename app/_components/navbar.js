import { useRouter } from "next/router";
import React, { useState } from "react";
import { Image, Nav, Navbar } from "react-bootstrap";


const CustomNav = ({ li }) => {
  const [window, setWindow] = useState(false);
  const { asPath } = useRouter();

  let openClose = () => {
    if (window === false) {
      setWindow(true);
    } else {
      setWindow(false);
    }
  };
  return (
    <nav>
      <Navbar.Brand className="p-3" href="/">
        <Image
          src="/logo-La-Societe-Nouvelle.svg"
          height="80"
          className="d-inline-block align-center"
          alt="logo"
        />
      </Navbar.Brand>
      <ul className="navbar__list">
        {li.map((item, i) => {
          const isActive = asPath === item[2];
          return (
            <Nav.Link
              className={`navbar__li-box d-flex justify-content-between align-items-center gap-2 ${isActive ? "navbar__li-box--active" : ""
                }`}
              href={item[2]}
              key={i}
            >
              <li className="navbar__li">
                <p className="m-0 fw-bold">{item[0]}</p>
                <p className="small text-gray700 m-0 fw-light">{item[1]}</p>
              </li>
              <i className="bi bi-chevron-right"></i>
            </Nav.Link>
          );
        })}
      </ul>
    </nav>
  );
};

export default CustomNav;

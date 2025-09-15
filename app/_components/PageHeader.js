"use client";

import React from 'react';
import { Container } from 'react-bootstrap';

export default function PageHeader({ 
  title, 
  subtitle, 
  path, 
  hasBreadcrumbs = true,
  icon = null
}) {
  return (
    <div className="page-header compact">
      <Container>
        <div className="d-flex align-items-center">
          {icon && (
            <div className="page-icon me-3">
              {icon}
            </div>
          )}
          <div>
            <h2 className="mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="mb-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
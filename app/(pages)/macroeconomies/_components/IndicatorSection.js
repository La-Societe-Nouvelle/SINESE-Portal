"use client";

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import IndicatorCard from './IndicatorCard';

export default function IndicatorSection({
  title,
  description,
  indicators,
  data,
  isLoading = false,
  sectionColor = '#3b4d8f'
}) {
  // Déterminer la classe de couleur
  const getColorClass = (color) => {
    if (color === '#3b4d8f') return 'primary';
    if (color === '#e74c5a') return 'secondary';
    if (color === '#6c7fdd') return 'tertiary';
    if (color === '#28a745') return 'success';
    if (color === '#17a2b8') return 'info';
    if (color === '#ffc107') return 'warning';
    return 'primary';
  };

  return (
    <div className="indicator-section">
      {/* En-tête de section */}
      <div className="section-header">
        <h2 className={`section-title ${getColorClass(sectionColor)}`}>
          {title}
        </h2>
        <p className="section-description">{description}</p>
      </div>

      {/* Grille d'indicateurs */}
      <div className="indicators-grid">
        <Row className="g-4">
        {indicators.map((indicator) => {
          const indicatorData = data?.filter((item) => item.indic === indicator.code) || [];

          return (
            <Col key={indicator.code} lg={4} md={6}>
              <IndicatorCard
                title={indicator.title}
                unit={indicator.unit}
                data={indicatorData}
                icon={indicator.icon}
                color={sectionColor}
                isLoading={isLoading}
              />
            </Col>
          );
        })}
        </Row>
      </div>
    </div>
  );
}
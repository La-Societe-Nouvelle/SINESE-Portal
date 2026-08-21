"use client";

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import IndicatorCard from './IndicatorCard';
import { getDisplayLabel } from '../_utils/labels';

// Couleurs additionnelles pour les pays comparés au-delà du premier (qui garde
// la couleur de la section pour rester cohérent avec le reste de la page).
const COMPARISON_COLORS = ['#e74c5a', '#f5a623'];

export default function IndicatorSection({
  title,
  description,
  indicators,
  data,
  countries = [],
  countryMetadata = [],
  isLoading = false,
  sectionColor = '#3b4d8f'
}) {
  const isComparing = countries.length > 1;

  const getCountryLabel = (code) => {
    const item = countryMetadata.find((c) => c.code === code);
    return getDisplayLabel(code, item?.label || code);
  };
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

          const series = isComparing
            ? countries.map((code, i) => ({
                code,
                label: getCountryLabel(code),
                color: i === 0 ? sectionColor : COMPARISON_COLORS[(i - 1) % COMPARISON_COLORS.length],
                data: indicatorData.filter((item) => item.country === code),
              }))
            : undefined;

          return (
            <Col key={indicator.code} lg={4} md={6}>
              <IndicatorCard
                title={indicator.title}
                unit={indicator.unit}
                data={indicatorData}
                series={series}
                icon={indicator.icon}
                color={sectionColor}
                isLoading={isLoading}
                capAt100={indicator.capAt100}
              />
            </Col>
          );
        })}
        </Row>
      </div>
    </div>
  );
}
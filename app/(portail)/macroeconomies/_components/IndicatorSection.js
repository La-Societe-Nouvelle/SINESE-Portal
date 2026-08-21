"use client";

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import IndicatorCard from './IndicatorCard';
import { getDisplayLabel } from '../_utils/labels';
import metaIndics from '@/_libs/indics';

// Couleurs additionnelles pour les pays comparés au-delà du premier (qui garde
// la couleur propre à l'indicateur pour rester cohérent avec le reste de la page).
// Choisies hors des teintes déjà utilisées par les indicateurs (rouge/orange/brun/jaune,
// vert, cyan/teal, bleu marine, magenta/rose) : violet indigo + gris neutre.
const COMPARISON_COLORS = ['#7c3aed', '#64748b'];

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

  return (
    <div className="indicator-section">
      {/* En-tête de section */}
      <div className="section-header">
        <h2 className="section-title">
          {title}
        </h2>
        <p className="section-description">{description}</p>
      </div>

      {/* Grille d'indicateurs */}
      <div className="indicators-grid">
        <Row className="g-4">
        {indicators.map((indicator) => {
          const indicatorData = data?.filter((item) => item.indic === indicator.code) || [];
          const indicatorColor = metaIndics[indicator.code]?.color?.main || sectionColor;

          const series = isComparing
            ? countries.map((code, i) => ({
                code,
                label: getCountryLabel(code),
                color: i === 0 ? indicatorColor : COMPARISON_COLORS[(i - 1) % COMPARISON_COLORS.length],
                data: indicatorData.filter((item) => item.country === code),
              }))
            : undefined;

          return (
            <Col key={indicator.code} lg={4} md={6}>
              <IndicatorCard
                code={indicator.code}
                title={indicator.title}
                unit={indicator.unit}
                data={indicatorData}
                series={series}
                color={indicatorColor}
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
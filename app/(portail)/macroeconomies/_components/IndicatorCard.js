"use client";

import { LineChart } from '@/_components/charts/LineChart';
import React from 'react';
import { Card, Image } from 'react-bootstrap';

export default function IndicatorCard({
  code,
  title,
  unit,
  data,
  series,
  color = '#3b4d8f',
  isLoading = false,
  capAt100 = false
}) {
  const hasData = series ? series.some((s) => s.data && s.data.length > 0) : data && data.length > 0;
  return (
    <Card className="h-100 indicator-card"
    >
      <Card.Body className="p-4">
        {/* Header avec picto, titre et unité */}
        <div className="indicator-header">
          <div className="d-flex align-items-center mb-2">
            <div className="indicator-icon me-2">
              <Image
                width="28"
                height="28"
                src={`/ESE/picto/ese-${code.toLowerCase()}-color.svg`}
                alt={code}
              />
            </div>
            <h5 className="indicator-title mb-0">
              {title}
            </h5>
          </div>
          <p className="indicator-unit">{unit}</p>
        </div>

        {/* Graphique */}
        <div className="chart-container">
          {isLoading ? (
            <div className="chart-loading">
              <div className="loading-content">
                <div 
                  className="spinner-border spinner-border-sm" 
                  style={{ color: color }}
                >
                </div>
                <div className="loading-text">Chargement...</div>
              </div>
            </div>
          ) : hasData ? (
            <div className="chart-wrapper">
              <LineChart series={series} data={data} color={color} unit={unit} capAt100={capAt100} />
            </div>
          ) : (
            <div className="chart-empty">
              <div className="empty-content">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="empty-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <div className="empty-text">Aucune donnée disponible</div>
              </div>
            </div>
          )}
        </div>

   
      </Card.Body>
    </Card>
  );
}
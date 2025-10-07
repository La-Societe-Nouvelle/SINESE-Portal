"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart } from '../../../_components/charts/LineChart';

export default function IndicatorCard({ 
  title, 
  unit, 
  data, 
  icon,
  color = '#3b4d8f',
  isLoading = false 
}) {
  return (
    <Card className="h-100 indicator-card"
    >
      <Card.Body className="p-4">
        {/* Header avec titre et unité */}
        <div className="indicator-header">
          <h5 className="indicator-title">
            {title}
          </h5>
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
          ) : data && data.length > 0 ? (
            <div className="chart-wrapper">
              <LineChart data={data} color={color} unit={unit} />
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
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
  const defaultIcon = (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="me-3">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  return (
    <div 
      className="page-header py-5"
      style={{
        background: 'linear-gradient(135deg, #3b4d8f 0%, #6c7fdd 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
   
      
      <Container className="position-relative">
        {hasBreadcrumbs && (
          <nav className="mb-3" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            <a href="/" className="text-white text-decoration-none me-2">
              Accueil
            </a>
            <span className="me-2">›</span>
            <span className="fw-medium">{title}</span>
          </nav>
        )}
        
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-inline-flex align-items-center justify-content-center me-4"
            style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          >
            {icon || defaultIcon}
          </div>
          <div>
            <h1 className="mb-2 fw-bold" style={{ fontSize: '2.5rem' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mb-0 fs-5" style={{ opacity: 0.9 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
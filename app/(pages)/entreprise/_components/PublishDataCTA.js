"use client";

import { Building } from "lucide-react";

export default function PublishDataCTA({ hasDefaultData }) {
  if (!hasDefaultData) return null;

  return (
    <div className="my-5">
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)',
        borderRadius: '0.75rem',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(231, 76, 90, 0.15)'
      }}>
        {/* Illustration SVG en arrière-plan */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>
          <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
            {/* Ruban */}
            <path d="M30 20 L70 20 L65 50 L50 45 L35 50 Z" fill="#6c7fdd" />

            {/* Médaille */}
            <circle cx="50" cy="70" r="25" fill="#e74c5a" stroke="#3b4d8f"
              strokeWidth="3" />
            <circle cx="50" cy="70" r="18" fill="#3b4d8f" />

            {/* Symbole central */}
            <rect x="45" y="60" width="10" height="20" fill="white" rx="2" />
            <rect x="40" y="65" width="20" height="10" fill="white" rx="2" />

            {/* Étoiles */}
            <path d="M25 50 L27 55 L32 55 L28 58 L30 63 L25 60 L20 63 L22 58 L18 55       
  L23 55 Z" fill="#e74c5a" />
            <path d="M75 50 L77 55 L82 55 L78 58 L80 63 L75 60 L70 63 L72 58 L68 55       
  L73 55 Z" fill="#e74c5a" />
          </svg>
        </div>

        <div className="row align-items-center position-relative">
          <div className="col-md-9 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div
                  className="rounded d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#e74c5a20',
                    color: '#e74c5a'
                  }}
                >
                  <Building />
                </div>
              </div>
              <div>
                <h5 className="text-primary mb-2 fw-bold">Dirigeant d'entreprise ?</h5>
                <p className="text-muted mb-0">
                  <strong>Démarquez-vous avec des données précises !</strong> Publiez votre véritable
                  empreinte sociétale pour remplacer les estimations sectorielles, renforcer votre
                  crédibilité et démontrer votre engagement responsable face à la concurrence.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 text-md-end">
            <button
              className="btn btn-secondary d-flex align-items-center justify-content-center px-4 py-3"
              onClick={() => window.open('https://lasocietenouvelle.org/publier-empreinte', '_blank')}
              style={{
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 3px 12px rgba(231, 76, 90, 0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 20px rgba(231, 76, 90, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 3px 12px rgba(231, 76, 90, 0.3)';
              }}
            >
              Publier mes données
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="ms-2">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Building } from "lucide-react";

export default function PublishDataCTA() {

  return (
    <div >
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
                  <strong>Valorisez votre performance extra-financière !</strong> Publiez vos données réelles
                  pour remplacer les estimations sectorielles et gagner en transparence. Vos données seront
                  visibles sur SINESE, accessibles via l'API publique, et renforceront votre relation clients.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 text-md-end">
            <button
              className="btn btn-secondary d-flex align-items-center justify-content-center px-4 py-3"
              onClick={() => window.open('https://publication.sinese.fr/', '_blank')}
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
     
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
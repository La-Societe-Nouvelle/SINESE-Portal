"use client";

import { Building2, TrendingUp } from "lucide-react";

export default function LoadingState({ siren }) {
  return (
    <div className="loading-state-container">
      <div className="loading-state-card">
        <div className="loading-header">
          <div className="loading-icon">
            <Building2 size={32} className="text-primary" />
          </div>
          <h2 className="loading-title">
            Empreinte Sociétale 
            <br />
            <span className="enterprise-siren">Entreprise #{siren}</span>
          </h2>
        </div>
        
        <div className="loading-content">
          <div className="modern-spinner">
            <div className="spinner-ring"></div>
            <TrendingUp size={24} className="spinner-icon" />
          </div>
          <p className="loading-text">Récupération des données en cours...</p>
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
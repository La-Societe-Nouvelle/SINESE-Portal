"use client";

import { useState } from "react";
import { Button, Badge, Form } from "react-bootstrap";
import CustomSelect from "@/_components/forms/CustomSelect";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSelector from "@/_components/forms/DepartementSelector";
import indicsData from "@/_libs/indics.json";
import { EFFECTIF_OPTIONS } from "@/_utils/effectifMapping";

const effectifOptions = EFFECTIF_OPTIONS;

// Générer les options d'indicateurs à partir du fichier JSON
const indicateursOptions = Object.entries(indicsData)
  .filter(([code, indic]) => indic.inEmpreinteSocietale === true)
  .map(([code, indic]) => ({
    value: code,
    label: indic.libelle
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function SearchFilters({ query, filters, setFilters }) {
  const [nafSidebarOpen, setNafSidebarOpen] = useState(false);
  const resetFilters = () => {
    setFilters({
      secteur: "", 
      sectors: [], 
      departements: [], 
      trancheEffectifs: "", 
      formeJuridique: "", 
      sortBy: "pertinence",
      economieSocialeSolidaire: false, 
      societeMission: false, 
      activitePrincipaleArtisanale: false,
      activitePrincipaleFormationRecherche: false, 
      donneesPubliees: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(f => f && f !== "pertinence") || query;

  return (
    <div className="col-lg-3 bg-light border-end p-0 ">
      <div className="filters-sidebar">

        
        <div className="p-3">
          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="fw-semibold text-muted">FILTRES ACTIFS</small>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-danger p-0"
                  onClick={resetFilters}
                >
                  Tout effacer
                </Button>
              </div>
              
              {/* Active filter badges */}
              {query && (
                <Badge bg="primary" className="me-1 mb-1">
                  "{query}"
                </Badge>
              )}
              {filters.secteur && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.secteur}
                </Badge>
              )}
              {filters.sectors.length > 0 && (
                <Badge bg="primary" className="me-1 mb-1">
                  Activité{filters.sectors.length > 1 ? 's' : ''} 
                </Badge>
              )}
              {filters.departements.length > 0 && (
                <Badge bg="info" className="me-1 mb-1">
                  {filters.departements.length} département{filters.departements.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.trancheEffectifs && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.trancheEffectifs} salariés
                </Badge>
              )}
              {filters.formeJuridique && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.formeJuridique}
                </Badge>
              )}
              {filters.economieSocialeSolidaire && (
                <Badge bg="success" className="me-1 mb-1">ESS</Badge>
              )}
              {filters.societeMission && (
                <Badge bg="success" className="me-1 mb-1">Société à mission</Badge>
              )}
              {filters.activitePrincipaleArtisanale && (
                <Badge bg="info" className="me-1 mb-1">Artisanale</Badge>
              )}
              {filters.activitePrincipaleExtractive && (
                <Badge bg="info" className="me-1 mb-1">Extractive</Badge>
              )}
              {filters.activitePrincipaleFormationRecherche && (
                <Badge bg="info" className="me-1 mb-1">Formation/Recherche</Badge>
              )}
              {filters.donneesPubliees.length > 0 && 
                filters.donneesPubliees.map(code => (
                  <Badge key={code} bg="primary" className="me-1 mb-1">
                   {code}
                  </Badge>
                ))
              }
            </div>
          )}

          {/* Secteurs d'activité  */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Activité</label>
            <NafTrigger
              selectedCodes={filters.sectors}
              onToggle={() => setNafSidebarOpen(true)}
            />

          </div>

          {/* Départements Filter */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Départements</label>
            <DepartementSelector
              selectedDepartements={filters.departements}
              onChange={(selectedDepartements) => setFilters({...filters, departements: selectedDepartements})}
              placeholder="Sélectionnez des départements..."
              instanceId="select-departements"
            />

          </div>

          {/* Effectif Filter */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Effectif</label>
            <CustomSelect
              instanceId="select-trancheEffectifs"
              size="small"
              options={effectifOptions}
              value={effectifOptions.find(option => option.value === filters.trancheEffectifs) || null}
              onChange={(selectedOption) => setFilters({...filters, trancheEffectifs: selectedOption ? selectedOption.value : ""})}
              placeholder="Tous les effectifs"
              isClearable={true}
            />
          </div>

          {/* Données publiées */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Données publiées</label>
            <CustomSelect
              instanceId="select-donnees-publiees"
              isMulti={true}
              size="small"
              variant="warning"
              options={indicateursOptions}
              value={indicateursOptions.filter(option => filters.donneesPubliees.includes(option.value))}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                setFilters({...filters, donneesPubliees: selectedValues});
              }}
              placeholder="Sélectionnez des indicateurs..."
              isClearable={true}
            />

          </div>

          {/* Divider */}
          <hr className="my-4" />

          {/* Filtres Bonus */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted">Autres critères</label>
            
            <div className="bonus-filters">
              {/* ESS */}
              <Form.Check 
                type="checkbox"
                id="filter-ess"
                label="Économie Sociale et Solidaire (ESS)"
                checked={filters.economieSocialeSolidaire}
                onChange={(e) => setFilters({...filters, economieSocialeSolidaire: e.target.checked})}
                className="mb-2"
              />

              {/* Société à mission */}
              <Form.Check 
                type="checkbox"
                id="filter-mission"
                label="Société à mission"
                checked={filters.societeMission}
                onChange={(e) => setFilters({...filters, societeMission: e.target.checked})}
                className="mb-2"
              />

              {/* Activité artisanale */}
              <Form.Check 
                type="checkbox"
                id="filter-artisanale"
                label="Activité principale artisanale"
                checked={filters.activitePrincipaleArtisanale}
                onChange={(e) => setFilters({...filters, activitePrincipaleArtisanale: e.target.checked})}
                className="mb-2"
              />

              {/* Activité extractive */}
              <Form.Check 
                type="checkbox"
                id="filter-extractive"
                label="Activité principale extractive"
                checked={filters.activitePrincipaleExtractive}
                onChange={(e) => setFilters({...filters, activitePrincipaleExtractive: e.target.checked})}
                className="mb-2"
              />

              {/* Formation/Recherche */}
              <Form.Check 
                type="checkbox"
                id="filter-formation"
                label="Formation et recherche"
                checked={filters.activitePrincipaleFormationRecherche}
                onChange={(e) => setFilters({...filters, activitePrincipaleFormationRecherche: e.target.checked})}
                className="mb-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar NAF */}
      <NafSidebarSelector
        selectedCodes={filters.sectors}
        onChange={(selectedCodes) => setFilters({...filters, sectors: selectedCodes})}
        isOpen={nafSidebarOpen}
        onToggle={() => setNafSidebarOpen(false)}
      />
    </div>
  );
}
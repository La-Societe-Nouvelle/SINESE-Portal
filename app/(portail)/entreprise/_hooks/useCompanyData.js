"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sinese.fr';

export function useCompanyData(siren) {
  const [data, setData] = useState({
    legalUnit: null,
    footprint: null,
    additionnalData: null,
    divisionFootprint: null,
    historicalDivisionFootprint: null,
    meta: null,
    publishedReport: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLegalUnitFootprint = useCallback(async (siren) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/v2/legalunitfootprint/${siren}`);
      const response = await res.json();

      if (res.ok && response.data) {
        setData(prev => ({
          ...prev,
          legalUnit: response.data.legalUnit,
          footprint: response.data.footprint,
          additionnalData: response.data.additionnalData,
          meta: response.data.metadata || response.meta
        }));
        return response.data.legalUnit;
      } else {
        setError(response.error || { code: res.status, message: res.statusText });
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError({ code: 500, message: "Erreur lors du chargement des données de l'entreprise" });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDivisionFootprint = useCallback(async (code) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/v2/defaultfootprint?code=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();

      if (res.ok && response.data) {
        setData(prev => ({
          ...prev,
          divisionFootprint: response.data.footprint
        }));
      } else {
        console.error('Erreur division footprint:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données sectorielles:', error);
    }
  }, []);

  const fetchHistoricalDivisionFootprint = useCallback(async (code) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/v2/macrodata/macro_fpt_a88?division=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();

      if (res.ok && response.data) {
        let divisionFootprints = {};
        const dataArray = Array.isArray(response.data) ? response.data : [];
        dataArray.forEach((element) => {
          const indic = element.indic;
          if (!divisionFootprints[indic]) {
            divisionFootprints[indic] = [];
          }
          divisionFootprints[indic].push(element);
        });

        setData(prev => ({
          ...prev,
          historicalDivisionFootprint: divisionFootprints
        }));
      } else {
        console.error('Erreur données historiques:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques:', error);
    }
  }, []);

  const fetchPublishedDocuments = useCallback(async (siren) => {
    try {
      const res = await fetch(`/api/portail/reports/${siren}`);
      const response = await res.json();

      if (response.hasPublishedDocuments) {
        setData(prev => ({
          ...prev,
          publishedReport: response
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports publiés:', error);
    }
  }, []);

  useEffect(() => {
    if (siren) {
      // Récupérer les empreintes de l'unité légale depuis l'API externe
      fetchLegalUnitFootprint(siren).then((legalUnit) => {
        if (legalUnit) {
          const code = legalUnit.activitePrincipaleCode?.slice(0, 2);
          if (code) {
            fetchDivisionFootprint(code);
            //fetchHistoricalDivisionFootprint(code);
          }
        }
      });

      // Récupérer les documents publiés depuis notre BDD (parallèle)
      fetchPublishedDocuments(siren);
    }
  }, [siren, fetchLegalUnitFootprint, fetchDivisionFootprint, fetchPublishedDocuments]);

  // Calcul des données par défaut
  const hasDefaultData = data.footprint &&
    ["ECO", "ART", "SOC", "IDR", "GEQ", "KNW", "GHG", "NRG", "WAT", "MAT", "WAS", "HAZ"].some(
      (indic) => data.footprint[indic]?.flag === "d"
    );

  const isDataReady = !loading && !error && data.footprint && data.divisionFootprint && data.meta && data.legalUnit;

  return {
    ...data,
    loading,
    error,
    hasDefaultData,
    isDataReady,
    retry: () => fetchLegalUnitFootprint(siren)
  };
}

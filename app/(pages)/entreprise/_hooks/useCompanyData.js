"use client";

import { useState, useEffect, useCallback } from "react";

export function useCompanyData(siren) {
  const [data, setData] = useState({
    legalUnit: null,
    footprint: null,
    additionnalData: null,
    divisionFootprint: null,
    historicalDivisionFootprint: null,
    meta: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLegalUnitFootprint = useCallback(async (siren) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const res = await fetch(`${apiUrl}/legalunitFootprint/${siren}`);
      const response = await res.json();
      
      if (response.header?.code === 200) {
        setData(prev => ({
          ...prev,
          legalUnit: response.legalUnit,
          footprint: response.footprint,
          additionnalData: response.additionnalData,
          meta: response.metaData
        }));
        return response.legalUnit;
      } else {
        setError(response.header);
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
        `${process.env.NEXT_PUBLIC_API_URL}/defaultfootprint/?code=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();
      
      if (response.header?.code === 200) {
        setData(prev => ({
          ...prev,
          divisionFootprint: response.footprint
        }));
      } else {
        console.error('Erreur division footprint:', response.header);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données sectorielles:', error);
    }
  }, []);

  const fetchHistoricalDivisionFootprint = useCallback(async (code) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.lasocietenouvelle.org'}/macrodata/macro_fpt_a88?division=${code}&aggregate=PRD&area=FRA`
      );
      const response = await res.json();
        console.log(response);
      if (response.header?.code === 200) {
        let divisionFootprints = {};
        response.data.forEach((element) => {
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
        console.error('Erreur données historiques:', response.header);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques:', error);
    }
  }, []);

  useEffect(() => {
    if (siren) {
      fetchLegalUnitFootprint(siren).then((legalUnit) => {
        if (legalUnit) {
          const code = legalUnit.activitePrincipaleCode?.slice(0, 2);
          if (code) {
            fetchDivisionFootprint(code);
            //fetchHistoricalDivisionFootprint(code);
          }
        }
      });
    }
  }, [siren, fetchLegalUnitFootprint, fetchDivisionFootprint]);

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
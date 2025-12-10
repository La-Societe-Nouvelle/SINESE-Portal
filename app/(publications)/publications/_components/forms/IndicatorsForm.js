"use client";
import { Accordion } from "react-bootstrap";
import IndicatorForm from "./IndicatorForm";
import { useState } from "react";
import indicators from "./../../_lib/indicators.json";
import { isIndicatorComplete, isIndicatorInvalid } from "../../_utils";
import { AlertCircle,  CheckCircle2 } from "lucide-react";

export default function IndicatorsForm({ data = {}, onChange, categories, errors }) {
  // Filtre selon une ou plusieurs catégories
  const items = Object.entries(indicators)
    .filter(([_, val]) => (Array.isArray(categories) ? categories.includes(val.category) : val.category === categories))
    .map(([key, val]) => ({ ...val, name: key }));

  const openKeys = items
    .map((indicator, idx) => {
      const hasValue = data[indicator.name]?.value !== undefined && data[indicator.name]?.value !== "";
      return hasValue ? String(idx) : null;
    })
    .filter((k) => k !== null);

  const [activeKey, setActiveKey] = useState(openKeys);

  return (
    <Accordion activeKey={activeKey} onSelect={setActiveKey} alwaysOpen className="indicators-accordion">
      {items.map((indicator, idx) => {
        const complete = isIndicatorComplete(indicator, data);
        const invalid = isIndicatorInvalid(indicator, data);

        const borderColor = indicator.color || "#dee2e6";
        return (
          <Accordion.Item
            eventKey={String(idx)}
            key={indicator.name}
            className="indicator-item"
            style={{
              borderLeft: `4px solid ${borderColor}`,
            }}
          >
            <Accordion.Header className="indicator-header">
              <div className="indicator-header-content">
                <div className="indicator-label-wrapper">
                  <span className="indicator-label">{indicator.libelle}</span>
                  <span className="indicator-unit">{indicator.unit && `[${indicator.unit}]`}</span>
                     {invalid && errors && (errors.formEmpreinte || errors.formExtraIndic) && (
                    <span className="status-icon error" title="Indicateur incomplet ou invalide">
                      <AlertCircle size={18} />
                    </span>
                  )}
                  {complete && (
                    <span className="status-icon success" title="Complété">
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>
                <div className="indicator-status-icons">
               
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <IndicatorForm
                name={indicator.name}
                unit={indicator.unit}
                url={indicator.docUrl}
                category={indicator.category}
                nbDecimals={indicator.nbDecimals}
                data={data}
                onChange={onChange}
              />
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

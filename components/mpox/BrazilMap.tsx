"use client";

import { useState } from "react";
import { BRAZIL_STATES_GEO, type StateGeoFeature } from "@/lib/brazil-map-data";

interface BrazilMapProps {
  stateValues: Record<string, number>;
  maxValue: number;
  selectedState: string;
  onSelectState: (sigla: string) => void;
}

function getFillColor(value: number, maxValue: number, isSelected: boolean, isHovered: boolean) {
  if (isSelected) return "#38bdf8"; // Sky blue highlight for selection
  if (value === 0) return isHovered ? "#334155" : "#1e293b";

  const ratio = Math.min(1, Math.max(0.15, value / (maxValue || 1)));

  // Gradient from amber/orange to vivid red
  if (ratio > 0.75) return isHovered ? "#f87171" : "#ef4444";
  if (ratio > 0.4) return isHovered ? "#fb923c" : "#f97316";
  if (ratio > 0.15) return isHovered ? "#fbbf24" : "#f59e0b";
  return isHovered ? "#fde047" : "#eab308";
}

export function BrazilMap({ stateValues, maxValue, selectedState, onSelectState }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<StateGeoFeature | null>(null);

  const totalNational = Object.values(stateValues).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="brazil-map-wrapper">
      <div className="brazil-map-svg-container">
        <svg
          viewBox="0 0 600 600"
          className="brazil-map-svg"
          role="img"
          aria-label="Mapa do Brasil com distribuição de casos de mpox"
        >
          <defs>
            <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.4" />
            </filter>
          </defs>

          {BRAZIL_STATES_GEO.map((state) => {
            const val = stateValues[state.sigla] ?? 0;
            const isSelected = selectedState === state.sigla;
            const isHovered = hoveredState?.sigla === state.sigla;
            const fill = getFillColor(val, maxValue, isSelected, isHovered);

            return (
              <g
                key={state.sigla}
                className={`state-group ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
                onClick={() => onSelectState(selectedState === state.sigla ? "Todos" : state.sigla)}
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={state.path}
                  fill={fill}
                  stroke={isSelected ? "#ffffff" : isHovered ? "#94a3b8" : "#334155"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 1}
                  strokeLinejoin="round"
                  filter={isSelected ? "url(#map-glow)" : undefined}
                  className="state-path"
                />
                {/* State UF label */}
                <text
                  x={state.centroid[0]}
                  y={state.centroid[1]}
                  className="state-label"
                  textAnchor="middle"
                  dominantBaseline="central"
                  pointerEvents="none"
                  fill={val > 0 || isSelected ? "#ffffff" : "#64748b"}
                  fontSize={isSelected ? "11" : "9.5"}
                  fontWeight={isSelected || val > 0 ? "700" : "500"}
                >
                  {state.sigla}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip on hover */}
        {hoveredState && (
          <div className="map-tooltip">
            <strong>{hoveredState.name} ({hoveredState.sigla})</strong>
            <span className="tooltip-region">Região {hoveredState.region}</span>
            <div className="tooltip-value">
              <span>Casos confirmados:</span>
              <b>{new Intl.NumberFormat("pt-BR").format(stateValues[hoveredState.sigla] ?? 0)}</b>
            </div>
            {totalNational > 0 && (
              <small className="tooltip-share">
                {(((stateValues[hoveredState.sigla] ?? 0) / totalNational) * 100).toFixed(1)}% do total do país
              </small>
            )}
            <small className="tooltip-hint">Clique para filtrar</small>
          </div>
        )}
      </div>

      <div className="map-legend-box">
        <div className="legend-gradient-row">
          <span className="legend-label">0 casos</span>
          <div className="legend-bar-gradient" />
          <span className="legend-label">+{new Intl.NumberFormat("pt-BR").format(maxValue)} casos</span>
        </div>
        <div className="legend-instructions">
          <span>Dica: clique em um estado no mapa para ver seus municípios e detalhes.</span>
        </div>
      </div>
    </div>
  );
}

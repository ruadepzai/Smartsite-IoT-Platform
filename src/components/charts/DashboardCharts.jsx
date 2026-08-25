// Reusable Interactive High-Tech SVG Chart Components for SmartSite Admin Console
// File: src/components/charts/DashboardCharts.jsx
import React, { useState } from 'react';
import { Typography, Tooltip } from 'antd';
import { useTheme } from '../../theme/ThemeContext';

const { Text } = Typography;

/**
 * 1. AreaLineChart: Biểu đồ đường cong diện tích đa chỉ số với gradient và interactive hover
 */
export function AreaLineChart({
  data = [],
  xKey = 'time',
  lines = null,
  yKey = 'throughput',
  secondaryYKey = 'wsConnections',
  color = '#0B72E7',
  secondaryColor = '#10B981',
  height = 260,
  unit = 'sự cố',
  secondaryUnit = 'sự cố',
  metricLabel = 'Throughput',
  secondaryMetricLabel = 'Kết nối WebSocket',
}) {
  const { isDark } = useTheme();
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return null;

  // Chuẩn hóa danh sách các đường cần vẽ
  const activeLines = lines && lines.length > 0 ? lines : [
    { key: yKey, name: metricLabel, color: color, unit: unit },
    ...(secondaryYKey ? [{ key: secondaryYKey, name: secondaryMetricLabel, color: secondaryColor, unit: secondaryUnit, dashed: true }] : []),
  ];

  const padding = { top: 25, right: 25, bottom: 40, left: 50 };
  const width = 850;
  const svgHeight = height;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Max value calculation across all lines
  const allValues = data.flatMap((d) => activeLines.map((l) => Number(d[l.key]) || 0));
  const rawMax = Math.max(...allValues, 6);
  const maxY = Math.ceil(rawMax * 1.25);

  // Coordinate mappings
  const getX = (index) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (val) => padding.top + chartHeight - ((Number(val) || 0) / (maxY || 1)) * chartHeight;

  const gridLineColor = isDark ? '#1E293B' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${svgHeight}`}
        style={{ width: '100%', height: height, overflow: 'visible' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {activeLines.map((l, idx) => (
            <linearGradient key={l.key || idx} id={`areaGrad_${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const val = Math.round(maxY * ratio);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={gridLineColor}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill={textColor}
                fontSize={11}
                fontFamily="inherit"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill for the first line */}
        {activeLines.length > 0 && (() => {
          const firstLine = activeLines[0];
          const pts = data.map((d, i) => `${getX(i)},${getY(d[firstLine.key])}`);
          const areaPath = `M ${pts.join(' L ')} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`;
          return <path d={areaPath} fill={`url(#areaGrad_${firstLine.key})`} />;
        })()}

        {/* Lines */}
        {activeLines.map((l, idx) => {
          const pts = data.map((d, i) => `${getX(i)},${getY(d[l.key])}`);
          const linePath = `M ${pts.join(' L ')}`;
          return (
            <path
              key={l.key || idx}
              d={linePath}
              fill="none"
              stroke={l.color}
              strokeWidth={idx === 0 ? 3 : 2.2}
              strokeDasharray={l.dashed ? '5 5' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* X-axis labels & vertical hover lines */}
        {data.map((d, i) => {
          const x = getX(i);
          const isHovered = hoverIndex === i;

          return (
            <g key={i} onMouseEnter={() => setHoverIndex(i)} style={{ cursor: 'pointer' }}>
              {/* Transparent hover capture rect */}
              <rect
                x={x - chartWidth / (data.length * 2)}
                y={padding.top}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
              />

              {/* X label */}
              <text
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill={isHovered ? (activeLines[0]?.color || '#0B72E7') : textColor}
                fontSize={11}
                fontWeight={isHovered ? 700 : 400}
                fontFamily="inherit"
              >
                {d[xKey]}
              </text>

              {/* Hover crosshair line and interactive dots */}
              {isHovered && (
                <>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke={activeLines[0]?.color || '#0B72E7'}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  {activeLines.map((l, lIdx) => (
                    <circle
                      key={lIdx}
                      cx={x}
                      cy={getY(d[l.key])}
                      r={5}
                      fill={l.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip Box */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: `${Math.min(75, Math.max(15, (hoverIndex / (data.length - 1 || 1)) * 100))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
            borderRadius: 8,
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: 12,
            minWidth: 190,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: isDark ? '#F1F5F9' : '#0F172A', borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`, paddingBottom: 4 }}>
            Mốc: {data[hoverIndex][xKey]}
          </div>
          {activeLines.map((l, lIdx) => (
            <div
              key={lIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                color: l.color,
                fontWeight: 600,
                marginTop: lIdx > 0 ? 4 : 0,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: l.color, flexShrink: 0 }} />
                <span>{l.name}:</span>
              </span>
              <span>{data[hoverIndex][l.key]?.toLocaleString()} {l.unit || unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 2. RevenueBarChart: Biểu đồ cột doanh thu 12 tháng
 */
export function RevenueBarChart({
  data = [],
  xKey = 'month',
  yKey = 'revenue',
  height = 250,
}) {
  const { isDark } = useTheme();
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 35, left: 55 };
  const width = 800;
  const svgHeight = height;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d[yKey] || 0), 10) * 1.2;
  const barWidth = (chartWidth / data.length) * 0.55;

  const gridLineColor = isDark ? '#1E293B' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${svgHeight}`}
        style={{ width: '100%', height: height, overflow: 'visible' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#0B72E7" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const val = Math.round(maxVal * ratio);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={gridLineColor}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={textColor}
                fontSize={11}
                fontFamily="inherit"
              >
                {val} tr ₫
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const val = d[yKey] || 0;
          const barH = (val / maxVal) * chartHeight;
          const x = padding.left + (i + 0.5) * (chartWidth / data.length) - barWidth / 2;
          const y = padding.top + chartHeight - barH;
          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill={isHovered ? '#60A5FA' : 'url(#barGradient)'}
                style={{ transition: 'all 0.2s' }}
              />
              <text
                x={x + barWidth / 2}
                y={svgHeight - 10}
                textAnchor="middle"
                fill={isHovered ? '#0B72E7' : textColor}
                fontSize={11}
                fontWeight={isHovered ? 600 : 400}
                fontFamily="inherit"
              >
                {d[xKey]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${Math.min(75, Math.max(10, ((hoverIndex + 0.5) / data.length) * 100))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: 12,
            minWidth: 140,
          }}
        >
          <div style={{ fontWeight: 600, color: isDark ? '#F1F5F9' : '#0F172A' }}>
            Tháng {data[hoverIndex][xKey]}
          </div>
          <div style={{ color: '#0B72E7', fontWeight: 600, marginTop: 4 }}>
            MRR: {data[hoverIndex][yKey]} triệu VNĐ
          </div>
          {data[hoverIndex].contracts && (
            <div style={{ color: '#10B981', fontSize: 11, marginTop: 2 }}>
              Hợp đồng: {data[hoverIndex].contracts} đối tác
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 3. Sparkline: Mini inline trend
 */
export function Sparkline({ data = [20, 35, 30, 45, 60, 55, 70, 65, 80], color = '#0B72E7', height = 36, width = 90 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * (width - 6) + 3;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {(() => {
        const lastVal = data[data.length - 1];
        const lastX = width - 3;
        const lastY = height - ((lastVal - min) / range) * (height - 8) - 4;
        return <circle cx={lastX} cy={lastY} r={3.5} fill={color} />;
      })()}
    </svg>
  );
}

/**
 * 4. DonutBreakdownChart: Biểu đồ tròn cơ cấu gói cước & giao thức IoT
 */
export function DonutBreakdownChart({
  data = [],
  totalLabel = 'Tổng cộng',
  centerText,
  centerValue,
  size = 160,
}) {
  const { isDark } = useTheme();
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const displayLabel = centerText || totalLabel || 'Tổng cộng';
  const displayValue = centerValue !== undefined ? centerValue : '100%';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isDark ? '#1E293B' : '#F1F5F9'}
            strokeWidth={strokeWidth}
          />
          {data.map((item, i) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 0.3s' }}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Text strong style={{ fontSize: 16, lineHeight: 1 }}>{displayValue}</Text>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>{displayLabel}</Text>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 260, flex: 1 }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{item.name}</span>
            </div>
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap', paddingLeft: 16 }}>
              {item.percentage}% {item.revenue ? `(${item.revenue})` : item.detail ? `(${item.detail})` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

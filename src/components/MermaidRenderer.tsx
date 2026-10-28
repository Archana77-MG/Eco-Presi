import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  id: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#030712',
        mainBkg: '#0b132b',
        textColor: '#f1f5f9',
        lineColor: '#38bdf8',
        primaryColor: '#1d4ed8',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#3b82f6',
        secondaryColor: '#0f172a',
        secondaryTextColor: '#e2e8f0',
        secondaryBorderColor: '#1e3a8a',
        tertiaryColor: '#020617',
        tertiaryTextColor: '#94a3b8',
        tertiaryBorderColor: '#1e293b',
      },
    });

    const renderChart = async () => {
      try {
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        setSvgHtml(svg);
        setError(null);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram.');
      }
    };

    renderChart();
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre">
        {chart}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto flex justify-center py-4 text-center [&>svg]:max-w-full [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};

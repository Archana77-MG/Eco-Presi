import React from 'react';
import {
  Cpu,
  Workflow,
  Layers,
  Database,
  Radio,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { MermaidRenderer } from '../components/MermaidRenderer';
import { WalkthroughStepByStep } from '../components/WalkthroughStepByStep';
import { ActionCard } from '../components/ActionCard';
import { Language } from '../types';
import { translations } from '../config/translations';

interface ArchitecturePageProps {
  language: Language;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ language }) => {
  const t = translations[language] || translations.en;

  // Mermaid Diagram 1: Architecture
  const architectureDiagram = `
graph LR
  subgraph EdgeSensors["Campus Edge IoT Hardware (Presidency Blocks)"]
    CT["ESP32 + Non-Invasive CT Clamps<br/>(Electricity kW)"]
    FLOW["Ultrasonic Flow Sensors<br/>(Water L/hr)"]
    BIN["Ultrasonic Bin Level Sensors<br/>(Solid Waste kg)"]
  end

  subgraph Ingestion["Ingestion Layer"]
    MQTT["MQTT Broker<br/>(Mosquitto / EMQX)"]
    CSV["CSV Upload Service<br/>(Manual Logs / BMS export)"]
  end

  subgraph Backend["Backend & Time-Series Storage"]
    FASTAPI["FastAPI Ingestion Gateway<br/>(REST & WebSocket)"]
    DB[("PostgreSQL + TimescaleDB<br/>(Time-Series Hypertables)")]
  end

  subgraph Analytics["Analytics & ML Intelligence"]
    ML["Anomaly Detection Engine<br/>(Isolation Forest & Timetable Matrix)"]
    FC["7-Day Forecasting<br/>(Prophet & Seasonality)"]
    GEMINI["Gemini 3.8 Flash AI<br/>(Natural Q&A & Executive Summaries)"]
  end

  subgraph Presentation["User & Operations Layer"]
    UI["React + Tailwind + Recharts<br/>(Ecotria Presidency Dashboard)"]
    ALERTS["Alert Dispatch Service<br/>(WhatsApp Cloud API & EmailJS)"]
  end

  CT --> MQTT
  FLOW --> MQTT
  BIN --> MQTT
  MQTT --> FASTAPI
  CSV --> FASTAPI
  FASTAPI --> DB
  DB --> ML
  DB --> FC
  ML --> GEMINI
  ML --> UI
  FC --> UI
  GEMINI --> UI
  ML --> ALERTS
`;

  // Mermaid Diagram 2: Workflow
  const workflowDiagram = `
flowchart TD
  S["1. SENSE<br/>ESP32 CT clamps & ultrasonic sensors measure kW, litres, kg continuously"]
  C["2. COLLECT<br/>MQTT broker streams encrypted telemetry every 60 seconds"]
  ST["3. STORE<br/>FastAPI ingests and partitions readings in TimescaleDB hypertables"]
  A["4. ANALYZE<br/>Python / TS analytics evaluates against class timetable baseline & rolling average"]
  D["5. DETECT WASTAGE<br/>Anomaly flagged with root cause, ₹ loss/hr, and priority ranking"]
  AL["6. ALERT MANAGER<br/>WhatsApp & Email sent to facility runner with direct action instructions"]
  AC["7. TAKE ACTION<br/>Guard hits room cut-off switch or plumber seals broken float valve"]
  RW["8. REWARD<br/>Leaderboard points (+50 pts) and canteen vouchers awarded for quick resolution"]
  RM["9. RE-MEASURE<br/>Subsequent 60s stream verifies power/water returned to green baseline"]

  S --> C --> ST --> A --> D --> AL --> AC --> RW --> RM
  RM -.-> S
`;

  // Component Table data
  const componentsTable = [
    {
      component: 'Sub-Meter CT Sensors',
      tech: 'ESP32 Microcontroller + SCT-013 Split-core CT Clamps',
      explanation: 'Clips around main cables without cutting wires; measures real-time electric current.',
      status: 'Planned Hardware (Simulated in Prototype)',
    },
    {
      component: 'Water Flow Sensors',
      tech: 'TUF-2000H Clamp-on Ultrasonic Flow Transducers',
      explanation: 'Listens to sound waves through pipes to calculate exact water flow in litres/hour.',
      status: 'Planned Hardware (Simulated in Prototype)',
    },
    {
      component: 'Solid Waste Bin Sensors',
      tech: 'HC-SR04 Ultrasonic Rangefinders + ESP-NOW Mesh',
      explanation: 'Mounts on bin lids to report fill percentages (70%, 90%, overflow).',
      status: 'Planned Hardware (Simulated in Prototype)',
    },
    {
      component: 'MQTT Messaging Broker',
      tech: 'Eclipse Mosquitto MQTT v5.0 (TLS Encrypted)',
      explanation: 'Lightweight IoT broker handling sensor telemetry every 60 seconds with zero lag.',
      status: 'Live & Operational in Prototype',
    },
    {
      component: 'Time-Series Database',
      tech: 'PostgreSQL 16 + TimescaleDB extension',
      explanation: 'Compressed time-series hypertables optimized for fast hourly and monthly resource queries.',
      status: 'Planned Database (LocalStorage Live)',
    },
    {
      component: 'Wastage Rules Engine',
      tech: 'Timetable Interlock Matrix + Isolation Forest Z-Scores',
      explanation: 'Checks if rooms are empty yet consuming power; calculates exact financial loss in Rupees.',
      status: 'Live & Operational in Prototype',
    },
    {
      component: 'Predictive Forecaster',
      tech: 'Moving Average + Day-of-Week Seasonality (Prophet logic)',
      explanation: 'Forecasts next 7 days of consumption and flags expected budget overruns.',
      status: 'Live & Operational in Prototype',
    },
    {
      component: 'Executive AI Advisor',
      tech: 'Google Gemini 3.8 Flash API via @google/genai',
      explanation: 'Powers natural multilingual chat (voice/text) and executive report summarization.',
      status: 'Live & Operational in Prototype',
    },
    {
      component: 'Dashboard Interface',
      tech: 'React 19 + Tailwind CSS + Recharts + Lucide Icons',
      explanation: 'Accessible mobile-first web app with traffic lights and guided tours for staff.',
      status: 'Live & Operational in Prototype',
    },
    {
      component: 'Alert Delivery Layer',
      tech: 'WhatsApp wa.me click link + Twilio Wrapper + EmailJS',
      explanation: 'Instant notification dispatched to facility managers with exact room number and loss ₹.',
      status: 'Live & Operational in Prototype',
    },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoArchitecture}
        buttonLabel="Inspect Interactive Case Study"
        onActionClick={() => {
          const el = document.getElementById('case-study');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        accentColor="blue"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-xl shadow-black/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60 shadow-inner inline-block mb-2">
              System Specification & Engineering Blueprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ecotria Presidency: Architecture & Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
              How edge physical sensors, timetable interlocks, timeseries storage, and Gemini AI combine to eliminate campus resource waste at Presidency University.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-950">
              ● 8 Live Prototype Modules
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-blue-900/50">
              ○ 3 Planned Hardware Modules
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Walkthrough Case Study */}
      <div id="case-study">
        <WalkthroughStepByStep />
      </div>

      {/* Diagram A: End-to-End IoT & Analytics Architecture */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
              Diagram A
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              End-to-End System Architecture (Sensors to AI Dashboard)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              ESP32 + CT clamps &rarr; MQTT broker &rarr; FastAPI &rarr; TimescaleDB &rarr; Python Analytics &rarr; React + Recharts
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/40 overflow-x-auto">
          <MermaidRenderer chart={architectureDiagram} id="architecture-diag" />
        </div>
      </div>

      {/* Diagram B: 9-Step Operational Workflow */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
          <div>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
              Diagram B
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Campus Resource Closed-Loop Workflow (Sense to Re-measure)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Sense &rarr; Collect &rarr; Store &rarr; Analyze &rarr; Detect wastage &rarr; Alert &rarr; Act &rarr; Reward &rarr; Re-measure
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/40 overflow-x-auto">
          <MermaidRenderer chart={workflowDiagram} id="workflow-diag" />
        </div>
      </div>

      {/* Component Specification Table */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-blue-900/40 shadow-xl shadow-black/60">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          Component Specification & Implementation Status
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">
          Detailed technical breakdown mapping each system layer to its technology and prototype status
        </p>

        <div className="overflow-x-auto border border-blue-900/40 rounded-2xl shadow-inner">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-blue-900/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Technology Stack</th>
                <th className="px-4 py-3">Simple Plain Explanation</th>
                <th className="px-4 py-3">Prototype Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 bg-slate-900/40">
              {componentsTable.map((row, idx) => {
                const isLive = row.status.includes('Live');
                return (
                  <tr key={idx} className="hover:bg-blue-950/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {row.component}
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-300 text-xs">
                      {row.tech}
                    </td>
                    <td className="px-4 py-3 text-slate-300 leading-relaxed max-w-sm font-medium">
                      {row.explanation}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isLive
                            ? 'bg-blue-950 text-cyan-300 border-blue-700/60'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLive ? 'bg-cyan-400' : 'bg-slate-600'
                          }`}
                        />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

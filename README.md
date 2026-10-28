# Ecotria Presidency 🌿
**Smart Campus Resource & Sustainability Analytics Platform**  
*Presidency University, Bengaluru (Itgalpura, Rajanukunte, Yelahanka, Karnataka 560064)*

Ecotria Presidency analyzes campus electricity, water, and solid waste telemetry across all 10 university blocks, identifies anomalies in real time, predicts wastage before it occurs, recommends measurable savings in Rupees (₹), and gamifies conservation with rewards and badges.

---

## Key Features

1. **Google SSO & Role-Based Access Control**:
   - Authorized domain emails configured in `/src/config/allowedUsers.ts` (`admin@presidencyuniversity.in`, `facility@gmail.com`).
   - Admin and Facility Manager roles.
   - Comprehensive audit logging under **Admin > Login Activity** tracking device, IP, and granted/denied status.

2. **Executive Resource Dashboard**:
   - 6 Live KPI Cards: Electricity (kWh), Water (L), Waste (kg), Rupee Wastage (₹), CO₂ Avoided (kg), and Campus Eco Score (0-100).
   - Dynamic Charts: 24-hr hourly load, block-by-block bar comparisons, 7-day rupee wastage trends, and timetable occupancy interlock (occupied vs empty).
   - "Top 3 problems right now" with one-click WhatsApp/Email alert dispatch.
   - Date filter: Today / Week / Month / Year.

3. **Campus Blocks & Facilities**:
   - 10 pre-loaded university zones: Academic Block A, Academic Block B, Academic Block C (Labs), Central Library, Hostel Boys, Hostel Girls, University Canteen, Admin Block, Sports Complex, and Auditorium.
   - Interactive visual campus map grid with traffic-light status (Green = Efficient, Amber = Attention, Red = Wasting).
   - CRUD management: Add, edit, and delete blocks with area (sq ft), room count, and meter IDs.
   - Deep-dive modal with 24-hour load curve and localized recommendations.

4. **Wastage Analysis & Tariff Engine**:
   - Editable utility billing rates: Electricity (₹8.0/kWh), Water (₹40.0/kL), Solid Waste (₹5.0/kg).
   - 5 Plain-Language Anomaly Rules:
     - a) Empty room burn (timetable schedule comparison)
     - b) Night / holiday excess above baseline
     - c) Sudden load spikes (z-score / statistical anomaly)
     - d) Continuous night water flow (active cistern / pipe leak)
     - e) Solid waste bin overflow vs normal threshold
   - Detailed breakdown cards: Where, When, What happened, Why it is a problem, ₹ lost, and Recommended fix.

5. **7-Day Predictive Forecasting & Action Plan**:
   - Moving average and day-of-week seasonality forecasting.
   - Anticipated budget overrun and expected extra cost calculations.
   - Measurable recommendations with effort rating (Easy/Medium/Hard) and payback period.
   - "Mark as done" action to log verified monthly savings.

6. **Rewards & Campus Gamification**:
   - Eco Points and streak tracker.
   - Weekly "Green Challenge" progress bar (e.g. Save 1,500 kWh).
   - Badges: Water Saver, Energy Hero, Zero-Waste Champion, Night Owl Saver, Green Guardian.
   - Rewards catalogue: Presidency Canteen vouchers, University Eco Certificate, digital noticeboard honor.
   - Quick-action "Report Wastage / Leak" form (+50 pts) with celebratory confetti.

7. **Alert Centre (WhatsApp & Email)**:
   - Configurable delivery parameters: Facility manager WhatsApp and Email, active channels, quiet hours (23:00 - 06:00).
   - Direct wa.me and mailto dispatch alongside delivery simulation and audit logging.

8. **Multilingual Support & Accessibility**:
   - Instant language switcher: **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिन्दी)**.
   - "What should I do now?" action card on every page for non-technical facility personnel.
   - 5-step guided tour onboarding.

9. **AI Chat Assistant (Presidency Eco AI)**:
   - Floating chat widget grounded on live university resource data.
   - Supports text typing and voice speech-to-text input.
   - Provides concise numbers and financial loss estimates in the selected language.

10. **System Architecture & Workflow**:
    - Interactive Mermaid diagrams for IoT ingestion and closed-loop operational workflows.
    - Animated case study walkthrough: "Classroom empty at 7 PM but fans and lights still on".
    - Clear distinction between live prototype modules and planned production hardware.

---

## Local Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Run fullstack development server (Express + Vite middlewares on Port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## Production Migration Guide (Hardware + FastAPI + TimescaleDB + MQTT)

In this prototype, telemetry is simulated and persisted in browser storage and server memory. To deploy onto physical campus infrastructure at Presidency University, follow these steps:

1. **Hardware Layer (CT Clamps & Flow Transducers)**:
   - Install SCT-013 split-core CT clamps on the main distribution boards of Block A, B, C, and Hostels.
   - Connect CT clamps to ESP32 ADC pins with voltage divider bias circuitry.
   - Install clamp-on ultrasonic transducers (TUF-2000H) on main rising water mains.
   - Program ESP32 to publish JSON telemetry via Wi-Fi to `mqtt.presidencyuniversity.in:1883` under topic `presidency/telemetry/{block_id}`.

2. **Ingestion & Database (MQTT to TimescaleDB)**:
   - Deploy Mosquitto / EMQX broker behind a campus VPC.
   - Implement an async Python consumer in FastAPI subscribing to the MQTT broker.
   - Create a TimescaleDB hypertable partitioned by `timestamp`:
     ```sql
     CREATE TABLE campus_readings (
       time TIMESTAMPTZ NOT NULL,
       block_id VARCHAR(32) NOT NULL,
       resource_type VARCHAR(16) NOT NULL,
       value DOUBLE PRECISION NOT NULL,
       unit VARCHAR(8) NOT NULL
     );
     SELECT create_hypertable('campus_readings', 'time');
     ```

3. **Analytics & Machine Learning (Python Workers)**:
   - Run Celery / Redis scheduled tasks to evaluate rolling 15-minute moving averages against the university timetable API.
   - Apply scikit-learn's `IsolationForest` or Facebook `Prophet` for automated anomaly detection and 7-day load forecasting.
   - Forward flagged anomalies to the WhatsApp Cloud API / Twilio gateway.

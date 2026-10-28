/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CampusBlock,
  TariffSettings,
  WastageAnomaly,
  Recommendation,
  AlertNotification,
  AlertSettings,
  UserRewardProfile,
  LeaderboardEntry,
  User,
  Language,
  ResourceReading,
} from './types';
import { CampusStorage } from './services/storage';
import { AnalyticsEngine } from './services/analytics';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { GuidedTour } from './components/GuidedTour';
import { BlockDetailModal } from './components/BlockDetailModal';
import { BlockFormModal } from './components/BlockFormModal';
import { CsvUploadModal } from './components/CsvUploadModal';
import { SendAlertModal } from './components/SendAlertModal';
import { AiChatWidget } from './components/AiChatWidget';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BlocksPage } from './pages/BlocksPage';
import { WastageAnalysisPage } from './pages/WastageAnalysisPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { RewardsPage } from './pages/RewardsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { PresidencyEcoPatrol3D } from './components/game/PresidencyEcoPatrol3D';
import { AiStudioPage } from './pages/AiStudioPage';
import { UiTheme } from './components/Navbar';

export default function App() {
  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(() => CampusStorage.getCurrentUser());
  const [language, setLanguage] = useState<Language>(() => CampusStorage.getLanguage());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [theme, setTheme] = useState<UiTheme>('midnight');

  // Campus Data State
  const [blocks, setBlocks] = useState<CampusBlock[]>(() => CampusStorage.getBlocks());
  const [tariffs, setTariffs] = useState<TariffSettings>(() => CampusStorage.getTariffs());
  const [anomalies, setAnomalies] = useState<WastageAnomaly[]>(() => CampusStorage.getAnomalies());
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() =>
    CampusStorage.getRecommendations()
  );
  const [alerts, setAlerts] = useState<AlertNotification[]>(() => CampusStorage.getAlerts());
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() =>
    CampusStorage.getAlertSettings()
  );
  const [userRewards, setUserRewards] = useState<UserRewardProfile>(() =>
    CampusStorage.getUserRewards()
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    CampusStorage.getLeaderboard()
  );

  // Modals State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedBlockForDetail, setSelectedBlockForDetail] = useState<CampusBlock | null>(null);
  const [isBlockFormOpen, setIsBlockFormOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<CampusBlock | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState<{
    isOpen: boolean;
    blockName: string;
    problem: string;
    lossPerHour: number;
  }>({
    isOpen: false,
    blockName: '',
    problem: '',
    lossPerHour: 45,
  });

  // Check first-time tour on initial load
  useEffect(() => {
    if (currentUser && !CampusStorage.isTourCompleted()) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Language Change Handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    CampusStorage.setLanguage(newLang);
  };

  // Logout Handler
  const handleLogout = () => {
    CampusStorage.setCurrentUser(null);
    setCurrentUser(null);
  };

  // Login Success Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (!CampusStorage.isTourCompleted()) {
      setIsTourOpen(true);
    }
  };

  // Open Alert Modal Helper
  const handleOpenAlertModal = (blockName: string, problem: string, loss: number) => {
    setAlertModalConfig({
      isOpen: true,
      blockName,
      problem,
      lossPerHour: loss,
    });
  };

  // Handle Save Tariffs
  const handleSaveTariffs = (newTariffs: TariffSettings) => {
    setTariffs(newTariffs);
    CampusStorage.saveTariffs(newTariffs);
  };

  // Handle Resolve Anomaly
  const handleResolveAnomaly = (id: string) => {
    CampusStorage.resolveAnomaly(id);
    setAnomalies(CampusStorage.getAnomalies());
    setUserRewards(CampusStorage.addPoints(50, `Resolved anomaly ${id}`));
  };

  // Handle Save Block (Add or Edit)
  const handleSaveBlock = (blockData: Partial<CampusBlock>) => {
    if (blockToEdit) {
      CampusStorage.updateBlock(blockToEdit.id, blockData);
    } else {
      CampusStorage.addBlock(blockData as any);
    }
    setBlocks(CampusStorage.getBlocks());
    setBlockToEdit(null);
  };

  // Handle Delete Block
  const handleDeleteBlock = (id: string) => {
    CampusStorage.deleteBlock(id);
    setBlocks(CampusStorage.getBlocks());
  };

  // Handle Mark Recommendation Done
  const handleMarkRecommendationDone = (id: string) => {
    CampusStorage.markRecommendationDone(id);
    setRecommendations(CampusStorage.getRecommendations());
    setUserRewards(CampusStorage.getUserRewards());
  };

  // Handle Save Alert Settings
  const handleSaveAlertSettings = (newSettings: AlertSettings) => {
    setAlertSettings(newSettings);
    CampusStorage.saveAlertSettings(newSettings);
  };

  // Handle Trigger Test Alert
  const handleTriggerTestAlert = () => {
    handleOpenAlertModal(
      'Academic Block B',
      'Test Alert: Block B Room 204 unoccupied with 3.2 kW load active.',
      45
    );
  };

  // Handle CSV Data Merged
  const handleDataMerged = (readings: ResourceReading[], count: number) => {
    // Process new readings through rule engine
    const currentBlocks = [...blocks];
    let newAnomaliesDetected = 0;

    readings.forEach(reading => {
      // Find block or update existing block consumption
      const match = currentBlocks.find(
        b =>
          b.name.toLowerCase() === reading.location.toLowerCase() ||
          b.code.toLowerCase() === reading.location.toLowerCase()
      );

      if (match) {
        if (reading.resource === 'electricity') {
          match.electricityKwh = Math.round(match.electricityKwh + reading.value * 0.2);
        } else if (reading.resource === 'water') {
          match.waterLitres = Math.round(match.waterLitres + reading.value * 0.2);
        } else if (reading.resource === 'waste') {
          match.wasteKg = Math.round(match.wasteKg + reading.value * 0.2);
        }
      }

      // Check rules
      const ruleAnomaly = AnalyticsEngine.evaluateAnomalyRules(reading, tariffs);
      if (ruleAnomaly) {
        newAnomaliesDetected++;
        CampusStorage.saveAnomalies([ruleAnomaly, ...CampusStorage.getAnomalies()]);
      }
    });

    CampusStorage.saveBlocks(currentBlocks);
    setBlocks(currentBlocks);
    setAnomalies(CampusStorage.getAnomalies());
    CampusStorage.addPoints(count * 5, `Uploaded ${count} CSV meter records`);
    setUserRewards(CampusStorage.getUserRewards());
    alert(`Successfully merged ${count} CSV readings into campus dataset! Refreshed all charts.`);
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} language={language} />;
  }

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans antialiased transition-colors duration-500 ${
      theme === 'cyber'
        ? 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#030712] to-black selection:bg-cyan-500 selection:text-black'
        : theme === 'sapphire'
        ? 'bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#020617] to-black selection:bg-indigo-500 selection:text-white'
        : theme === 'abyss'
        ? 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-[#030712] to-black selection:bg-sky-500 selection:text-white'
        : 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/50 via-[#030712] to-black selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        onStartTour={() => setIsTourOpen(true)}
        onLogout={handleLogout}
        currentTheme={theme}
        onThemeChange={setTheme}
        onOpenGame={() => setCurrentTab('game')}
      />

      {/* Main Layout Area: Desktop Sidebar + Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentUser={currentUser}
          language={language}
          onOpenCsvModal={() => setIsCsvModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage
              blocks={blocks}
              tariffs={tariffs}
              anomalies={anomalies}
              language={language}
              onOpenAlertModal={handleOpenAlertModal}
              onNavigateTab={setCurrentTab}
              onSelectBlock={setSelectedBlockForDetail}
            />
          )}

          {currentTab === 'blocks' && (
            <BlocksPage
              blocks={blocks}
              language={language}
              onOpenAddModal={() => {
                setBlockToEdit(null);
                setIsBlockFormOpen(true);
              }}
              onOpenEditModal={block => {
                setBlockToEdit(block);
                setIsBlockFormOpen(true);
              }}
              onDeleteBlock={handleDeleteBlock}
              onSelectBlock={setSelectedBlockForDetail}
            />
          )}

          {currentTab === 'wastage' && (
            <WastageAnalysisPage
              tariffs={tariffs}
              onSaveTariffs={handleSaveTariffs}
              anomalies={anomalies}
              onResolveAnomaly={handleResolveAnomaly}
              onOpenAlertModal={handleOpenAlertModal}
              language={language}
            />
          )}

          {currentTab === 'predictions' && (
            <PredictionsPage
              blocks={blocks}
              recommendations={recommendations}
              onMarkRecommendationDone={handleMarkRecommendationDone}
              language={language}
            />
          )}

          {currentTab === 'rewards' && (
            <RewardsPage
              userRewards={userRewards}
              leaderboard={leaderboard}
              onRefreshRewards={() => {
                setUserRewards(CampusStorage.getUserRewards());
                setLeaderboard(CampusStorage.getLeaderboard());
              }}
              language={language}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              settings={alertSettings}
              onSaveSettings={handleSaveAlertSettings}
              onTriggerTestAlert={handleTriggerTestAlert}
              language={language}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              blocks={blocks}
              tariffs={tariffs}
              anomalies={anomalies}
              language={language}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPage currentUser={currentUser} language={language} />
          )}

          {currentTab === 'help' && (
            <HelpCenterPage currentUser={currentUser} language={language} />
          )}

          {currentTab === 'architecture' && (
            <ArchitecturePage language={language} />
          )}

          {currentTab === 'game' && (
            <PresidencyEcoPatrol3D
              onExitGame={() => setCurrentTab('dashboard')}
              onPointsEarned={(pts, reason) => {
                CampusStorage.addPoints(pts, reason);
                setUserRewards(CampusStorage.getUserRewards());
              }}
            />
          )}

          {currentTab === 'studio' && (
            <AiStudioPage language={language} />
          )}
        </main>
      </div>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        language={language}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
      />

      {/* Floating AI Chat Assistant with Voice Input */}
      <AiChatWidget language={language} />

      {/* Guided Tour Modal */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        language={language}
      />

      {/* Block Detail Modal */}
      <BlockDetailModal
        block={selectedBlockForDetail}
        onClose={() => setSelectedBlockForDetail(null)}
        onTriggerAlert={handleOpenAlertModal}
        recommendations={recommendations}
        language={language}
      />

      {/* Add / Edit Block Modal */}
      <BlockFormModal
        isOpen={isBlockFormOpen}
        onClose={() => {
          setIsBlockFormOpen(false);
          setBlockToEdit(null);
        }}
        onSave={handleSaveBlock}
        initialBlock={blockToEdit}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onDataMerged={handleDataMerged}
      />

      {/* Send Alert Modal */}
      <SendAlertModal
        isOpen={alertModalConfig.isOpen}
        onClose={() =>
          setAlertModalConfig(prev => ({
            ...prev,
            isOpen: false,
          }))
        }
        initialBlockName={alertModalConfig.blockName}
        initialProblem={alertModalConfig.problem}
        initialLossPerHour={alertModalConfig.lossPerHour}
        onAlertDispatched={() => {
          setAlerts(CampusStorage.getAlerts());
        }}
      />
    </div>
  );
}

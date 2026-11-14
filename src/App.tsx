import { useEffect, useMemo, useRef, useState } from 'react';
import { CertificateScreen } from './components/CertificateScreen';
import { OverviewScreen } from './components/OverviewScreen';
import { ReportRubricScreen } from './components/ReportRubricScreen';
import { TopNav } from './components/TopNav';
import { TopicAuditScreen } from './components/TopicAuditScreen';
import { createDemoAuditSession } from './data/demoCase';
import {
  AppView,
  AuditSessionState,
  FinalRubricEvaluation,
  StudentProfile,
  TopicEvaluation,
  TopicId,
} from './types/audit';
import { computeCompletionStats } from './utils/auditLogic';
import {
  clearAuditSession,
  loadAuditSession,
  saveAuditSession,
} from './utils/storage';

export default function App() {
  const [state, setState] = useState<AuditSessionState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const demo = createDemoAuditSession();
      saveAuditSession(demo);
      return demo;
    }
    return loadAuditSession();
  });

  const [activeView, setActiveView] = useState<AppView>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' ? 'audit' : 'overview';
  });
  const [activeTopicId, setActiveTopicId] = useState<TopicId>('tema-1');
  const [justSaved, setJustSaved] = useState(false);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const savedAt = saveAuditSession(state);
      setState((prev) =>
        prev.lastSavedAt === savedAt ? prev : { ...prev, lastSavedAt: savedAt }
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    state.profile,
    state.answers,
    state.topicEvaluations,
    state.finalEvaluation,
  ]);

  const stats = useMemo(() => computeCompletionStats(state), [state]);

  const handleSaveProgressNow = () => {
    const savedAt = saveAuditSession(state);
    setState((prev) => ({ ...prev, lastSavedAt: savedAt }));
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  const handleUpdateProfile = (patch: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...patch,
      },
    }));
  };

  const handleChangeAnswer = (questionId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  };

  const handleTopicEvaluated = (
    topicId: TopicId,
    evaluation: TopicEvaluation
  ) => {
    setState((prev) => ({
      ...prev,
      topicEvaluations: {
        ...prev.topicEvaluations,
        [topicId]: evaluation,
      },
    }));
  };

  const handleUpdateFinalEvaluation = (finalEval: FinalRubricEvaluation) => {
    setState((prev) => ({
      ...prev,
      finalEvaluation: finalEval,
    }));
  };

  const handleStartTopic = (topicId: TopicId) => {
    setActiveTopicId(topicId);
    setActiveView('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadDemo = () => {
    const demo = createDemoAuditSession();
    const savedAt = saveAuditSession(demo);
    setState({ ...demo, lastSavedAt: savedAt });
  };

  const handleResetSession = () => {
    const cleared = clearAuditSession();
    setState(cleared);
  };

  const handleImportSession = (imported: AuditSessionState) => {
    const savedAt = saveAuditSession(imported);
    setState({ ...imported, lastSavedAt: savedAt });
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNav
        activeView={activeView}
        onNavigate={handleNavigate}
        onSaveProgress={handleSaveProgressNow}
        justSaved={justSaved}
      />

      <div className="flex-1">
        {activeView === 'overview' && (
          <OverviewScreen
            state={state}
            stats={stats}
            onUpdateProfile={handleUpdateProfile}
            onStartTopic={handleStartTopic}
            onLoadDemo={handleLoadDemo}
            onResetSession={handleResetSession}
            onImportSession={handleImportSession}
          />
        )}

        {activeView === 'audit' && (
          <TopicAuditScreen
            state={state}
            stats={stats}
            activeTopicId={activeTopicId}
            onSelectTopic={setActiveTopicId}
            onChangeAnswer={handleChangeAnswer}
            onTopicEvaluated={handleTopicEvaluated}
            onGoToReport={() => handleNavigate('report')}
          />
        )}

        {activeView === 'report' && (
          <ReportRubricScreen
            state={state}
            stats={stats}
            onUpdateProfile={handleUpdateProfile}
            onUpdateFinalEvaluation={handleUpdateFinalEvaluation}
            onGoToCertificate={() => handleNavigate('certificate')}
          />
        )}

        {activeView === 'certificate' && (
          <CertificateScreen
            state={state}
            stats={stats}
            onGoToOverview={() => handleNavigate('overview')}
            onGoToTopic={handleStartTopic}
          />
        )}
      </div>

      <footer className="no-print border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>
            Trabajo final #2 · Profesora Liz Acuña · Auditoría de dinámica de procesos
            administrativos en la empresa
          </span>
          <span>Guardado automático local en navegador</span>
        </div>
      </footer>
    </div>
  );
}

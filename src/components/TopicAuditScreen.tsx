import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { AUDIT_TOPICS } from '../data/auditCurriculum';
import {
  AuditSessionState,
  TopicEvaluation,
  TopicId,
} from '../types/audit';
import { CompletionStats, isNonEmptyAnswer } from '../utils/auditLogic';

interface TopicAuditScreenProps {
  state: AuditSessionState;
  stats: CompletionStats;
  activeTopicId: TopicId;
  onSelectTopic: (topicId: TopicId) => void;
  onChangeAnswer: (questionId: string, value: string) => void;
  onTopicEvaluated: (topicId: TopicId, evaluation: TopicEvaluation) => void;
  onGoToReport: () => void;
}

export const TopicAuditScreen: React.FC<TopicAuditScreenProps> = ({
  state,
  stats,
  activeTopicId,
  onSelectTopic,
  onChangeAnswer,
  onTopicEvaluated,
  onGoToReport,
}) => {
  const topicIndex = AUDIT_TOPICS.findIndex((t) => t.id === activeTopicId);
  const topic = AUDIT_TOPICS[topicIndex] ?? AUDIT_TOPICS[0];

  const [expandedSubtopic, setExpandedSubtopic] = useState<string | null>(
    topic.subtopics[0]?.code ?? null
  );
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evalNotice, setEvalNotice] = useState<string | null>(null);

  const currentEval = state.topicEvaluations[topic.id];
  const topicStat = stats.perTopic[topic.id];

  const handleSelectTopic = (id: TopicId) => {
    const nextTopic = AUDIT_TOPICS.find((t) => t.id === id);
    setExpandedSubtopic(nextTopic?.subtopics[0]?.code ?? null);
    setEvalError(null);
    setEvalNotice(null);
    onSelectTopic(id);
  };

  const handleEvaluateWithAI = async () => {
    setEvalError(null);
    setEvalNotice(null);

    const hasAtLeastOne = topic.questions.some((q) =>
      isNonEmptyAnswer(state.answers[q.id])
    );
    if (!hasAtLeastOne) {
      setEvalError(
        'Por favor redacta al menos una respuesta (mínimo 15 caracteres) antes de solicitar la evaluación del Agente IA.'
      );
      return;
    }

    setEvaluating(true);
    try {
      const res = await fetch('/api/audit/evaluate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          answers: state.answers,
          profile: state.profile,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Error al evaluar el tema con el agente IA.');
      }
      const data = (await res.json()) as {
        evaluation: TopicEvaluation;
        notice?: string;
      };
      onTopicEvaluated(topic.id, data.evaluation);
      if (data.notice) setEvalNotice(data.notice);
    } catch (err) {
      setEvalError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar la evaluación en este momento.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  const prevTopic = topicIndex > 0 ? AUDIT_TOPICS[topicIndex - 1] : null;
  const nextTopic =
    topicIndex < AUDIT_TOPICS.length - 1 ? AUDIT_TOPICS[topicIndex + 1] : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Topic Selector Tabs */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Temas de auditoría"
          className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1"
        >
          {AUDIT_TOPICS.map((t) => {
            const isActive = t.id === topic.id;
            const tStat = stats.perTopic[t.id];
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleSelectTopic(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-blue-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.shortTitle}</span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {tStat.answered}/{tStat.total}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Empresa:{' '}
          <span className="font-semibold text-slate-800">
            {state.profile.companyName || 'Sin nombre (completar en Inicio)'}
          </span>
        </div>
      </div>

      {/* Two-Zone Split Workspace: Theory Guide (Left) + Audit & AI Agent (Right) */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Zone: Pedagogical Explanation */}
        <aside className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
              <BookOpen className="h-4 w-4" />
              <span>Explicación conceptual · Tema {topic.number} de 5</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-900 text-balance">
              {topic.title}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {topic.intro}
            </p>

            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Ejes transversales:{' '}
              <span className="font-medium text-slate-700">
                {topic.structuralDimensions.join(' · ')}
              </span>
            </div>

            {/* Interactive Subtopic Explorer */}
            <div className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
              {topic.subtopics.map((sub) => {
                const isOpen = expandedSubtopic === sub.code;
                return (
                  <div key={sub.code} className="py-3">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpandedSubtopic(isOpen ? null : sub.code)
                      }
                      className="flex w-full items-center justify-between gap-3 py-1 text-left focus-visible:outline-2 focus-visible:outline-blue-900"
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        <span className="font-mono text-blue-900 mr-1.5">
                          {sub.code}
                        </span>
                        {sub.title}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-2.5 space-y-2.5 text-sm text-slate-600">
                        <p className="leading-relaxed">{sub.summary}</p>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Conceptos clave:
                          </p>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                            {sub.keyConcepts.map((concept) => (
                              <li key={concept}>{concept}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 border border-slate-200">
                          <span className="font-semibold text-blue-900">
                            Foco de auditoría:{' '}
                          </span>
                          {sub.auditFocus}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Zone: Audit Questionnaire & AI Evaluation */}
        <section className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Cuestionario de auditoría en tu empresa
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Tus respuestas se guardan automáticamente y estructuran el informe final.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                {topicStat.answered} / {topicStat.total} completadas
              </span>
            </div>

            <div className="mt-6 space-y-7">
              {topic.questions.map((q, index) => {
                const value = state.answers[q.id] ?? '';
                const done = isNonEmptyAnswer(value);
                return (
                  <div key={q.id} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-medium text-blue-900">
                        Pregunta {index + 1} · {q.subtopicRef}
                      </span>
                      <span className="tabular-nums">
                        Criterios rúbrica: {q.rubricLinks.map((r) => r.toUpperCase()).join(', ')}
                        {done && ' · Registrada'}
                      </span>
                    </div>

                    <label
                      htmlFor={q.id}
                      className="block text-sm font-semibold leading-snug text-slate-900"
                    >
                      {q.prompt}
                    </label>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Guía: {q.guidance}
                    </p>

                    <textarea
                      id={q.id}
                      rows={4}
                      value={value}
                      onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                      <span>
                        {done
                          ? 'Extensión válida para evaluación'
                          : 'Mínimo recomendado: 15 caracteres'}
                      </span>
                      <span>{value.trim().length} caracteres</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Evaluation Trigger */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <div className="text-xs text-slate-600">
                Solicita al agente de IA evaluar la calidad de tus respuestas y la madurez ética y
                operativa de la empresa.
              </div>
              <button
                type="button"
                disabled={evaluating}
                onClick={handleEvaluateWithAI}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Evaluando con Agente IA...</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span>
                      {currentEval
                        ? 'Reevaluar tema con Agente IA'
                        : 'Evaluar tema con Agente IA'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {evalError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{evalError}</span>
              </div>
            )}

            {evalNotice && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {evalNotice}
              </div>
            )}
          </div>

          {/* AI Agent Evaluation Results */}
          {currentEval && (
            <div
              aria-label="Resultado de evaluación del agente IA"
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-900" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Dictamen del Agente Evaluador IA
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {currentEval.source === 'gemini-ai'
                    ? 'Evaluación Gemini IA'
                    : 'Evaluación Analítica'}{' '}
                  ·{' '}
                  {new Date(currentEval.evaluatedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* 3 Metrics Row */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Calidad de respuestas
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {currentEval.qualityScore} / 100
                  </p>
                  <p className="mt-1 text-xs font-semibold text-blue-900">
                    Nivel: {currentEval.qualityLabel}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Madurez Operativa
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {currentEval.operationalMaturityScore} / 100
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    Nivel {currentEval.operationalMaturityLevel} de 5
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Madurez Ética
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {currentEval.ethicalMaturityScore} / 100
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Nivel {currentEval.ethicalMaturityLevel} de 5
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Diagnóstico de madurez operativa
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {currentEval.operationalDiagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Diagnóstico de madurez ética
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {currentEval.ethicalDiagnosis}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Fortalezas</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                    {currentEval.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Brechas detectadas
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                    {currentEval.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Recomendaciones SIG
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
                    {currentEval.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Topic Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div>
              {prevTopic && (
                <button
                  type="button"
                  onClick={() => handleSelectTopic(prevTopic.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{prevTopic.shortTitle}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {nextTopic ? (
                <button
                  type="button"
                  onClick={() => handleSelectTopic(nextTopic.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <span>Siguiente: {nextTopic.shortTitle}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGoToReport}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ir a Informe y Rúbrica</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

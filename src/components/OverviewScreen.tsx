import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { AUDIT_TOPICS } from '../data/auditCurriculum';
import { MAX_RUBRIC_SCORE } from '../data/rubricData';
import { AuditSessionState, StudentProfile, TopicId } from '../types/audit';
import { CompletionStats, computeRubricTotal } from '../utils/auditLogic';

interface OverviewScreenProps {
  state: AuditSessionState;
  stats: CompletionStats;
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
  onStartTopic: (topicId: TopicId) => void;
  onLoadDemo: () => void;
  onResetSession: () => void;
  onImportSession: (imported: AuditSessionState) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  state,
  stats,
  onUpdateProfile,
  onStartTopic,
  onLoadDemo,
  onResetSession,
  onImportSession,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const evaluatedCount = Object.values(state.topicEvaluations).filter(Boolean).length;
  const rubricTotal = state.finalEvaluation
    ? state.finalEvaluation.totalScore
    : computeRubricTotal({
        a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1,
      });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_auditoria_${(state.profile.studentName || 'estudiante')
      .toLowerCase()
      .replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AuditSessionState;
        if (!parsed.profile || !parsed.answers) {
          setImportError('El archivo no corresponde a un respaldo válido de auditoría.');
          return;
        }
        onImportSession(parsed);
      } catch {
        setImportError('No se pudo leer el archivo JSON seleccionado.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formattedLastSaved = state.lastSavedAt
    ? new Date(state.lastSavedAt).toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'Sin cambios guardados aún';

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Hero Split */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="text-xs font-medium tracking-wide text-blue-900">
              Trabajo final #2 · Cátedra de Administración · Profesora Liz Acuña
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 text-balance sm:text-4xl lg:text-[2.6rem]">
              Auditoría de dinámica de procesos administrativos en la empresa
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Estudia cada unidad temática, audita el organigrama, el flujo de información, el
              control interno y la toma de decisiones gerenciales de tu empresa, recibe dictamen
              de madurez ética y operativa con agente de IA y genera tu informe final en Word y
              PDF con la rúbrica oficial de 40 puntos.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onStartTopic('tema-1')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 whitespace-nowrap shrink-0"
            >
              <span>
                {stats.answeredCount > 0 ? 'Continuar auditoría' : 'Comenzar auditoría'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Cargar caso demostrativo completo
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/hero_collaborative_audit_1794644162655.jpg"
              alt="Equipo intergeneracional de jóvenes y adultos trabajando en grupo de manera interconectada sobre planos de procesos administrativos"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="h-64 w-full rounded-xl border border-slate-200 object-cover lg:h-full lg:min-h-[300px]"
            />
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-6 text-center lg:h-full lg:min-h-[300px]">
              <Building2 className="h-10 w-10 text-blue-900" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Auditoría de Procesos Administrativos
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Organigrama · Flujo de información · Control interno · Decisiones gerenciales
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4-column KPI strip below hero split */}
      <section
        aria-label="Resumen de progreso"
        className="mt-8 grid grid-cols-1 gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <p className="text-xs font-medium text-slate-500">Avance del cuestionario</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {stats.answeredCount} / {stats.totalQuestions}{' '}
            <span className="text-sm font-normal text-slate-500">
              ({stats.completionPercent}%)
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Temas evaluados por Agente IA</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {evaluatedCount} / {AUDIT_TOPICS.length}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Calificación Rúbrica SIG</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-blue-900 tabular-nums">
            {state.finalEvaluation ? `${rubricTotal} / ${MAX_RUBRIC_SCORE}` : 'Pendiente'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Memoria persistente local</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{formattedLastSaved}</p>
        </div>
      </section>

      {/* Two-Column Main Content: Profile Form + Syllabus Roadmap */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Student & Company Form */}
        <section className="lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              1. Registro del estudiante y empresa
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Estos datos se guardan automáticamente en tu navegador para no perder avances y
              aparecerán en tu informe y certificado final.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-sm font-medium text-slate-800"
                >
                  Nombre completo del estudiante *
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={state.profile.studentName}
                  onChange={(e) => onUpdateProfile({ studentName: e.target.value })}
                  placeholder="Ej.: Sofía Mendoza Rivera"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Cédula / Matrícula
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    value={state.profile.studentId}
                    onChange={(e) => onUpdateProfile({ studentId: e.target.value })}
                    placeholder="Ej.: 2024-0842"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="auditDate"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Fecha de auditoría
                  </label>
                  <input
                    id="auditDate"
                    type="date"
                    value={state.profile.auditDate}
                    onChange={(e) => onUpdateProfile({ auditDate: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-slate-800"
                >
                  Nombre de la empresa auditada *
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={state.profile.companyName}
                  onChange={(e) => onUpdateProfile({ companyName: e.target.value })}
                  placeholder="Ej.: Logística del Istmo S.A."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="companySector"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Sector o giro comercial
                  </label>
                  <input
                    id="companySector"
                    type="text"
                    value={state.profile.companySector}
                    onChange={(e) => onUpdateProfile({ companySector: e.target.value })}
                    placeholder="Ej.: Servicios, Retail, Manufactura"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="companySize"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Tamaño organizacional
                  </label>
                  <select
                    id="companySize"
                    value={state.profile.companySize}
                    onChange={(e) => onUpdateProfile({ companySize: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  >
                    <option value="Microempresa (1–10 colaboradores)">
                      Microempresa (1–10)
                    </option>
                    <option value="Pequeña empresa (11–50 colaboradores)">
                      Pequeña empresa (11–50)
                    </option>
                    <option value="Mediana empresa (51–250 colaboradores)">
                      Mediana empresa (51–250)
                    </option>
                    <option value="Gran empresa (+250 colaboradores)">
                      Gran empresa (+250)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Backup & Reset Controls */}
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs font-medium text-slate-500">
                Portabilidad de memoria entre dispositivos
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Exportar respaldo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importar respaldo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-red-200 hover:text-red-700 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reiniciar todo</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetSession();
                        setConfirmReset(false);
                      }}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap shrink-0"
                    >
                      Confirmar reinicio
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              {importError && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {importError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Syllabus Roadmap */}
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              2. Mapa temático de auditoría (5 Unidades)
            </h2>
            <span className="text-xs text-slate-500">
              Explicación teórica + Reactivos + Evaluación IA
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {AUDIT_TOPICS.map((topic) => {
              const topicStats = stats.perTopic[topic.id];
              const topicEval = state.topicEvaluations[topic.id];
              return (
                <div
                  key={topic.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-blue-900">
                        0{topic.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {topicStats.answered}/{topicStats.total} preguntas
                      </span>
                      {topicEval && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-emerald-700">
                            IA: {topicEval.qualityScore}/100 ({topicEval.qualityLabel})
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      {topic.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {topic.subtopics.map((s) => `${s.code} ${s.title}`).join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {topicStats.isComplete && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completo</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onStartTopic(topic.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-900 hover:text-blue-900 whitespace-nowrap shrink-0"
                    >
                      <span>{topicStats.answered > 0 ? 'Editar tema' : 'Auditar tema'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

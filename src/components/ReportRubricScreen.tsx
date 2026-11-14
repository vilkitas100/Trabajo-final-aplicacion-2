import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Bot,
  FileDown,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  MAX_RUBRIC_SCORE,
  RUBRIC_CRITERIA,
  SIG_RUBRIC_TITLE,
} from '../data/rubricData';
import {
  AuditSessionState,
  FinalRubricEvaluation,
  RubricCriterionId,
  RubricLevel,
  StudentProfile,
} from '../types/audit';
import {
  buildHeuristicFinalEvaluation,
  CompletionStats,
  computeRubricTotal,
  getQualitativeGrade,
} from '../utils/auditLogic';
import { downloadPdfReport, downloadWordReport } from '../utils/exportReports';

interface ReportRubricScreenProps {
  state: AuditSessionState;
  stats: CompletionStats;
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
  onUpdateFinalEvaluation: (finalEval: FinalRubricEvaluation) => void;
  onGoToCertificate: () => void;
}

export const ReportRubricScreen: React.FC<ReportRubricScreenProps> = ({
  state,
  stats,
  onUpdateProfile,
  onUpdateFinalEvaluation,
  onGoToCertificate,
}) => {
  const [evaluatingFinal, setEvaluatingFinal] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeEval: FinalRubricEvaluation =
    state.finalEvaluation ?? buildHeuristicFinalEvaluation(state);
  const grade = getQualitativeGrade(activeEval.totalScore);

  const handleEvaluateFinal = async () => {
    setError(null);
    setNotice(null);
    setEvaluatingFinal(true);
    try {
      const res = await fetch('/api/audit/evaluate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Error al calcular la rúbrica con IA.');
      }
      const data = (await res.json()) as {
        finalEvaluation: FinalRubricEvaluation;
        notice?: string;
      };
      onUpdateFinalEvaluation(data.finalEvaluation);
      if (data.notice) setNotice(data.notice);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar la evaluación global.'
      );
    } finally {
      setEvaluatingFinal(false);
    }
  };

  const handleSelectCriterionLevel = (
    criterionId: RubricCriterionId,
    level: RubricLevel
  ) => {
    const nextScores = {
      ...activeEval.scores,
      [criterionId]: level,
    };
    onUpdateFinalEvaluation({
      ...activeEval,
      scores: nextScores,
      totalScore: computeRubricTotal(nextScores),
    });
  };

  const handleInsertApaTemplate = () => {
    const existing = state.profile.apaReferences.trim();
    const template = [
      'Chiavenato, I. (2019). Introducción a la teoría general de la administración (10.ª ed.). McGraw-Hill Education.',
      'Drucker, P. F. (2007). The practice of management. Routledge.',
      'Robbins, S. P., & Judge, T. A. (2022). Comportamiento organizacional (18.ª ed.). Pearson Educación.',
      'Cortina, A. (2013). ¿Para qué sirve realmente la ética? Paidós.',
    ].join('\n');
    onUpdateProfile({
      apaReferences: existing ? `${existing}\n${template}` : template,
    });
  };

  const handleDownloadWord = async () => {
    setDownloadingWord(true);
    setError(null);
    try {
      await downloadWordReport(state);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el archivo Word (.docx).'
      );
    } finally {
      setDownloadingWord(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-900">
            Estructura del informe final · Trabajo final #2 · Profesora Liz Acuña
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 text-balance">
            Informe Final, Propuesta SIG y Rúbrica (40 puntos)
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Completa los apartados complementarios de la propuesta de Sistema de Información
            Gerencial (SIG), valida la rúbrica oficial de 10 criterios con el Agente IA y
            descarga tu informe completo en Word (.docx) y PDF (.pdf).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={downloadingWord}
            onClick={handleDownloadWord}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {downloadingWord ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 text-blue-900" />
            )}
            <span>Descargar Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadPdfReport(state)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            <FileDown className="h-4 w-4" />
            <span>Descargar PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Puntaje Total Rúbrica</p>
          <p className="mt-1 font-mono text-2xl font-bold text-blue-900 tabular-nums">
            {activeEval.totalScore} / {MAX_RUBRIC_SCORE} pts
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {grade.percentage}% · {grade.label}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Madurez Operativa</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {activeEval.overallOperationalMaturity} / 100
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Procesos, control interno y tecnología
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Madurez Ética</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {activeEval.overallEthicalMaturity} / 100
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Código de ética, clima y valores
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Cobertura del Cuestionario</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {stats.answeredCount} / {stats.totalQuestions}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {stats.isCertificateEligible
              ? 'Apto para certificado'
              : 'Completa las preguntas para certificar'}
          </p>
        </div>
      </section>

      {/* Section A: SIG Proposal & Academic Rigor Inputs */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          1. Propuesta del Sistema de Información Gerencial (SIG) y Criterios Académicos
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Completa estos campos para evidenciar todos los criterios evaluados en la rúbrica de
          40 puntos antes de ejecutar la calificación final.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="sigProposalSummary"
              className="block text-sm font-medium text-slate-800"
            >
              Resumen de la propuesta SIG (Criterios a, b, e)
            </label>
            <textarea
              id="sigProposalSummary"
              rows={3}
              value={state.profile.sigProposalSummary}
              onChange={(e) =>
                onUpdateProfile({ sigProposalSummary: e.target.value })
              }
              placeholder="Describe el Sistema de Información Gerencial propuesto, su alineación al plan estratégico y respuesta al entorno..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="techResourcesDetail"
              className="block text-sm font-medium text-slate-800"
            >
              Determinación de recursos tecnológicos (Criterio c)
            </label>
            <textarea
              id="techResourcesDetail"
              rows={3}
              value={state.profile.techResourcesDetail}
              onChange={(e) =>
                onUpdateProfile({ techResourcesDetail: e.target.value })
              }
              placeholder="Detalla hardware, licencias de software, servidores, conectividad y presupuesto estimado..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="specialistBacking"
              className="block text-sm font-medium text-slate-800"
            >
              Respaldo de un especialista (Criterio d)
            </label>
            <textarea
              id="specialistBacking"
              rows={3}
              value={state.profile.specialistBacking}
              onChange={(e) =>
                onUpdateProfile({ specialistBacking: e.target.value })
              }
              placeholder="Nombre, cargo o especialidad del profesional que valida o fundamenta la arquitectura técnica y organizacional..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="collaborativeTeamNotes"
              className="block text-sm font-medium text-slate-800"
            >
              Trabajo colaborativo entre equipos (Criterio f)
            </label>
            <textarea
              id="collaborativeTeamNotes"
              rows={3}
              value={state.profile.collaborativeTeamNotes}
              onChange={(e) =>
                onUpdateProfile({ collaborativeTeamNotes: e.target.value })
              }
              placeholder="Explica cómo se integró el trabajo colaborativo en la auditoría y en el uso futuro del SIG..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="teacherFeedbackApplied"
              className="block text-sm font-medium text-slate-800"
            >
              Uso de la retroalimentación del docente (Criterio j)
            </label>
            <textarea
              id="teacherFeedbackApplied"
              rows={3}
              value={state.profile.teacherFeedbackApplied}
              onChange={(e) =>
                onUpdateProfile({ teacherFeedbackApplied: e.target.value })
              }
              placeholder="Describe las recomendaciones planteadas por la Profesora Liz Acuña que fueron incorporadas..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="apaReferences"
                className="block text-sm font-medium text-slate-800"
              >
                Referencias bibliográficas en formato APA (Criterio h)
              </label>
              <button
                type="button"
                onClick={handleInsertApaTemplate}
                className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
              >
                Insertar base APA 7.ª ed.
              </button>
            </div>
            <textarea
              id="apaReferences"
              rows={3}
              value={state.profile.apaReferences}
              onChange={(e) =>
                onUpdateProfile({ apaReferences: e.target.value })
              }
              placeholder="Apellido, N. (Año). Título del libro o artículo. Editorial."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section B: Official 40-point Rubric Matrix */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              2. {SIG_RUBRIC_TITLE}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Escala oficial: 4 (Excelente) · 3 (Satisfactorio) · 2 (Limitado) · 1
              (Insuficiente). Total sobre 40 puntos.
            </p>
          </div>

          <button
            type="button"
            disabled={evaluatingFinal}
            onClick={handleEvaluateFinal}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {evaluatingFinal ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calificando rúbrica con IA...</span>
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                <span>Calificar Rúbrica Completa con IA</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {notice}
          </div>
        )}

        {/* Executive Summary Box */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-blue-900">
            Síntesis Ejecutiva de Evaluación ({activeEval.source === 'gemini-ai' ? 'Agente IA Gemini' : 'Evaluación Analítica'})
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {activeEval.executiveSummary}
          </p>
        </div>

        {/* Interactive Rubric Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[18%] px-3 py-3 font-semibold">Criterios</th>
                <th className="w-[18%] px-3 py-3 font-semibold text-center">4 pts</th>
                <th className="w-[18%] px-3 py-3 font-semibold text-center">3 pts</th>
                <th className="w-[18%] px-3 py-3 font-semibold text-center">2 pts</th>
                <th className="w-[18%] px-3 py-3 font-semibold text-center">1 pt</th>
                <th className="w-[10%] px-3 py-3 font-semibold text-right">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RUBRIC_CRITERIA.map((criterion) => {
                const selectedLevel = activeEval.scores[criterion.id];
                return (
                  <tr key={criterion.id} className="align-top">
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-slate-900">{criterion.label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-slate-500">
                        {activeEval.justifications[criterion.id]}
                      </p>
                    </td>
                    {([4, 3, 2, 1] as RubricLevel[]).map((lvl) => {
                      const active = selectedLevel === lvl;
                      return (
                        <td key={lvl} className="p-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectCriterionLevel(criterion.id, lvl)
                            }
                            aria-pressed={active}
                            className={`h-full w-full rounded-lg border p-2.5 text-left text-[11px] leading-snug transition-colors ${
                              active
                                ? 'border-blue-900 bg-blue-50/70 text-slate-900 font-medium'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {criterion.descriptors[lvl]}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3.5 text-right font-mono text-sm font-bold text-blue-900 tabular-nums">
                      {selectedLevel} / 4
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={5} className="px-3 py-3.5 text-sm font-bold text-slate-900">
                  TOTAL (Puntaje calculado con base en 40 puntos · {grade.label})
                </td>
                <td className="px-3 py-3.5 text-right font-mono text-base font-bold text-blue-900 tabular-nums">
                  {activeEval.totalScore} / 40
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-500">
            Al completar todas las respuestas de los 5 temas podrás emitir tu certificado oficial.
          </p>
          <button
            type="button"
            onClick={onGoToCertificate}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 whitespace-nowrap shrink-0"
          >
            <Award className="h-4 w-4" />
            <span>Ir al Certificado Oficial</span>
          </button>
        </div>
      </section>
    </main>
  );
};

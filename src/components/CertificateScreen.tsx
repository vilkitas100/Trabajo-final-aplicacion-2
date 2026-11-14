import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileDown,
  Lock,
  Printer,
} from 'lucide-react';
import { AUDIT_TOPICS } from '../data/auditCurriculum';
import { MAX_RUBRIC_SCORE } from '../data/rubricData';
import { AuditSessionState, TopicId } from '../types/audit';
import {
  buildHeuristicFinalEvaluation,
  CompletionStats,
  getQualitativeGrade,
} from '../utils/auditLogic';
import { downloadCertificatePdf } from '../utils/exportReports';

interface CertificateScreenProps {
  state: AuditSessionState;
  stats: CompletionStats;
  onGoToOverview: () => void;
  onGoToTopic: (topicId: TopicId) => void;
}

export const CertificateScreen: React.FC<CertificateScreenProps> = ({
  state,
  stats,
  onGoToOverview,
  onGoToTopic,
}) => {
  const [sealFailed, setSealFailed] = useState(false);

  const finalEval =
    state.finalEvaluation ?? buildHeuristicFinalEvaluation(state);
  const grade = getQualitativeGrade(finalEval.totalScore);

  if (!stats.isCertificateEligible) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-3 text-slate-900">
            <Lock className="h-6 w-6 text-amber-700" />
            <h1 className="text-2xl font-bold">
              Certificado pendiente de finalización
            </h1>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Para generar el certificado oficial con tu nombre, empresa y calificación final,
            debes completar tu registro y responder todas las preguntas de auditoría de los 5
            temas.
          </p>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
            {!stats.isProfileComplete && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-amber-950">
                    Faltan datos de identificación
                  </p>
                  <p className="text-xs text-amber-800">
                    Ingresa tu nombre completo y el nombre de la empresa auditada en Inicio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoToOverview}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 whitespace-nowrap shrink-0"
                >
                  <span>Completar registro</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {AUDIT_TOPICS.map((topic) => {
              const tStat = stats.perTopic[topic.id];
              if (tStat.isComplete) return null;
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {topic.title}
                    </p>
                    <p className="text-xs text-slate-600 tabular-nums">
                      Avance actual: {tStat.answered} de {tStat.total} preguntas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onGoToTopic(topic.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-blue-900 hover:text-blue-900 whitespace-nowrap shrink-0"
                  >
                    <span>Completar tema</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Action Bar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          <span>Auditoría completada al 100% · Certificado listo para entrega</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCertificatePdf(state)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            <FileDown className="h-4 w-4" />
            <span>Descargar Certificado PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Canvas */}
      <section
        aria-label="Certificado oficial de auditoría"
        className="print-only-area rounded-2xl border-4 border-blue-950 bg-white p-3 shadow-sm"
      >
        <div className="rounded-xl border border-amber-700/60 px-6 py-10 text-center sm:px-12 sm:py-12">
          <div className="flex flex-col items-center">
            {!sealFailed ? (
              <img
                src="/src/assets/images/academic_audit_seal_1794643632007.jpg"
                alt="Sello académico oficial de gobernanza y auditoría ética"
                referrerPolicy="no-referrer"
                onError={() => setSealFailed(true)}
                className="h-24 w-24 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-900 bg-slate-50">
                <Award className="h-10 w-10 text-blue-900" />
              </div>
            )}

            <p className="mt-4 text-xs font-semibold tracking-wide text-blue-900">
              Trabajo Final #2 · Cátedra de Procesos Administrativos
            </p>
            <h1 className="mt-2 font-editorial text-3xl font-bold text-slate-900 sm:text-4xl">
              Certificado de Finalización de Auditoría
            </h1>
          </div>

          <p className="mt-8 text-sm text-slate-600">
            Se hace constar que el / la estudiante:
          </p>

          <p className="mt-2 font-editorial text-3xl font-bold text-blue-950 sm:text-4xl">
            {state.profile.studentName}
          </p>
          {state.profile.studentId && (
            <p className="mt-1 font-mono text-xs text-slate-500">
              Identificación / Matrícula: {state.profile.studentId}
            </p>
          )}

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
            Ha finalizado satisfactoriamente la{' '}
            <strong className="font-semibold text-slate-900">
              Auditoría de dinámica de procesos administrativos en la empresa
            </strong>{' '}
            aplicada a{' '}
            <strong className="font-semibold text-slate-900">
              {state.profile.companyName}
            </strong>
            {state.profile.companySector
              ? ` (${state.profile.companySector})`
              : ''}
            , completando el análisis integral de Dirección, Comunicación, Control,
            Administración por Objetivos, Comportamiento Organizacional, Enfoques Modernos y
            Ética Corporativa.
          </p>

          {/* Score & Maturity Panel */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Calificación Final</p>
              <p className="mt-1 font-mono text-2xl font-bold text-blue-900 tabular-nums">
                {finalEval.totalScore} / {MAX_RUBRIC_SCORE}
              </p>
              <p className="text-xs font-semibold text-slate-700">
                {grade.percentage}% · {grade.label}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Madurez Operativa</p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {activeEvalScore(finalEval.overallOperationalMaturity)} / 100
              </p>
              <p className="text-xs text-slate-600">Procesos y Control SIG</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Madurez Ética</p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                {activeEvalScore(finalEval.overallEthicalMaturity)} / 100
              </p>
              <p className="text-xs text-slate-600">Gobernanza y Valores</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="border-t border-slate-400 pt-3">
              <p className="text-sm font-bold text-slate-900">Profesora Liz Acuña</p>
              <p className="text-xs text-slate-500">
                Docente Titular · Auditoría de Procesos Administrativos
              </p>
            </div>

            <div className="border-t border-slate-400 pt-3">
              <p className="text-sm font-bold text-slate-900">
                Fecha de emisión: {state.profile.auditDate}
              </p>
              <p className="text-xs text-slate-500">
                {grade.maturityBand}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

function activeEvalScore(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

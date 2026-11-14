import { AUDIT_TOPICS, TOTAL_AUDIT_QUESTIONS } from '../data/auditCurriculum';
import { RUBRIC_CRITERIA } from '../data/rubricData';
import {
  AuditSessionState,
  FinalRubricEvaluation,
  RubricCriterionId,
  RubricLevel,
  TopicEvaluation,
  TopicId,
} from '../types/audit';

export interface CompletionStats {
  answeredCount: number;
  totalQuestions: number;
  completionPercent: number;
  isProfileComplete: boolean;
  isAllQuestionsComplete: boolean;
  isCertificateEligible: boolean;
  perTopic: Record<
    TopicId,
    {
      answered: number;
      total: number;
      isComplete: boolean;
      evaluated: boolean;
    }
  >;
}

export function isNonEmptyAnswer(value: string | undefined): boolean {
  return Boolean(value && value.trim().length >= 15);
}

export function computeCompletionStats(state: AuditSessionState): CompletionStats {
  let answeredCount = 0;

  const perTopic = {} as CompletionStats['perTopic'];

  for (const topic of AUDIT_TOPICS) {
    let topicAnswered = 0;
    for (const q of topic.questions) {
      if (isNonEmptyAnswer(state.answers[q.id])) {
        topicAnswered += 1;
        answeredCount += 1;
      }
    }
    perTopic[topic.id] = {
      answered: topicAnswered,
      total: topic.questions.length,
      isComplete: topicAnswered === topic.questions.length,
      evaluated: Boolean(state.topicEvaluations[topic.id]),
    };
  }

  const isProfileComplete =
    state.profile.studentName.trim().length >= 2 &&
    state.profile.companyName.trim().length >= 2;

  const isAllQuestionsComplete = answeredCount === TOTAL_AUDIT_QUESTIONS;
  const completionPercent = Math.round(
    (answeredCount / Math.max(1, TOTAL_AUDIT_QUESTIONS)) * 100
  );

  return {
    answeredCount,
    totalQuestions: TOTAL_AUDIT_QUESTIONS,
    completionPercent,
    isProfileComplete,
    isAllQuestionsComplete,
    isCertificateEligible: isProfileComplete && isAllQuestionsComplete,
    perTopic,
  };
}

export function computeRubricTotal(
  scores: Record<RubricCriterionId, RubricLevel>
): number {
  return RUBRIC_CRITERIA.reduce((sum, c) => sum + (scores[c.id] ?? 1), 0);
}

export function getQualitativeGrade(totalScore: number): {
  label: string;
  percentage: number;
  maturityBand: string;
} {
  const clamped = Math.max(0, Math.min(40, totalScore));
  const percentage = Math.round((clamped / 40) * 100);
  if (clamped >= 36) {
    return {
      label: 'Sobresaliente',
      percentage,
      maturityBand: 'Madurez Gerencial y Ética Optimizada',
    };
  }
  if (clamped >= 30) {
    return {
      label: 'Notable / Satisfactorio',
      percentage,
      maturityBand: 'Madurez Operativa y Ética Consolidada',
    };
  }
  if (clamped >= 22) {
    return {
      label: 'En Desarrollo',
      percentage,
      maturityBand: 'Madurez Intermedia en Transición',
    };
  }
  return {
    label: 'Inicial / Requiere Mejora',
    percentage,
    maturityBand: 'Madurez Incipiente',
  };
}

export function clampScore(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function toMaturityLevel(score0to100: number): 1 | 2 | 3 | 4 | 5 {
  if (score0to100 >= 85) return 5;
  if (score0to100 >= 70) return 4;
  if (score0to100 >= 55) return 3;
  if (score0to100 >= 35) return 2;
  return 1;
}

export function buildHeuristicTopicEvaluation(
  topicId: TopicId,
  answers: Record<string, string>,
  companyName: string
): TopicEvaluation {
  const topic = AUDIT_TOPICS.find((t) => t.id === topicId);
  if (!topic) {
    throw new Error(`Tema no encontrado: ${topicId}`);
  }

  const responses = topic.questions.map((q) => (answers[q.id] ?? '').trim());
  const nonEmptyCount = responses.filter((r) => r.length >= 15).length;
  const avgLength =
    responses.reduce((acc, r) => acc + r.length, 0) / Math.max(1, responses.length);

  const combinedText = responses.join(' ').toLowerCase();

  const operationalKeywords = [
    'indicador',
    'kpi',
    'control',
    'organigrama',
    'erp',
    'sistema',
    'proceso',
    'iso',
    'six sigma',
    'okr',
    'smart',
    'benchmarking',
    'flujo',
    'datos',
    'calidad',
    'decisión',
    'tablero',
    'tecnolog',
  ];
  const ethicalKeywords = [
    'ética',
    'valor',
    'código',
    'transparencia',
    'justicia',
    'virtud',
    'denuncia',
    'confidencial',
    'integridad',
    'respeto',
    'equidad',
    'clima',
    'responsabilidad',
    'prudencia',
  ];

  const opHits = operationalKeywords.filter((k) => combinedText.includes(k)).length;
  const ethHits = ethicalKeywords.filter((k) => combinedText.includes(k)).length;

  const lengthBonus = Math.min(35, Math.round(avgLength / 8));
  const completenessScore = Math.round((nonEmptyCount / topic.questions.length) * 45);
  const depthBonus = Math.min(20, (opHits + ethHits) * 3);

  const qualityScore = clampScore(completenessScore + lengthBonus + depthBonus, 25, 96);
  const operationalMaturityScore = clampScore(42 + opHits * 6 + lengthBonus * 0.6, 30, 94);
  const ethicalMaturityScore = clampScore(40 + ethHits * 7 + lengthBonus * 0.6, 30, 95);

  const qualityLabel: TopicEvaluation['qualityLabel'] =
    qualityScore >= 85
      ? 'Excelente'
      : qualityScore >= 70
      ? 'Satisfactorio'
      : qualityScore >= 50
      ? 'En desarrollo'
      : 'Inicial';

  const suggestedRubricAdjustments: Partial<Record<RubricCriterionId, RubricLevel>> = {};
  const levelFromQuality: RubricLevel =
    qualityScore >= 85 ? 4 : qualityScore >= 70 ? 3 : qualityScore >= 50 ? 2 : 1;

  for (const q of topic.questions) {
    for (const link of q.rubricLinks) {
      suggestedRubricAdjustments[link] = levelFromQuality;
    }
  }

  return {
    topicId,
    evaluatedAt: new Date().toISOString(),
    source: 'heuristic',
    qualityScore,
    qualityLabel,
    operationalMaturityLevel: toMaturityLevel(operationalMaturityScore),
    operationalMaturityScore,
    operationalDiagnosis: `La auditoría de ${companyName || 'la empresa'} en ${topic.shortTitle} refleja una articulación ${
      operationalMaturityScore >= 70 ? 'consistente' : 'en consolidación'
    } entre estructura, flujo de información y toma de decisiones gerenciales.`,
    ethicalMaturityLevel: toMaturityLevel(ethicalMaturityScore),
    ethicalMaturityScore,
    ethicalDiagnosis: `El enfoque ético y de clima organizacional reportado muestra ${
      ethicalMaturityScore >= 70
        ? 'prácticas de integridad y alineación valorativa reconocibles'
        : 'oportunidades clave para formalizar normas, canales de escucha y control ético'
    }.`,
    strengths: [
      `Cobertura de ${nonEmptyCount} de ${topic.questions.length} reactivos de auditoría con contexto empresarial propio.`,
      avgLength >= 120
        ? 'Nivel de detalle analítico sólido en la descripción de procesos reales.'
        : 'Identificación directa de hallazgos operativos iniciales.',
    ],
    gaps: [
      nonEmptyCount < topic.questions.length
        ? 'Completar todos los reactivos pendientes del tema para lograr una valoración integral.'
        : 'Profundizar en métricas cuantitativas y evidencia verificable de control interno.',
      ethHits < 2
        ? 'Explicitar con mayor claridad cómo la ética y la transparencia respaldan las decisiones descritas.'
        : 'Documentar mecanismos periódicos de seguimiento y auditoría continua.',
    ],
    recommendations: [
      `Vincular los hallazgos de ${topic.shortTitle} con un tablero de indicadores del Sistema de Información Gerencial (SIG).`,
      'Respaldar las propuestas de mejora con fuentes académicas en formato APA 7.ª edición y validación de un especialista.',
    ],
    suggestedRubricAdjustments,
  };
}

export function buildHeuristicFinalEvaluation(
  state: AuditSessionState
): FinalRubricEvaluation {
  const stats = computeCompletionStats(state);
  const evals = Object.values(state.topicEvaluations).filter(Boolean) as TopicEvaluation[];

  const avgQuality =
    evals.length > 0
      ? evals.reduce((s, e) => s + e.qualityScore, 0) / evals.length
      : stats.completionPercent * 0.85;

  const avgOp =
    evals.length > 0
      ? Math.round(evals.reduce((s, e) => s + e.operationalMaturityScore, 0) / evals.length)
      : Math.round(45 + stats.completionPercent * 0.4);

  const avgEth =
    evals.length > 0
      ? Math.round(evals.reduce((s, e) => s + e.ethicalMaturityScore, 0) / evals.length)
      : Math.round(45 + stats.completionPercent * 0.4);

  const scoreFromText = (text: string, minCharsGood = 80): RubricLevel => {
    const len = text.trim().length;
    if (len >= minCharsGood * 1.6) return 4;
    if (len >= minCharsGood) return 3;
    if (len >= 20) return 2;
    return 1;
  };

  const baseLevel: RubricLevel =
    avgQuality >= 84 ? 4 : avgQuality >= 68 ? 3 : avgQuality >= 45 ? 2 : 1;

  const scores: Record<RubricCriterionId, RubricLevel> = {
    a: baseLevel,
    b: baseLevel,
    c: scoreFromText(state.profile.techResourcesDetail, 70),
    d: scoreFromText(state.profile.specialistBacking, 60),
    e: baseLevel,
    f: scoreFromText(state.profile.collaborativeTeamNotes, 60),
    g: stats.completionPercent >= 80 ? 4 : stats.completionPercent >= 50 ? 3 : 2,
    h: scoreFromText(state.profile.apaReferences, 70),
    i: avgQuality >= 78 ? 4 : avgQuality >= 60 ? 3 : 2,
    j: scoreFromText(state.profile.teacherFeedbackApplied, 50),
  };

  const justifications: Record<RubricCriterionId, string> = {
    a: 'Evaluado según el alineamiento demostrado entre los procesos auditados, la DPO y los objetivos estratégicos.',
    b: 'Basado en el análisis de variables competitivas, regulatorias y tecnológicas del entorno empresarial.',
    c: 'Calculado a partir del detalle de hardware, software, conectividad e infraestructura tecnológica propuesta.',
    d: 'Evaluado según la fundamentación técnica y respaldo de especialista documentado en la auditoría.',
    e: 'Medido según la respuesta tecnológica propuesta frente a las demandas digitales actuales del sector.',
    f: 'Valorado mediante la integración del trabajo colaborativo entre equipos y áreas en la organización.',
    g: 'Refleja el aprovechamiento tecnológico en la estructuración digital, analítica y presentación de la propuesta.',
    h: 'Verificado según la estructura y consistencia de las citas y referencias bibliográficas en formato APA 7.ª ed.',
    i: 'Evaluado por la claridad gramatical, precisión terminológica administrativa y coherencia de redacción.',
    j: 'Determinado según la incorporación explícita de recomendaciones y retroalimentación docente.',
  };

  const totalScore = computeRubricTotal(scores);

  const companyLabel = (state.profile.companyName || 'la empresa').replace(/\.+$/, '');

  return {
    evaluatedAt: new Date().toISOString(),
    source: 'heuristic',
    scores,
    justifications,
    totalScore,
    executiveSummary: `Auditoría integral realizada por ${
      state.profile.studentName || 'el estudiante'
    } sobre ${companyLabel}. Con un avance de ${
      stats.answeredCount
    }/${stats.totalQuestions} reactivos, se registra una calificación global de ${totalScore}/40 puntos, madurez operativa de ${avgOp}/100 y madurez ética de ${avgEth}/100.`,
    overallEthicalMaturity: avgEth,
    overallOperationalMaturity: avgOp,
  };
}

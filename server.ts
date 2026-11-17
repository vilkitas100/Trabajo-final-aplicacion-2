import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { AUDIT_TOPICS } from './src/data/auditCurriculum.ts';
import { RUBRIC_CRITERIA } from './src/data/rubricData.ts';
import {
  buildHeuristicFinalEvaluation,
  buildHeuristicTopicEvaluation,
  clampScore,
  computeRubricTotal,
  toMaturityLevel,
} from './src/utils/auditLogic.ts';
import type {
  AuditSessionState,
  FinalRubricEvaluation,
  RubricCriterionId,
  RubricLevel,
  TopicEvaluation,
  TopicId,
} from './src/types/audit.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, aiConfigured: Boolean(getGeminiClient()) });
  });

  app.post('/api/audit/evaluate-topic', async (req, res) => {
    const { topicId, answers, profile } = req.body as {
      topicId: TopicId;
      answers: Record<string, string>;
      profile: AuditSessionState['profile'];
    };

    const topic = AUDIT_TOPICS.find((t) => t.id === topicId);
    if (!topic) {
      res.status(400).json({ error: 'Tema inválido para evaluación.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = buildHeuristicTopicEvaluation(
        topicId,
        answers ?? {},
        profile?.companyName ?? ''
      );
      res.json({ evaluation: fallback, notice: 'Evaluación generada con motor analítico local.' });
      return;
    }

    try {
      const qaBlock = topic.questions
        .map((q, idx) => {
          const ans = (answers?.[q.id] ?? '').trim() || '(Sin respuesta proporcionada)';
          return `Pregunta ${idx + 1} [${q.subtopicRef}]: ${q.prompt}\nRespuesta del estudiante: ${ans}`;
        })
        .join('\n\n');

      const prompt = `Evalúa las siguientes respuestas de auditoría administrativa universitaria realizadas por ${
        profile?.studentName || 'el estudiante'
      } sobre la empresa "${profile?.companyName || 'Empresa auditada'}" (Sector: ${
        profile?.companySector || 'No especificado'
      }, Tamaño: ${profile?.companySize || 'No especificado'}).

Tema auditado: ${topic.title}
Ejes estructurales del curso: Organigrama, flujo de información, control interno y toma de decisiones gerenciales.

${qaBlock}

Instrucciones de evaluación:
1. Califica la calidad académica y analítica de las respuestas del estudiante (qualityScore de 0 a 100).
2. Evalúa el nivel de madurez operativa de la empresa auditada según la evidencia descrita (operationalMaturityScore 0-100 y diagnóstico breve).
3. Evalúa el nivel de madurez ética de la organización (ethicalMaturityScore 0-100 y diagnóstico breve).
4. Identifica 2 a 3 fortalezas concretas, 2 a 3 brechas o riesgos, y 2 a 3 recomendaciones prácticas para el Sistema de Información Gerencial (SIG).
5. Redacta todo en español académico claro, constructivo y riguroso.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres un agente auditor experto en administración de empresas, sistemas de información gerencial, comportamiento organizacional y ética corporativa para el curso de la Profesora Liz Acuña. Evalúas con objetividad académica y rigor empresarial.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              qualityScore: { type: Type.INTEGER },
              qualityLabel: { type: Type.STRING },
              operationalMaturityScore: { type: Type.INTEGER },
              operationalDiagnosis: { type: Type.STRING },
              ethicalMaturityScore: { type: Type.INTEGER },
              ethicalDiagnosis: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'qualityScore',
              'qualityLabel',
              'operationalMaturityScore',
              'operationalDiagnosis',
              'ethicalMaturityScore',
              'ethicalDiagnosis',
              'strengths',
              'gaps',
              'recommendations',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        qualityScore?: number;
        qualityLabel?: string;
        operationalMaturityScore?: number;
        operationalDiagnosis?: string;
        ethicalMaturityScore?: number;
        ethicalDiagnosis?: string;
        strengths?: string[];
        gaps?: string[];
        recommendations?: string[];
      };

      const qScore = clampScore(parsed.qualityScore ?? 75, 10, 100);
      const opScore = clampScore(parsed.operationalMaturityScore ?? 70, 10, 100);
      const ethScore = clampScore(parsed.ethicalMaturityScore ?? 70, 10, 100);

      const normalizedLabel: TopicEvaluation['qualityLabel'] =
        qScore >= 85
          ? 'Excelente'
          : qScore >= 70
          ? 'Satisfactorio'
          : qScore >= 50
          ? 'En desarrollo'
          : 'Inicial';

      const levelFromQuality: RubricLevel =
        qScore >= 85 ? 4 : qScore >= 70 ? 3 : qScore >= 50 ? 2 : 1;

      const suggestedRubricAdjustments: Partial<Record<RubricCriterionId, RubricLevel>> = {};
      for (const q of topic.questions) {
        for (const link of q.rubricLinks) {
          suggestedRubricAdjustments[link] = levelFromQuality;
        }
      }

      const evaluation: TopicEvaluation = {
        topicId,
        evaluatedAt: new Date().toISOString(),
        source: 'gemini-ai',
        qualityScore: qScore,
        qualityLabel: normalizedLabel,
        operationalMaturityLevel: toMaturityLevel(opScore),
        operationalMaturityScore: opScore,
        operationalDiagnosis:
          parsed.operationalDiagnosis ||
          'Diagnóstico operativo generado sobre la evidencia de procesos del estudiante.',
        ethicalMaturityLevel: toMaturityLevel(ethScore),
        ethicalMaturityScore: ethScore,
        ethicalDiagnosis:
          parsed.ethicalDiagnosis ||
          'Diagnóstico ético generado sobre la gobernanza y valores declarados.',
        strengths: (parsed.strengths ?? []).slice(0, 4),
        gaps: (parsed.gaps ?? []).slice(0, 4),
        recommendations: (parsed.recommendations ?? []).slice(0, 4),
        suggestedRubricAdjustments,
      };

      res.json({ evaluation });
    } catch (error) {
      console.error('Gemini topic evaluation error:', error);
      const fallback = buildHeuristicTopicEvaluation(
        topicId,
        answers ?? {},
        profile?.companyName ?? ''
      );
      res.json({
        evaluation: fallback,
        notice: 'Se utilizó la evaluación analítica local debido a una interrupción temporal del servicio de IA.',
      });
    }
  });

  app.post('/api/audit/evaluate-final', async (req, res) => {
    const state = req.body as AuditSessionState;
    if (!state || !state.profile) {
      res.status(400).json({ error: 'Datos de auditoría incompletos.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = buildHeuristicFinalEvaluation(state);
      res.json({ finalEvaluation: fallback, notice: 'Rúbrica calculada con motor analítico local.' });
      return;
    }

    try {
      const topicSummary = AUDIT_TOPICS.map((t) => {
        const qa = t.questions
          .map((q) => `- ${q.prompt}\n  Resp: ${(state.answers[q.id] ?? '').trim() || '(Vacía)'}`)
          .join('\n');
        return `### ${t.title}\n${qa}`;
      }).join('\n\n');

      const rubricDesc = RUBRIC_CRITERIA.map(
        (c) => `${c.fullTitle}\n4: ${c.descriptors[4]}\n3: ${c.descriptors[3]}\n2: ${c.descriptors[2]}\n1: ${c.descriptors[1]}`
      ).join('\n\n');

      const prompt = `Evalúa integralmente la auditoría final del estudiante "${
        state.profile.studentName
      }" sobre la empresa "${state.profile.companyName}" (${state.profile.companySector}).

Contexto complementario del informe SIG:
- Resumen Propuesta SIG: ${state.profile.sigProposalSummary || '(No ingresado)'}
- Recursos Tecnológicos: ${state.profile.techResourcesDetail || '(No ingresado)'}
- Respaldo de Especialista: ${state.profile.specialistBacking || '(No ingresado)'}
- Trabajo Colaborativo: ${state.profile.collaborativeTeamNotes || '(No ingresado)'}
- Retroalimentación Docente (Prof. Liz Acuña): ${state.profile.teacherFeedbackApplied || '(No ingresado)'}
- Referencias APA: ${state.profile.apaReferences || '(No ingresado)'}

Respuestas por tema:
${topicSummary}

Rúbrica oficial (escala 1 a 4 por cada criterio a–j, total sobre 40 puntos):
${rubricDesc}

Devuelve un JSON con:
- scores: objeto con claves "a".."j" y valores enteros 1, 2, 3 o 4.
- justifications: objeto con claves "a".."j" explicando brevemente cada puntaje en español.
- overallOperationalMaturity (0-100)
- overallEthicalMaturity (0-100)
- executiveSummary (párrafo de síntesis gerencial y académica de 3-4 oraciones).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres el agente evaluador académico de la cátedra de la Profesora Liz Acuña. Calificas con exactitud la rúbrica de 40 puntos (criterios a–j) y determinas la madurez ética y operativa de la organización.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  a: { type: Type.INTEGER },
                  b: { type: Type.INTEGER },
                  c: { type: Type.INTEGER },
                  d: { type: Type.INTEGER },
                  e: { type: Type.INTEGER },
                  f: { type: Type.INTEGER },
                  g: { type: Type.INTEGER },
                  h: { type: Type.INTEGER },
                  i: { type: Type.INTEGER },
                  j: { type: Type.INTEGER },
                },
                required: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
              },
              justifications: {
                type: Type.OBJECT,
                properties: {
                  a: { type: Type.STRING },
                  b: { type: Type.STRING },
                  c: { type: Type.STRING },
                  d: { type: Type.STRING },
                  e: { type: Type.STRING },
                  f: { type: Type.STRING },
                  g: { type: Type.STRING },
                  h: { type: Type.STRING },
                  i: { type: Type.STRING },
                  j: { type: Type.STRING },
                },
                required: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
              },
              overallOperationalMaturity: { type: Type.INTEGER },
              overallEthicalMaturity: { type: Type.INTEGER },
              executiveSummary: { type: Type.STRING },
            },
            required: [
              'scores',
              'justifications',
              'overallOperationalMaturity',
              'overallEthicalMaturity',
              'executiveSummary',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        scores?: Record<string, number>;
        justifications?: Record<string, string>;
        overallOperationalMaturity?: number;
        overallEthicalMaturity?: number;
        executiveSummary?: string;
      };

      const clampLevel = (val: number | undefined): RubricLevel => {
        const n = Math.round(val ?? 3);
        if (n <= 1) return 1;
        if (n === 2) return 2;
        if (n === 3) return 3;
        return 4;
      };

      const scores: Record<RubricCriterionId, RubricLevel> = {
        a: clampLevel(parsed.scores?.a),
        b: clampLevel(parsed.scores?.b),
        c: clampLevel(parsed.scores?.c),
        d: clampLevel(parsed.scores?.d),
        e: clampLevel(parsed.scores?.e),
        f: clampLevel(parsed.scores?.f),
        g: clampLevel(parsed.scores?.g),
        h: clampLevel(parsed.scores?.h),
        i: clampLevel(parsed.scores?.i),
        j: clampLevel(parsed.scores?.j),
      };

      const justifications: Record<RubricCriterionId, string> = {
        a: parsed.justifications?.a || 'Ajuste estratégico evaluado por IA.',
        b: parsed.justifications?.b || 'Consideración del entorno evaluada por IA.',
        c: parsed.justifications?.c || 'Recursos tecnológicos evaluados por IA.',
        d: parsed.justifications?.d || 'Respaldo de especialista evaluado por IA.',
        e: parsed.justifications?.e || 'Respuesta a tecnología imperante evaluada por IA.',
        f: parsed.justifications?.f || 'Trabajo colaborativo evaluado por IA.',
        g: parsed.justifications?.g || 'Uso de la tecnología evaluado por IA.',
        h: parsed.justifications?.h || 'Uso del APA evaluado por IA.',
        i: parsed.justifications?.i || 'Estilo y redacción evaluados por IA.',
        j: parsed.justifications?.j || 'Retroalimentación docente evaluada por IA.',
      };

      const finalEvaluation: FinalRubricEvaluation = {
        evaluatedAt: new Date().toISOString(),
        source: 'gemini-ai',
        scores,
        justifications,
        totalScore: computeRubricTotal(scores),
        executiveSummary:
          parsed.executiveSummary ||
          'Evaluación integral completada por el Agente IA de Auditoría Administrativa.',
        overallOperationalMaturity: clampScore(
          parsed.overallOperationalMaturity ?? 75,
          10,
          100
        ),
        overallEthicalMaturity: clampScore(
          parsed.overallEthicalMaturity ?? 75,
          10,
          100
        ),
      };

      res.json({ finalEvaluation });
    } catch (error) {
      console.error('Gemini final evaluation error:', error);
      const fallback = buildHeuristicFinalEvaluation(state);
      res.json({
        finalEvaluation: fallback,
        notice: 'Se utilizó la evaluación analítica local debido a una interrupción temporal del servicio de IA.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Audit server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

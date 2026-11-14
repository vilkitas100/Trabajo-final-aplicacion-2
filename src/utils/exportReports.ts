import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AUDIT_TOPICS } from '../data/auditCurriculum';
import { MAX_RUBRIC_SCORE, RUBRIC_CRITERIA, SIG_RUBRIC_TITLE } from '../data/rubricData';
import { AuditSessionState, FinalRubricEvaluation } from '../types/audit';
import {
  buildHeuristicFinalEvaluation,
  getQualitativeGrade,
} from './auditLogic';

function sanitizeFileSlug(text: string): string {
  return (text || 'auditoria')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resolveFinalEval(state: AuditSessionState): FinalRubricEvaluation {
  return state.finalEvaluation ?? buildHeuristicFinalEvaluation(state);
}

export async function downloadWordReport(state: AuditSessionState): Promise<void> {
  const finalEval = resolveFinalEval(state);
  const grade = getQualitativeGrade(finalEval.totalScore);

  const children: Array<Paragraph | Table> = [];

  // Cover Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'TRABAJO FINAL #2 · CÁTEDRA PROFESORA LIZ ACUÑA',
          bold: true,
          size: 22,
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Auditoría de Dinámica de Procesos Administrativos y Propuesta de Sistema de Información Gerencial',
          bold: true,
          size: 32,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `Estudiante: ${state.profile.studentName || 'No especificado'}  |  Matrícula: ${
            state.profile.studentId || 'N/A'
          }\nEmpresa auditada: ${state.profile.companyName || 'No especificada'} (${
            state.profile.companySector || 'Sector no especificado'
          })\nFecha: ${state.profile.auditDate}  |  Calificación Final: ${
            finalEval.totalScore
          }/${MAX_RUBRIC_SCORE} pts (${grade.percentage}% - ${grade.label})`,
          size: 22,
          color: '334155',
        }),
      ],
    })
  );

  // Executive Summary & Maturity
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: '1. Resumen Ejecutivo y Madurez Organizacional', bold: true })],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: finalEval.executiveSummary, size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Madurez Operativa: ${finalEval.overallOperationalMaturity}/100  ·  Madurez Ética: ${finalEval.overallEthicalMaturity}/100  ·  Clasificación: ${grade.maturityBand}`,
          bold: true,
          size: 21,
          color: '1E3A8A',
        }),
      ],
    })
  );

  // 5 Topics Development
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: '2. Desarrollo de Auditoría por Temas (Organigrama, Flujo de Información, Control Interno y Decisiones)',
          bold: true,
        }),
      ],
    })
  );

  for (const topic of AUDIT_TOPICS) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: topic.title, bold: true, color: '1E3A8A' })],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: topic.intro, italics: true, size: 20, color: '475569' })],
      })
    );

    for (const q of topic.questions) {
      const answer = (state.answers[q.id] ?? '').trim() || 'Sin respuesta registrada.';
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({ text: `[${q.subtopicRef}] `, bold: true, size: 20, color: '1E3A8A' }),
            new TextRun({ text: q.prompt, bold: true, size: 21 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: answer, size: 21 })],
        })
      );
    }

    const topicEval = state.topicEvaluations[topic.id];
    if (topicEval) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 140 },
          children: [
            new TextRun({
              text: `Dictamen IA del Tema: Calidad ${topicEval.qualityScore}/100 (${topicEval.qualityLabel}) | Madurez Operativa Nivel ${topicEval.operationalMaturityLevel}/5 (${topicEval.operationalMaturityScore}/100) | Madurez Ética Nivel ${topicEval.ethicalMaturityLevel}/5 (${topicEval.ethicalMaturityScore}/100). Diagnóstico: ${topicEval.operationalDiagnosis} ${topicEval.ethicalDiagnosis}`,
              size: 20,
              color: '334155',
            }),
          ],
        })
      );
    }
  }

  // SIG Proposal & Complementary Academic Pillars
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: '3. Propuesta de Sistema de Información Gerencial (SIG) y Sustento Técnico',
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Propuesta Integral SIG: ', bold: true }),
        new TextRun({ text: state.profile.sigProposalSummary || 'No especificada.' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Determinación de Recursos Tecnológicos: ', bold: true }),
        new TextRun({ text: state.profile.techResourcesDetail || 'No especificada.' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Respaldo de Especialista: ', bold: true }),
        new TextRun({ text: state.profile.specialistBacking || 'No especificado.' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Trabajo Colaborativo: ', bold: true }),
        new TextRun({ text: state.profile.collaborativeTeamNotes || 'No especificado.' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: 'Uso de la Retroalimentación Docente: ', bold: true }),
        new TextRun({ text: state.profile.teacherFeedbackApplied || 'No especificada.' }),
      ],
    })
  );

  // Rubric Table (40 points)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: `4. ${SIG_RUBRIC_TITLE}`, bold: true })],
    })
  );

  const tableRows: TableRow[] = [
    new TableRow({
      children: ['Criterio', 'Nivel (1–4)', 'Descriptor Aplicado', 'Justificación Evaluativa'].map(
        (headerText) =>
          new TableCell({
            shading: { fill: '1E3A8A' },
            children: [
              new Paragraph({
                children: [new TextRun({ text: headerText, bold: true, color: 'FFFFFF', size: 19 })],
              }),
            ],
          })
      ),
    }),
    ...RUBRIC_CRITERIA.map((criterion) => {
      const level = finalEval.scores[criterion.id];
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: criterion.label, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${level} / 4`, bold: true, size: 19 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 36, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: criterion.descriptors[level], size: 18 })] })],
          }),
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: finalEval.justifications[criterion.id] || '', size: 18 })],
              }),
            ],
          }),
        ],
      });
    }),
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL RÚBRICA', bold: true, size: 20 })] })],
        }),
        new TableCell({
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${finalEval.totalScore} / ${MAX_RUBRIC_SCORE}`,
                  bold: true,
                  size: 20,
                  color: '1E3A8A',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Calificación Cualitativa: ${grade.label} (${grade.percentage}%) — ${grade.maturityBand}`,
                  bold: true,
                  size: 19,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      },
      rows: tableRows,
    })
  );

  // APA References
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: '5. Referencias Bibliográficas (Formato APA)', bold: true })],
    })
  );

  const refs = (state.profile.apaReferences || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (refs.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'No se registraron referencias bibliográficas.', italics: true })],
      })
    );
  } else {
    for (const ref of refs) {
      children.push(
        new Paragraph({
          indent: { left: 480, hanging: 480 },
          spacing: { after: 100 },
          children: [new TextRun({ text: ref, size: 21 })],
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const slug = sanitizeFileSlug(state.profile.companyName || state.profile.studentName);
  triggerBlobDownload(blob, `Informe_Auditoria_${slug}.docx`);
}

export function downloadPdfReport(state: AuditSessionState): void {
  const finalEval = resolveFinalEval(state);
  const grade = getQualitativeGrade(finalEval.totalScore);
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  let y = 52;

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage();
      y = 48;
    }
  };

  // Header Banner
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y - 16, pageWidth - margin * 2, 68, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TRABAJO FINAL #2  ·  PROFESORA LIZ ACUÑA', margin + 16, y + 4);
  doc.setFontSize(14);
  doc.text(
    'Auditoría de Dinámica de Procesos Administrativos y Propuesta SIG',
    margin + 16,
    y + 26
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `Estudiante: ${state.profile.studentName || 'N/A'}  |  Empresa: ${
      state.profile.companyName || 'N/A'
    }  |  Nota: ${finalEval.totalScore}/40 (${grade.percentage}%)`,
    margin + 16,
    y + 42
  );

  y += 74;
  doc.setTextColor(15, 23, 42);

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Resumen Ejecutivo y Madurez Ética / Operativa', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(
    finalEval.executiveSummary,
    pageWidth - margin * 2
  );
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 8;

  doc.setFont('helvetica', 'bold');
  doc.text(
    `Madurez Operativa: ${finalEval.overallOperationalMaturity}/100   ·   Madurez Ética: ${finalEval.overallEthicalMaturity}/100   ·   ${grade.maturityBand}`,
    margin,
    y
  );
  y += 24;

  // Topics Q&A
  doc.setFontSize(12);
  doc.text('2. Hallazgos de Auditoría por Tema', margin, y);
  y += 16;

  for (const topic of AUDIT_TOPICS) {
    ensureSpace(64);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(topic.title, margin, y);
    y += 14;
    doc.setTextColor(15, 23, 42);

    for (const q of topic.questions) {
      ensureSpace(56);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const qLines = doc.splitTextToSize(
        `[${q.subtopicRef}] ${q.prompt}`,
        pageWidth - margin * 2
      );
      doc.text(qLines, margin, y);
      y += qLines.length * 12 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const ansText = (state.answers[q.id] ?? '').trim() || 'Sin respuesta registrada.';
      const aLines = doc.splitTextToSize(ansText, pageWidth - margin * 2);
      for (const line of aLines) {
        ensureSpace(14);
        doc.text(line, margin, y);
        y += 12;
      }
      y += 6;
    }

    const tEval = state.topicEvaluations[topic.id];
    if (tEval) {
      ensureSpace(40);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const evalLines = doc.splitTextToSize(
        `Dictamen Agente IA — Calidad: ${tEval.qualityScore}/100 (${tEval.qualityLabel}) | Operativa: ${tEval.operationalMaturityScore}/100 | Ética: ${tEval.ethicalMaturityScore}/100. ${tEval.operationalDiagnosis}`,
        pageWidth - margin * 2
      );
      doc.text(evalLines, margin, y);
      y += evalLines.length * 11 + 10;
      doc.setTextColor(15, 23, 42);
    }
  }

  // SIG Proposal details
  ensureSpace(140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Propuesta de Sistema de Información Gerencial (SIG)', margin, y);
  y += 16;

  const sigFields: Array<[string, string]> = [
    ['Resumen Propuesta SIG', state.profile.sigProposalSummary],
    ['Recursos Tecnológicos', state.profile.techResourcesDetail],
    ['Respaldo de Especialista', state.profile.specialistBacking],
    ['Trabajo Colaborativo', state.profile.collaborativeTeamNotes],
    ['Retroalimentación Docente', state.profile.teacherFeedbackApplied],
  ];

  for (const [label, val] of sigFields) {
    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`${label}:`, margin, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(val || 'No especificado.', pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 6;
  }

  // Rubric Table
  doc.addPage();
  y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`4. ${SIG_RUBRIC_TITLE} (Total: ${finalEval.totalScore} / 40 pts)`, margin, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
    head: [['Criterio', 'Pts', 'Descriptor del Nivel', 'Justificación']],
    body: [
      ...RUBRIC_CRITERIA.map((c) => {
        const lvl = finalEval.scores[c.id];
        return [
          c.label,
          `${lvl}/4`,
          c.descriptors[lvl],
          finalEval.justifications[c.id] || '',
        ];
      }),
      [
        'TOTAL GENERAL',
        `${finalEval.totalScore}/40`,
        `${grade.label} (${grade.percentage}%)`,
        grade.maturityBand,
      ],
    ],
  });

  // APA References
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
    ?.finalY ?? 520;
  let refY = finalY + 28;
  if (refY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    refY = 48;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('5. Referencias Bibliográficas (APA)', margin, refY);
  refY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const apaLines = doc.splitTextToSize(
    state.profile.apaReferences || 'Sin referencias registradas.',
    pageWidth - margin * 2
  );
  doc.text(apaLines, margin, refY);

  const slug = sanitizeFileSlug(state.profile.companyName || state.profile.studentName);
  doc.save(`Informe_Auditoria_${slug}.pdf`);
}

export function downloadCertificatePdf(state: AuditSessionState): void {
  const finalEval = resolveFinalEval(state);
  const grade = getQualitativeGrade(finalEval.totalScore);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Outer Frame
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(4);
  doc.rect(28, 28, w - 56, h - 56);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(1.5);
  doc.rect(38, 38, w - 76, h - 76);

  doc.setTextColor(30, 58, 138);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('TRABAJO FINAL #2  ·  CÁTEDRA DE PROCESOS ADMINISTRATIVOS', w / 2, 96, {
    align: 'center',
  });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(30);
  doc.text('CERTIFICADO DE FINALIZACIÓN DE AUDITORÍA', w / 2, 146, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('Se certifica que el/la estudiante:', w / 2, 194, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 58, 138);
  doc.text(state.profile.studentName || 'Estudiante', w / 2, 236, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(w / 2 - 190, 250, w / 2 + 190, 250);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  const bodyText = `Ha completado satisfactoriamente todas las etapas de la Auditoría de Dinámica de Procesos Administrativos en la empresa "${
    state.profile.companyName || 'Empresa Auditada'
  }", abarcando Dirección, Comunicación, Control, Administración por Objetivos, Comportamiento Organizacional, Enfoques Modernos y Ética Corporativa.`;
  const wrapped = doc.splitTextToSize(bodyText, w - 180);
  doc.text(wrapped, w / 2, 286, { align: 'center' });

  // Score Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(w / 2 - 220, 356, 440, 74, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(
    `CALIFICACIÓN FINAL: ${finalEval.totalScore} / 40 PUNTOS (${grade.percentage}%)`,
    w / 2,
    388,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Desempeño: ${grade.label}  ·  Madurez Operativa: ${finalEval.overallOperationalMaturity}/100  ·  Madurez Ética: ${finalEval.overallEthicalMaturity}/100`,
    w / 2,
    412,
    { align: 'center' }
  );

  // Signatures
  doc.setDrawColor(100, 116, 139);
  doc.line(130, 502, 330, 502);
  doc.line(w - 330, 502, w - 130, 502);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Profesora Liz Acuña', 230, 520, { align: 'center' });
  doc.text(`Emitido el ${state.profile.auditDate}`, w - 230, 520, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Docente Titular · Auditoría de Procesos Administrativos', 230, 536, {
    align: 'center',
  });
  doc.text(`ID Estudiante: ${state.profile.studentId || 'Verificado'}`, w - 230, 536, {
    align: 'center',
  });

  const slug = sanitizeFileSlug(state.profile.studentName || 'estudiante');
  doc.save(`Certificado_Auditoria_${slug}.pdf`);
}

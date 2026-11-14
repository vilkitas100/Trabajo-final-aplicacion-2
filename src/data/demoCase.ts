import { AuditSessionState } from '../types/audit';
import {
  buildHeuristicFinalEvaluation,
  buildHeuristicTopicEvaluation,
} from '../utils/auditLogic';
import { AUDIT_TOPICS } from './auditCurriculum';

export function createDemoAuditSession(): AuditSessionState {
  const answers: Record<string, string> = {
    't1-q1':
      'Logística del Istmo S.A. opera bajo un organigrama funcional de cuatro niveles: Gerencia General, tres Direcciones (Operaciones, Comercial y Finanzas), Jefaturas de Turno y Supervisores de Ruta. El estilo de dirección predominante es participativo en la planificación semanal, pero la toma de decisiones gerenciales sobre compras urgentes y descuentos sigue fuertemente centralizada en Gerencia General, generando cuellos de botella de hasta 36 horas.',
    't1-q2':
      'El flujo de información entre Ventas, Bodega y Despacho se apoya en un ERP legado combinado con grupos informales de mensajería instantánea y hojas de cálculo locales. Esto produce inconsistencias de inventario (diferencias de 4.2% mensual) y barreras horizontales entre áreas, debilitando el trabajo colaborativo y la trazabilidad de pedidos críticos.',
    't1-q3':
      'El control interno cuenta con arqueos semanales de inventario, conciliaciones bancarias diarias y un indicador de entregas a tiempo (OTIF actualmente en 86%). Sin embargo, predominan los controles posteriores (reactivos) sobre los preventivos: no existen alertas automáticas antes de que un lote supere su límite de despacho ni tableros concurrentes para la supervisión.',
    't1-q4':
      'La principal debilidad gerencial radica en la fragmentación de datos entre áreas. Se propone implementar un Sistema de Información Gerencial (SIG) modular en la nube conectado por API al ERP, equipado con tabletas industriales en bodega, servidores cloud redundantes y tableros Power BI con asesoría de un especialista en arquitectura de datos.',
    't2-q1':
      'La empresa define metas anuales globales (crecer 12% en facturación y mantener OTIF > 92%), pero estas raramente se traducen en objetivos SMART negociados con supervisores y analistas. Los mandos operativos perciben cuotas impuestas verticalmente sin claridad sobre cómo su trabajo diario impacta el plan estratégico.',
    't2-q2':
      'El modelo actual carece de un ciclo formal de Dirección por Objetivos (DPO) como los de Odiorne o Humble. Las evaluaciones de desempeño se realizan una sola vez al año de manera subjetiva, sin revisiones trimestrales de avance ni reasignación oportuna de recursos tecnológicos cuando cambian los volúmenes de carga.',
    't2-q3':
      'Considerando la presión competitiva del sector logístico, resulta altamente viable evolucionar hacia un esquema post-DPO basado en OKRs trimestrales vinculados a un Cuadro de Mando Integral (Balanced Scorecard) en tiempo real, permitiendo alinear objetivos financieros, de cliente, procesos internos y aprendizaje organizacional.',
    't3-q1':
      'La rotación anual en el área de despacho y servicio al cliente alcanza el 24%, acompañada de resistencia al cambio cada vez que se introducen nuevos formatos de control. Desde el comportamiento organizacional, esta rotación interrumpe la curva de aprendizaje del proceso administrativo y eleva la tasa de errores en facturación.',
    't3-q2':
      'A nivel individual existe alto compromiso técnico, pero a nivel grupal persisten conflictos entre Comercial (que promete entregas urgentes) y Operaciones (que prioriza consolidación de rutas). A nivel organizacional falta una plataforma colaborativa compartida y rituales de coordinación interdepartamental.',
    't3-q3':
      'Las tres variables del entorno empresarial más críticas son: 1) la exigencia de rastreo en tiempo real por parte de clientes corporativos, 2) las nuevas normativas de facturación electrónica y seguridad vial, y 3) la escasez de talento capacitado en analítica operativa. La empresa responde parcialmente pero requiere capacitación digital continua.',
    't4-q1':
      'El empoderamiento actual es bajo: los jefes de turno deben solicitar autorización gerencial para reprogramar rutas menores o resolver reclamos de menos de $100. Además, tras un recorte reactivo (downsizing) hace dos años, quedaron duplicidades administrativas que exigen un rightsizing planificado para aplanar el organigrama.',
    't4-q2':
      'La organización dispone de manuales operativos básicos, pero no cuenta con certificación ISO 9001 ni aplica metodología Six Sigma (DMAIC) para reducir variabilidad en tiempos de carga. Se requiere un software de gestión de no conformidades y la validación de un ingeniero industrial especialista en calidad.',
    't4-q3':
      'Al comparar mediante benchmarking con los dos operadores líderes del país, se observa una brecha tecnológica en trazabilidad GPS integrada y portales de autogestión. Actualmente se terceriza el soporte de TI y parte del transporte (outsourcing), pero los contratos carecen de acuerdos de nivel de servicio (SLA) estrictos y auditoría de seguridad de la información.',
    't5-q1':
      'Aunque la empresa declara valores de integridad, transparencia y respeto, el sistema de comisiones comerciales premia exclusivamente el volumen vendido sin ponderar reclamos éticos o promesas incumplidas, generando una brecha en la Administración por Valores.',
    't5-q2':
      'Un dilema ético recurrente ocurre cuando un cliente estratégico solicita alterar la fecha de recepción en guías de despacho para evitar penalidades. Desde un enfoque deontológico, de justicia procedimental y ética de la virtud (prudencia y honestidad), la gerencia debe rechazar toda alteración documental y transparentar las métricas reales.',
    't5-q3':
      'El clima ético es percibido como pragmático-normativo, pero carece de un Código de Ética actualizado y operativo dentro del organigrama. Se recomienda crear un Comité de Ética independiente, habilitar un canal confidencial de denuncias integrado al SIG y vincular los registros de auditoría al control interno y la toma de decisiones gerenciales.',
  };

  const baseState: AuditSessionState = {
    version: 1,
    profile: {
      studentName: 'Sofía Mendoza Rivera',
      studentId: '2024-0842-ADM',
      companyName: 'Logística del Istmo S.A.',
      companySector: 'Transporte, Almacenamiento y Cadena de Suministro',
      companySize: 'Mediana empresa (145 colaboradores)',
      auditDate: '2026-11-14',
      sigProposalSummary:
        'Implementación de un Sistema de Información Gerencial (SIG) modular en la nube conectado al ERP corporativo, con tableros Power BI para DPO/OKRs, módulo de control interno preventivo, registro de calidad ISO/Six Sigma y canal ético confidencial integrado a la gobernanza.',
      techResourcesDetail:
        'Infraestructura cloud híbrida (servidor PostgreSQL gestionado, API REST segura), licenciamiento Power BI Pro para 12 jefaturas, 18 tabletas industriales con escáner RFID para bodega, red Wi-Fi 6 empresarial y módulo web de canal ético con cifrado TLS.',
      specialistBacking:
        'Validación técnica del Ing. Carlos Villarreal (Especialista en Sistemas de Información y Certificación ISO 9001, registro profesional #8841), quien revisó la arquitectura de integración ERP-BI, los flujos de control interno y la factibilidad financiera a 18 meses.',
      collaborativeTeamNotes:
        'Auditoría elaborada mediante mesas de trabajo colaborativas entre las áreas de Operaciones, Talento Humano y Contraloría Interna, utilizando repositorios compartidos en la nube y sesiones semanales de validación interdepartamental.',
      teacherFeedbackApplied:
        'Se incorporaron las observaciones de la Profesora Liz Acuña respecto a: vincular explícitamente el organigrama con el flujo de información del SIG, cuantificar los indicadores de control interno preventivo y reforzar la articulación entre el Código de Ética y la toma de decisiones gerenciales.',
      apaReferences:
        'Chiavenato, I. (2019). Introducción a la teoría general de la administración (10.ª ed.). McGraw-Hill Education.\nDrucker, P. F. (2007). The practice of management. Routledge.\nRobbins, S. P., & Judge, T. A. (2022). Comportamiento organizacional (18.ª ed.). Pearson Educación.\nCortina, A. (2013). ¿Para qué sirve realmente la ética? Paidós.',
    },
    answers,
    topicEvaluations: {},
    finalEvaluation: null,
    lastSavedAt: new Date().toISOString(),
  };

  for (const topic of AUDIT_TOPICS) {
    baseState.topicEvaluations[topic.id] = buildHeuristicTopicEvaluation(
      topic.id,
      answers,
      baseState.profile.companyName
    );
  }
  baseState.finalEvaluation = buildHeuristicFinalEvaluation(baseState);

  return baseState;
}

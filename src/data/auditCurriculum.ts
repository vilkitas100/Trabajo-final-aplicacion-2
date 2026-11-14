import { AuditTopic } from '../types/audit';

export const AUDIT_TOPICS: AuditTopic[] = [
  {
    id: 'tema-1',
    number: 1,
    title: 'Tema 1. Dirección, Comunicación, Control y Arquitectura Administrativa',
    shortTitle: '1. Dirección y Control',
    intro:
      'Examina la fase dinámica del proceso administrativo en acción: cómo el liderazgo moviliza al talento humano, cómo fluye la información a través del organigrama y qué mecanismos de control interno aseguran decisiones gerenciales oportunas y alineadas a la estrategia.',
    structuralDimensions: [
      'Organigrama',
      'Flujo de información',
      'Control interno',
      'Toma de decisiones gerenciales',
    ],
    subtopics: [
      {
        code: 'e)',
        title: 'Dirección',
        summary:
          'Función ejecutiva orientada a guiar, motivar e integrar los esfuerzos del equipo hacia los objetivos organizacionales mediante liderazgo efectivo, supervisión y toma de decisiones.',
        keyConcepts: [
          'Estilos de liderazgo (transformacional, situacional, transaccional)',
          'Motivación laboral y delegación de autoridad',
          'Unidad de mando y coherencia en el organigrama',
        ],
        auditFocus:
          'Verificar si la estructura del organigrama facilita la toma de decisiones gerenciales sin cuellos de botella ni duplicidad de mandos.',
      },
      {
        code: 'f)',
        title: 'Comunicación',
        summary:
          'Proceso continuo de transmisión e interpretación de información estratégica y operativa entre niveles jerárquicos y áreas funcionales, determinante para el trabajo colaborativo.',
        keyConcepts: [
          'Flujos descendentes, ascendentes y horizontales',
          'Barreras semánticas, psicológicas y tecnológicas',
          'Canales digitales y Sistemas de Información Gerencial (SIG)',
        ],
        auditFocus:
          'Evaluar la trazabilidad del flujo de información entre departamentos y la eficacia de las herramientas tecnológicas de comunicación.',
      },
      {
        code: 'g)',
        title: 'Control',
        summary:
          'Sistema de verificación que mide el desempeño real frente a los estándares establecidos, detecta desviaciones e implementa acciones correctivas oportunas.',
        keyConcepts: [
          'Control preventivo, concurrente y de retroalimentación',
          'Indicadores clave de desempeño (KPIs) y control interno',
          'Auditoría operativa y aseguramiento de riesgos',
        ],
        auditFocus:
          'Comprobar la solidez del control interno y si los tableros de control alimentan la toma de decisiones gerenciales basadas en evidencia.',
      },
    ],
    questions: [
      {
        id: 't1-q1',
        topicId: 'tema-1',
        subtopicRef: 'e) Dirección · Organigrama',
        prompt:
          'Describe el organigrama actual de la empresa y analiza cómo el estilo de dirección influye en la toma de decisiones gerenciales cotidianas y estratégicas.',
        guidance:
          'Indica los niveles jerárquicos, si existe centralización excesiva o delegación efectiva, y presenta un ejemplo concreto de decisión reciente.',
        rubricLinks: ['a', 'f'],
        placeholder:
          'Ej.: La empresa posee una estructura funcional de 4 niveles (Gerencia General, 3 Direcciones y Jefaturas). La dirección combina liderazgo participativo en proyectos...',
      },
      {
        id: 't1-q2',
        topicId: 'tema-1',
        subtopicRef: 'f) Comunicación · Flujo de información',
        prompt:
          'Mapea el flujo de información entre las áreas operativas y la alta gerencia. ¿Qué canales tecnológicos utilizan y qué barreras de comunicación afectan el trabajo colaborativo?',
        guidance:
          'Detalla herramientas (ERP, CRM, intranet, mensajería), frecuencia de reportes y brechas detectadas entre departamentos.',
        rubricLinks: ['c', 'e', 'f', 'g'],
        placeholder:
          'Ej.: La información comercial viaja desde ventas hacia operaciones mediante hojas de cálculo semanales, generando retrasos de 48 horas...',
      },
      {
        id: 't1-q3',
        topicId: 'tema-1',
        subtopicRef: 'g) Control · Control interno',
        prompt:
          'Evalúa el sistema de control interno vigente (controles preventivos, concurrentes y posteriores). ¿Qué indicadores clave monitorea la gerencia y cómo corrige desviaciones?',
        guidance:
          'Menciona controles financieros, operativos o de cumplimiento, frecuencia de revisión y eficacia de las medidas correctivas.',
        rubricLinks: ['a', 'c'],
        placeholder:
          'Ej.: Se aplican conciliaciones semanales y KPIs de cumplimiento de entregas (OTIF). Sin embargo, falta control preventivo en...',
      },
      {
        id: 't1-q4',
        topicId: 'tema-1',
        subtopicRef: 'Toma de decisiones gerenciales · Propuesta SIG',
        prompt:
          'Identifica la principal debilidad en la toma de decisiones gerenciales y propón qué requerimientos de Sistema de Información Gerencial (equipo, software y respaldo técnico) se necesitan para resolverla.',
        guidance:
          'Conecta directamente la problemática de dirección/control con una solución tecnológica realista y alineada al plan estratégico.',
        rubricLinks: ['a', 'c', 'd', 'e'],
        placeholder:
          'Ej.: Las decisiones de inventario se toman de forma reactiva. Se propone integrar un tablero BI conectado al ERP con hardware en la nube y asesoría de un especialista en datos...',
      },
    ],
  },
  {
    id: 'tema-2',
    number: 2,
    title: 'Tema 2. Administración por Objetivos (APO / DPO)',
    shortTitle: '2. Admin. por Objetivos',
    intro:
      'Analiza el sistema gerencial donde directivos y colaboradores definen conjuntamente metas medibles en cascada, vinculando el desempeño individual con el plan estratégico y su evolución hacia marcos contemporáneos como OKRs y Cuadro de Mando Integral.',
    structuralDimensions: [
      'Alineación estratégica',
      'Cascada de metas',
      'Evaluación por resultados',
    ],
    subtopics: [
      {
        code: 'a)',
        title: 'Definición y su Naturaleza',
        summary:
          'Enfoque administrativo participativo propuesto por Peter Drucker en el que los objetivos organizacionales se traducen en metas específicas para cada unidad y colaborador.',
        keyConcepts: [
          'Negociación participativa de metas (no imposición unilateral)',
          'Enfoque en resultados sobre actividades rutinarias',
          'Compromiso mutuo y autocontrol del colaborador',
        ],
        auditFocus:
          'Determinar si los colaboradores conocen y participan en la formulación de sus metas o si solo reciben cuotas impuestas.',
      },
      {
        code: 'b)',
        title: 'Objetivos',
        summary:
          'Criterios de formulación efectiva (SMART: específicos, medibles, alcanzables, relevantes y acotados en tiempo) organizados en una jerarquía coherente.',
        keyConcepts: [
          'Objetivos estratégicos, tácticos y operativos',
          'Balance entre metas financieras, de clientes y de procesos',
          'Prevención de objetivos contradictorios entre áreas',
        ],
        auditFocus:
          'Auditar si los objetivos departamentales están cuantificados y alineados con la estrategia corporativa.',
      },
      {
        code: 'c)',
        title: 'Modelos',
        summary:
          'Estructuras clásicas de implementación de la DPO (como los ciclos de Odiorne y Humble): fijación conjunta, revisión periódica, apoyo gerencial y evaluación final.',
        keyConcepts: [
          'Ciclo de Odiorne: definición, recursos, seguimiento y recompensa',
          'Modelo de Humble: integración con planes tácticos y desarrollo gerencial',
          'Revisiones trimestrales y retroalimentación formativa',
        ],
        auditFocus:
          'Evaluar la existencia de ciclos formales de revisión de desempeño y soporte de recursos para cumplir metas.',
      },
      {
        code: 'd)',
        title: 'Después de la DPO',
        summary:
          'Evolución moderna de la APO hacia metodologías ágiles como OKRs (Objectives and Key Results), Balanced Scorecard (BSC) y gestión continua del desempeño.',
        keyConcepts: [
          'Balanced Scorecard (4 perspectivas: financiera, cliente, procesos, aprendizaje)',
          'OKRs trimestrales con transparencia transversal',
          'Integración con analítica de datos en tiempo real',
        ],
        auditFocus:
          'Identificar oportunidades para modernizar la gestión de metas con tecnología imperante y tableros dinámicos.',
      },
    ],
    questions: [
      {
        id: 't2-q1',
        topicId: 'tema-2',
        subtopicRef: 'a) Definición y Naturaleza · b) Objetivos',
        prompt:
          '¿Cómo formula y comunica la empresa sus objetivos estratégicos y operativos? Verifica si cumplen con criterios medibles (SMART) y si el personal participa en su definición.',
        guidance:
          'Cita ejemplos reales de metas de la empresa (ventas, calidad, tiempos de respuesta) y evalúa su claridad y trazabilidad.',
        rubricLinks: ['a', 'f'],
        placeholder:
          'Ej.: La gerencia define metas anuales de facturación y reducción de mermas, pero los mandos medios rara vez participan en fijar indicadores operativos...',
      },
      {
        id: 't2-q2',
        topicId: 'tema-2',
        subtopicRef: 'c) Modelos de DPO',
        prompt:
          'Analiza el ciclo de seguimiento y evaluación del desempeño en la empresa. ¿Con qué frecuencia se revisan avances, qué respaldo reciben los equipos y cómo se corrigen desvíos?',
        guidance:
          'Compara la práctica actual de la empresa frente a un modelo formal de DPO (fijación, revisión periódica, retroalimentación).',
        rubricLinks: ['a', 'b'],
        placeholder:
          'Ej.: Actualmente las evaluaciones son semestrales y reactivas; no existe un protocolo de revisión mensual ni ajuste de recursos cuando cambia la demanda...',
      },
      {
        id: 't2-q3',
        topicId: 'tema-2',
        subtopicRef: 'd) Después de la DPO',
        prompt:
          '¿Qué elementos posteriores a la DPO tradicional (Balanced Scorecard, OKRs o analítica en tiempo real) serían viables implementar en la empresa considerando su entorno y tecnología actual?',
        guidance:
          'Relaciona la respuesta con la tecnología imperante del sector y la propuesta de Sistema de Información Gerencial.',
        rubricLinks: ['b', 'c', 'e'],
        placeholder:
          'Ej.: Dado el entorno competitivo del sector retail, conviene migrar de metas anuales rígidas a OKRs trimestrales visualizados en un tablero Power BI...',
      },
    ],
  },
  {
    id: 'tema-3',
    number: 3,
    title: 'Tema 3. Comportamiento Organizacional',
    shortTitle: '3. Comportamiento Org.',
    intro:
      'Estudia cómo actúan individuos, grupos y estructuras dentro de la empresa, su impacto en la eficacia del proceso administrativo y la capacidad de adaptación frente a un entorno empresarial cambiante.',
    structuralDimensions: [
      'Trabajo colaborativo',
      'Dinámica grupal',
      'Adaptabilidad al entorno',
    ],
    subtopics: [
      {
        code: 'a)',
        title: 'Definición',
        summary:
          'Campo de estudio interdisciplinario que investiga el impacto de los individuos, los grupos y la estructura organizacional sobre el comportamiento dentro de las organizaciones.',
        keyConcepts: [
          'Variables dependientes: productividad, ausentismo, rotación, satisfacción',
          'Cultura y clima organizacional observable',
          'Evidencia empírica por encima de la intuición gerencial',
        ],
        auditFocus:
          'Medir rotación, ausentismo y compromiso como síntomas directos de la salud organizacional.',
      },
      {
        code: 'b)',
        title: 'Comportamiento organizacional y proceso administrativo',
        summary:
          'Vínculo directo entre el factor humano y las funciones de planeación, organización, dirección y control: ningún proceso técnico funciona sin adherencia conductual.',
        keyConcepts: [
          'Resistencia al cambio en nuevos controles o sistemas',
          'Alineación de incentivos con normas del proceso administrativo',
          'Confianza psicológica para reportar fallas en el flujo de información',
        ],
        auditFocus:
          'Detectar si las fallas de proceso se deben a diseño técnico o a conductas, hábitos y resistencias humanas.',
      },
      {
        code: 'c)',
        title: 'Comportamiento Organizacional contemporáneo',
        summary:
          'Tendencias actuales centradas en bienestar integral, liderazgo inclusivo, equipos autogestionados, agilidad emocional y colaboración digital.',
        keyConcepts: [
          'Seguridad psicológica y escucha activa',
          'Motivación intrínseca, autonomía y propósito',
          'Gestión de equipos multidisciplinarios e intergeneracionales',
        ],
        auditFocus:
          'Evaluar la calidad real del trabajo colaborativo y las prácticas contemporáneas de gestión del talento.',
      },
      {
        code: 'd)',
        title: 'Perspectivas conceptuales del comportamiento organizacional',
        summary:
          'Análisis multinivel: nivel individual (actitudes, percepción, personalidad), nivel grupal (cohesión, conflicto, liderazgo) y nivel organizacional (cultura, diseño estructural).',
        keyConcepts: [
          'Enfoque sistémico y de contingencias',
          'Nivel micro (individuo), meso (equipo) y macro (organización)',
          'Interacción persona–puesto–cultura',
        ],
        auditFocus:
          'Diagnosticar en qué nivel (individual, grupal o estructural) se originan los conflictos o cuellos de botella.',
      },
      {
        code: 'e)',
        title: 'Entorno Cambiante de las Organizaciones',
        summary:
          'Presiones externas que obligan a reconfigurar el comportamiento interno: transformación digital, trabajo híbrido, volatilidad económica, competencia global y nuevas regulaciones.',
        keyConcepts: [
          'Variables del entorno (tecnológicas, económicas, sociales, regulatorias)',
          'Resiliencia organizacional y aprendizaje continuo',
          'Gestión del cambio ante adopción de nueva tecnología',
        ],
        auditFocus:
          'Evaluar cómo las variables externas del entorno empresarial impactan al personal y a la estructura operativa.',
      },
    ],
    questions: [
      {
        id: 't3-q1',
        topicId: 'tema-3',
        subtopicRef: 'a) Definición · b) Proceso administrativo',
        prompt:
          'Analiza los principales indicadores humanos de la empresa (rotación, ausentismo, clima o resistencia al cambio) y explica cómo afectan la ejecución del proceso administrativo.',
        guidance:
          'Describe causas concretas observadas en la operación diaria (por ejemplo, resistencia a nuevos registros, falta de capacitación o sobrecarga).',
        rubricLinks: ['b', 'f'],
        placeholder:
          'Ej.: La rotación anual en atención al cliente ronda el 28%, lo que interrumpe la continuidad de los procedimientos de control y genera errores en registros...',
      },
      {
        id: 't3-q2',
        topicId: 'tema-3',
        subtopicRef: 'c) CO Contemporáneo · d) Perspectivas conceptuales',
        prompt:
          'Evalúa el trabajo colaborativo entre equipos desde las tres perspectivas conceptuales (individual, grupal y organizacional). ¿Qué fortalezas y conflictos interdepartamentales existen?',
        guidance:
          'Aborda motivación individual, cohesión grupal y cultura organizacional. Propón cómo un SIG colaborativo puede mejorar la coordinación.',
        rubricLinks: ['f', 'g'],
        placeholder:
          'Ej.: A nivel individual existe alto compromiso técnico, pero a nivel grupal persisten silos entre Comercial y Logística por metas desalineadas...',
      },
      {
        id: 't3-q3',
        topicId: 'tema-3',
        subtopicRef: 'e) Entorno Cambiante de las Organizaciones',
        prompt:
          '¿Qué variables del entorno empresarial actual (competencia digital, cambios regulatorios, modalidad híbrida, expectativas del cliente) presionan más a la empresa y cómo está respondiendo su talento?',
        guidance:
          'Identifica al menos 3 variables externas del entorno y analiza la preparación tecnológica y humana de la organización.',
        rubricLinks: ['b', 'e'],
        placeholder:
          'Ej.: La digitalización de competidores y la exigencia de entregas en 24h presionan al equipo operativo; sin embargo, falta capacitación en herramientas colaborativas...',
      },
    ],
  },
  {
    id: 'tema-4',
    number: 4,
    title: 'Tema 4. Enfoques Modernos de la Administración',
    shortTitle: '4. Enfoques Modernos',
    intro:
      'Evalúa la adopción estratégica de metodologías contemporáneas —empoderamiento, rightsizing/downsizing, sistemas de calidad ISO y Six Sigma, benchmarking y outsourcing— alineadas con la tecnología imperante y la competitividad.',
    structuralDimensions: [
      'Calidad y mejora continua',
      'Eficiencia estructural',
      'Respuesta tecnológica',
    ],
    subtopics: [
      {
        code: 'a)',
        title: 'Definición, Naturaleza y el proceso de su enfoque',
        summary:
          'Conjunto de paradigmas administrativos surgidos para responder con agilidad, calidad y enfoque al cliente frente a estructuras burocráticas tradicionales.',
        keyConcepts: [
          'Diagnóstico, diseño, implementación piloto y estandarización',
          'Orientación a procesos transversales y valor al cliente',
          'Integración de respaldo técnico y especialistas externos/internos',
        ],
        auditFocus:
          'Evaluar si la empresa adopta enfoques modernos de manera planificada o por moda sin soporte técnico.',
      },
      {
        code: 'b)',
        title: 'Empoderamiento (Empowerment)',
        summary:
          'Delegación real de autoridad, información y recursos a los colaboradores para que tomen decisiones en el punto de contacto con el cliente o proceso.',
        keyConcepts: [
          'Autonomía con responsabilidad clara',
          'Acceso abierto a información operativa para decidir',
          'Capacitación continua y confianza gerencial',
        ],
        auditFocus:
          'Comprobar qué nivel de autonomía real tienen los equipos operativos y si cuentan con datos confiables para decidir.',
      },
      {
        code: 'c)',
        title: 'Rightsizing y Downsizing',
        summary:
          'Downsizing reduce niveles jerárquicos o personal para contener costos; Rightsizing redimensiona la plantilla y la estructura al tamaño óptimo según la estrategia y tecnología.',
        keyConcepts: [
          'Diferencia entre recorte reactivo (downsizing) y ajuste estratégico (rightsizing)',
          'Aplanamiento del organigrama y automatización de tareas repetitivas',
          'Impacto ético y humano en los procesos de transición',
        ],
        auditFocus:
          'Auditar si la estructura actual está sobredimensionada o subdimensionada respecto a su volumen operativo.',
      },
      {
        code: 'd)',
        title: 'Sistemas de Calidad (ISO, Six Sigma)',
        summary:
          'Marcos estandarizados (ISO 9001, gestión por procesos) y metodologías estadísticas (Six Sigma DMAIC) orientadas a reducir variabilidad, defectos y desperdicios.',
        keyConcepts: [
          'Ciclo PHVA (Planear, Hacer, Verificar, Actuar) e ISO 9001',
          'Metodología DMAIC de Six Sigma y reducción de defectos',
          'Documentación de procesos y auditorías de calidad',
        ],
        auditFocus:
          'Verificar si existen procedimientos documentados, trazabilidad de no conformidades y cultura de mejora continua.',
      },
      {
        code: 'e)',
        title: 'Evaluación Comparativa (Benchmarking)',
        summary:
          'Proceso sistemático y continuo de medir productos, servicios y procesos frente a los líderes del sector o mejores prácticas globales para cerrar brechas competitivas.',
        keyConcepts: [
          'Benchmarking interno, competitivo y funcional',
          'Identificación de brechas de desempeño y adopción tecnológica',
          'Adaptación contextualizada (no copia ciega)',
        ],
        auditFocus:
          'Analizar si la empresa compara sus tiempos, costos y tecnología contra referentes del mercado.',
      },
      {
        code: 'f)',
        title: 'Outsourcing (Contratación de terceros)',
        summary:
          'Delegación estratégica de procesos no medulares (TI, logística, contabilidad, soporte) a proveedores especializados mediante acuerdos de nivel de servicio (SLA).',
        keyConcepts: [
          'Enfoque en el núcleo estratégico (core business)',
          'Contratos SLA, confidencialidad y control interno sobre terceros',
          'Evaluación de riesgos de dependencia tecnológica',
        ],
        auditFocus:
          'Revisar qué funciones se tercerizan, cómo se supervisa su calidad y qué riesgos de control o ética implican.',
      },
    ],
    questions: [
      {
        id: 't4-q1',
        topicId: 'tema-4',
        subtopicRef: 'a) Naturaleza · b) Empowerment · c) Rightsizing/Downsizing',
        prompt:
          'Evalúa el nivel de empoderamiento de los colaboradores y analiza si la estructura organizacional ha requerido procesos de downsizing o rightsizing. ¿Cómo impactó esto en el organigrama y la moral del equipo?',
        guidance:
          'Indica límites de autonomía actuales, exceso o falta de niveles jerárquicos y criterios éticos aplicados ante cambios de personal.',
        rubricLinks: ['a', 'f'],
        placeholder:
          'Ej.: Los supervisores carecen de autonomía para aprobar devoluciones menores a $50, generando demoras. El organigrama presenta 2 jefaturas con funciones solapadas...',
      },
      {
        id: 't4-q2',
        topicId: 'tema-4',
        subtopicRef: 'd) Sistemas de Calidad (ISO, Six Sigma)',
        prompt:
          '¿Qué prácticas de gestión de calidad (ISO 9001, control estadístico, Six Sigma, registros de no conformidades) aplica la empresa y qué recursos tecnológicos requiere para fortalecerlas?',
        guidance:
          'Describe procesos estandarizados o ausentes, herramientas de medición y respaldo de especialistas de calidad o TI.',
        rubricLinks: ['c', 'd', 'e'],
        placeholder:
          'Ej.: La empresa cuenta con manuales básicos pero no mide defectos con métricas Six Sigma ni posee software de trazabilidad de incidencias...',
      },
      {
        id: 't4-q3',
        topicId: 'tema-4',
        subtopicRef: 'e) Benchmarking · f) Outsourcing',
        prompt:
          'Realiza un ejercicio breve de Benchmarking frente a competidores líderes en tecnología y analiza los procesos tercerizados (Outsourcing) de la empresa: beneficios, SLAs y riesgos en el control interno.',
        guidance:
          'Compara la tecnología imperante del sector con la de la empresa y evalúa si la tercerización actual protege la información y calidad.',
        rubricLinks: ['b', 'e', 'g'],
        placeholder:
          'Ej.: Líderes del sector automatizan facturación y trazabilidad en la nube; nuestra empresa terceriza soporte TI sin SLAs medibles ni auditoría de accesos...',
      },
    ],
  },
  {
    id: 'tema-5',
    number: 5,
    title: 'Tema 5. Ética Corporativa y Gobernanza Organizacional',
    shortTitle: '5. Ética Corporativa',
    intro:
      'Integra la dimensión ética en el corazón del negocio: administración por valores, sistemas éticos, ética de la virtud, clima ético y el Código de Ética como instrumento vivo dentro del organigrama, flujo de información, control interno y toma de decisiones gerenciales.',
    structuralDimensions: [
      'Integridad en decisiones',
      'Control interno ético',
      'Clima y valores',
    ],
    subtopics: [
      {
        code: 'a)',
        title: 'Definición y Naturaleza de la ética',
        summary:
          'Reflexión práctica sobre los principios morales que guían las decisiones empresariales más allá del estricto cumplimiento legal, generando legitimidad y sostenibilidad.',
        keyConcepts: [
          'Diferencia entre legalidad mínima y responsabilidad ética',
          'Impacto reputacional y confianza con grupos de interés (stakeholders)',
          'Razonamiento moral ante dilemas de rentabilidad vs. integridad',
        ],
        auditFocus:
          'Evaluar si la empresa toma decisiones considerando el impacto ético en clientes, empleados y sociedad.',
      },
      {
        code: 'b)',
        title: 'Administración por valores',
        summary:
          'Metodología directiva (Blanchard y O’Connor) que alinea prácticas cotidianas, incentivos y procesos administrativos con los valores declarados de la empresa.',
        keyConcepts: [
          'Clarificar propósito y valores, comunicarlos y alinear prácticas diarias',
          'Coherencia entre lo que la dirección predica y lo que premia',
          'Integración de valores en evaluaciones de desempeño',
        ],
        auditFocus:
          'Comprobar si los valores institucionales son operativos en la evaluación y toma de decisiones o solo decorativos.',
      },
      {
        code: 'c)',
        title: 'Los sistemas éticos',
        summary:
          'Marcos normativos para analizar dilemas empresariales: utilitarismo (mayor bien), deontología (deber y derechos universales), justicia distributiva y ética del cuidado.',
        keyConcepts: [
          'Criterio utilitarista de costo-beneficio social',
          'Imperativo deontológico: respeto a dignidad y normas',
          'Justicia procedimental y equidad en trato interno',
        ],
        auditFocus:
          'Identificar bajo qué criterios éticos la gerencia resuelve conflictos de intereses o dilemas operativos.',
      },
      {
        code: 'd)',
        title: 'Componentes de la Ética de la virtud',
        summary:
          'Enfoque aristotélico centrado en el carácter moral de líderes y colaboradores: prudencia (phronesis), justicia, templanza, fortaleza, honestidad y transparencia.',
        keyConcepts: [
          'Prudencia en la toma de decisiones gerenciales bajo presión',
          'Ejemplaridad ética de los mandos dentro del organigrama',
          'Hábitos organizacionales orientados a la excelencia moral',
        ],
        auditFocus:
          'Observar si los líderes modelan virtudes prácticas (transparencia, justicia, prudencia) en situaciones críticas.',
      },
      {
        code: 'e)',
        title: 'Clima ético en las organizaciones',
        summary:
          'Percepción compartida sobre qué conductas son aceptables o inaceptables en la empresa (instrumental, normativo o de cuidado) y cuán seguro es reportar irregularidades.',
        keyConcepts: [
          'Canales de denuncia confidenciales y protección contra represalias',
          'Tolerancia cero frente a favoritismos, sobornos o falsificación de datos',
          'Confianza en la imparcialidad del control interno',
        ],
        auditFocus:
          'Diagnosticar el clima ético real y la existencia de canales seguros en el flujo de información.',
      },
      {
        code: 'f)',
        title: 'El Código de ética como instrumento empresarial',
        summary:
          'Documento normativo y operativo que traduce los principios éticos en pautas concretas de actuación para compras, manejo de datos, conflictos de interés, organigrama y control interno.',
        keyConcepts: [
          'Comité de Ética y gobernanza dentro del organigrama',
          'Vinculación del Código con auditorías de control interno y SIG',
          'Capacitación periódica y régimen disciplinario justo',
        ],
        auditFocus:
          'Verificar la vigencia, difusión y aplicación práctica del Código de Ética en las operaciones y decisiones gerenciales.',
      },
    ],
    questions: [
      {
        id: 't5-q1',
        topicId: 'tema-5',
        subtopicRef: 'a) Naturaleza ética · b) Administración por valores',
        prompt:
          'Analiza la coherencia entre los valores declarados de la empresa y sus prácticas reales de dirección e incentivos (Administración por Valores). ¿Se premia únicamente la cuota o también la conducta ética?',
        guidance:
          'Describe ejemplos de coherencia o brecha entre discurso directivo, sistemas de bonos y trato cotidiano.',
        rubricLinks: ['a', 'f'],
        placeholder:
          'Ej.: La empresa declara integridad y servicio, pero el esquema de comisiones carece de filtros de satisfacción del cliente, incentivando ventas apresuradas...',
      },
      {
        id: 't5-q2',
        topicId: 'tema-5',
        subtopicRef: 'c) Sistemas éticos · d) Ética de la virtud',
        prompt:
          'Describe un dilema ético real o probable en el sector de la empresa y evalúa cómo los sistemas éticos y las virtudes gerenciales (prudencia, justicia, transparencia) orientarían la decisión correcta.',
        guidance:
          'Analiza conflicto de intereses, manejo de datos de clientes, presión de costos o relación con proveedores.',
        rubricLinks: ['b', 'i'],
        placeholder:
          'Ej.: Ante la presión de reducir costos, surgió el dilema de usar insumos de menor durabilidad sin informar al cliente; desde la ética de la virtud y la justicia...',
      },
      {
        id: 't5-q3',
        topicId: 'tema-5',
        subtopicRef: 'e) Clima ético · f) Código de ética, Organigrama y Control Interno',
        prompt:
          'Evalúa el clima ético actual y el Código de Ética de la empresa: ¿Cómo se integra en el organigrama, en el flujo de información confidencial (canal de denuncias), en el control interno y en la toma de decisiones gerenciales?',
        guidance:
          'Incluye si existe comité de ética, trazabilidad en sistemas digitales y mecanismos de protección al denunciante.',
        rubricLinks: ['a', 'c', 'e', 'g'],
        placeholder:
          'Ej.: Existe un reglamento interno básico pero no un Código de Ética formal ni canal anónimo digital integrado al control interno...',
      },
    ],
  },
];

export const TOTAL_AUDIT_QUESTIONS = AUDIT_TOPICS.reduce(
  (acc, topic) => acc + topic.questions.length,
  0
);

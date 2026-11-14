import { RubricCriterion } from '../types/audit';

export const SIG_RUBRIC_TITLE = 'Rúbrica de la propuesta de sistema de información gerencial';
export const MAX_RUBRIC_SCORE = 40;

export const RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'a',
    label: 'a. Ajuste a los objetivos estratégicos',
    fullTitle: 'a. Ajuste a los objetivos estratégicos',
    descriptors: {
      4: 'La propuesta evidencia el ajuste adecuado a los objetivos y plan estratégico de la empresa.',
      3: 'La propuesta evidencia el ajuste aceptable a los objetivos y plan estratégico de la empresa.',
      2: 'La propuesta evidencia el ajuste limitado a los objetivos y plan estratégico de la empresa.',
      1: 'La propuesta no evidencia de ninguna manera el ajuste a los objetivos y plan estratégico de la empresa.',
    },
  },
  {
    id: 'b',
    label: 'b. Consideración del entorno empresarial',
    fullTitle: 'b. Consideración del entorno empresarial',
    descriptors: {
      4: 'La propuesta evidencia la consideración oportuna de las características y variables del entorno empresarial.',
      3: 'La propuesta evidencia la consideración aceptable de las características y variables del entorno empresarial.',
      2: 'La propuesta evidencia la consideración limitada de las características y variables del entorno empresarial.',
      1: 'La propuesta no evidencia la consideración efectiva de las características y variables del entorno empresarial.',
    },
  },
  {
    id: 'c',
    label: 'c. Determinación de recursos tecnológicos',
    fullTitle: 'c. Determinación de recursos tecnológicos',
    descriptors: {
      4: 'La propuesta evidencia la determinación del equipo y recursos necesarios para la implementación en la empresa.',
      3: 'La propuesta evidencia parcialmente la determinación del equipo y recursos necesarios para la implementación en la empresa.',
      2: 'La propuesta evidencia de forma limitada la determinación del equipo y recursos necesarios para la implementación en la empresa.',
      1: 'La propuesta no evidencia de ninguna forma la determinación del equipo y recursos necesarios para la implementación en la empresa.',
    },
  },
  {
    id: 'd',
    label: 'd. Respaldo de un especialista',
    fullTitle: 'd. Respaldo de un especialista',
    descriptors: {
      4: 'La propuesta evidencia el respaldo y justificación compleja de un especialista.',
      3: 'La propuesta evidencia el respaldo y justificación de un especialista.',
      2: 'La propuesta evidencia el respaldo y justificación limitada de un especialista.',
      1: 'La propuesta no permite evidenciar el respaldo y justificación de un especialista.',
    },
  },
  {
    id: 'e',
    label: 'e. Respuesta a la tecnología imperante',
    fullTitle: 'e. Respuesta a la tecnología imperante',
    descriptors: {
      4: 'La propuesta evidencia ser una respuesta oportuna a las características de la tecnología imperante.',
      3: 'La propuesta evidencia ser una respuesta a las características de la tecnología imperante.',
      2: 'La propuesta evidencia ser una respuesta muy limitada a las características de la tecnología imperante.',
      1: 'La propuesta evidencia no ajustarse a las características de la tecnología imperante.',
    },
  },
  {
    id: 'f',
    label: 'f. Trabajo colaborativo',
    fullTitle: 'f. Trabajo colaborativo',
    descriptors: {
      4: 'La propuesta evidencia la integración compleja del trabajo colaborativo en los equipos.',
      3: 'La propuesta evidencia la integración del trabajo colaborativo en los equipos.',
      2: 'La propuesta evidencia la integración limitada del trabajo colaborativo en los equipos.',
      1: 'La propuesta no evidencia la integración del trabajo colaborativo en los equipos.',
    },
  },
  {
    id: 'g',
    label: 'g. Uso de la tecnología',
    fullTitle: 'g. Uso de la tecnología',
    descriptors: {
      4: 'La propuesta evidencia un amplio dominio del uso de la tecnología para presentar su propuesta.',
      3: 'La propuesta evidencia un uso aceptable de la tecnología para presentar su propuesta.',
      2: 'La propuesta refleja un uso limitado de la tecnología para presentar su propuesta.',
      1: 'La propuesta refleja enormes deficiencias en el uso de la tecnología para presentar su propuesta.',
    },
  },
  {
    id: 'h',
    label: 'h. Uso del APA',
    fullTitle: 'h. Uso del APA',
    descriptors: {
      4: 'Las referencias bibliográficas utilizadas en la propuesta incluyen el uso correcto y prescrito por la última edición del APA.',
      3: 'Las referencias bibliográficas utilizadas incluyen algunas deficiencias pero siguen el formato del APA.',
      2: 'Las referencias bibliográficas utilizadas incluyen una versión anterior del APA o lo usa inadecuadamente.',
      1: 'Las referencias bibliográficas utilizadas incluyen el formato APA inapropiadamente o carecen del mismo.',
    },
  },
  {
    id: 'i',
    label: 'i. Estilo y redacción',
    fullTitle: 'i. Estilo y redacción',
    descriptors: {
      4: 'El uso de la gramática, el vocabulario y la puntuación de la propuesta es correcto y preciso.',
      3: 'El uso de la gramática, el vocabulario y la puntuación de la propuesta es generalmente correcto y preciso.',
      2: 'El uso de la gramática, el vocabulario y la puntuación de la propuesta presenta diversas inconsistencias e imprecisiones.',
      1: 'El uso de la gramática, el vocabulario y la puntuación de la propuesta es deficiente e impreciso.',
    },
  },
  {
    id: 'j',
    label: 'j. Uso de la retroalimentación del docente',
    fullTitle: 'j. Uso de la retroalimentación del docente',
    descriptors: {
      4: 'La propuesta evidencia la utilización de las recomendaciones realizadas por el docente para su mejora.',
      3: 'La propuesta evidencia el uso de algunas de las recomendaciones planteadas por el docente.',
      2: 'La propuesta evidencia el uso mínimo o limitado de las recomendaciones propuestas por el docente.',
      1: 'La propuesta no evidencia el uso de la retroalimentación del docente, provocando un producto limitado y de baja calidad.',
    },
  },
];

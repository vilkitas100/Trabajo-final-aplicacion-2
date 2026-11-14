import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHeuristicFinalEvaluation,
  buildHeuristicTopicEvaluation,
  computeCompletionStats,
  computeRubricTotal,
  getQualitativeGrade,
  toMaturityLevel,
} from './auditLogic';
import { createDemoAuditSession } from '../data/demoCase';
import { TOTAL_AUDIT_QUESTIONS } from '../data/auditCurriculum';
import { RubricCriterionId, RubricLevel } from '../types/audit';

test('computeCompletionStats reports 0% and ineligible on empty state', () => {
  const demo = createDemoAuditSession();
  const empty = {
    ...demo,
    profile: { ...demo.profile, studentName: '', companyName: '' },
    answers: {},
    topicEvaluations: {},
    finalEvaluation: null,
  };

  const stats = computeCompletionStats(empty);
  assert.equal(stats.answeredCount, 0);
  assert.equal(stats.totalQuestions, TOTAL_AUDIT_QUESTIONS);
  assert.equal(stats.completionPercent, 0);
  assert.equal(stats.isProfileComplete, false);
  assert.equal(stats.isAllQuestionsComplete, false);
  assert.equal(stats.isCertificateEligible, false);
});

test('computeCompletionStats reports 100% and eligible on complete demo case', () => {
  const demo = createDemoAuditSession();
  const stats = computeCompletionStats(demo);
  assert.equal(stats.answeredCount, TOTAL_AUDIT_QUESTIONS);
  assert.equal(stats.completionPercent, 100);
  assert.equal(stats.isProfileComplete, true);
  assert.equal(stats.isAllQuestionsComplete, true);
  assert.equal(stats.isCertificateEligible, true);
});

test('computeRubricTotal calculates exact sum over 40 points', () => {
  const maxScores: Record<RubricCriterionId, RubricLevel> = {
    a: 4, b: 4, c: 4, d: 4, e: 4, f: 4, g: 4, h: 4, i: 4, j: 4,
  };
  assert.equal(computeRubricTotal(maxScores), 40);

  const mixedScores: Record<RubricCriterionId, RubricLevel> = {
    a: 4, b: 3, c: 4, d: 3, e: 2, f: 3, g: 4, h: 3, i: 4, j: 2,
  };
  assert.equal(computeRubricTotal(mixedScores), 32);
});

test('getQualitativeGrade and toMaturityLevel map boundary values accurately', () => {
  assert.equal(getQualitativeGrade(38).label, 'Sobresaliente');
  assert.equal(getQualitativeGrade(38).percentage, 95);
  assert.equal(getQualitativeGrade(31).label, 'Notable / Satisfactorio');
  assert.equal(getQualitativeGrade(24).label, 'En Desarrollo');
  assert.equal(getQualitativeGrade(15).label, 'Inicial / Requiere Mejora');

  assert.equal(toMaturityLevel(90), 5);
  assert.equal(toMaturityLevel(75), 4);
  assert.equal(toMaturityLevel(60), 3);
  assert.equal(toMaturityLevel(40), 2);
  assert.equal(toMaturityLevel(20), 1);
});

test('heuristic evaluators produce valid ethical/operational maturity and 40-pt rubric output', () => {
  const demo = createDemoAuditSession();
  const topicEval = buildHeuristicTopicEvaluation(
    'tema-5',
    demo.answers,
    demo.profile.companyName
  );
  assert.ok(topicEval.qualityScore >= 70);
  assert.ok(topicEval.ethicalMaturityScore >= 50);
  assert.ok(topicEval.operationalMaturityScore >= 50);
  assert.ok(topicEval.strengths.length > 0);

  const finalEval = buildHeuristicFinalEvaluation(demo);
  assert.ok(finalEval.totalScore >= 30 && finalEval.totalScore <= 40);
  assert.equal(Object.keys(finalEval.scores).length, 10);
});

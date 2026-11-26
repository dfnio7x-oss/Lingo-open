import { CefrLevel, GrammarUnit } from '../types/learning';
import { BASIC_GRAMMAR_UNITS } from './grammarBasic';
import { ADVANCED_GRAMMAR_UNITS } from './grammarAdvanced';
import { EXPANDED_BASIC_GRAMMAR_UNITS } from './grammarExpandedBasic';
import { EXPANDED_ADVANCED_GRAMMAR_UNITS } from './grammarExpandedAdvanced';

export const ALL_GRAMMAR_UNITS: GrammarUnit[] = [
  ...BASIC_GRAMMAR_UNITS,
  ...EXPANDED_BASIC_GRAMMAR_UNITS,
  ...ADVANCED_GRAMMAR_UNITS,
  ...EXPANDED_ADVANCED_GRAMMAR_UNITS,
];

export function getGrammarUnitsByLevel(level: CefrLevel): GrammarUnit[] {
  return ALL_GRAMMAR_UNITS.filter((unit) => unit.level === level).sort(
    (a, b) => a.order - b.order
  );
}

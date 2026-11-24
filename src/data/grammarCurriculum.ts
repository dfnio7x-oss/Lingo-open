import { CefrLevel, GrammarUnit } from '../types/learning';
import { BASIC_GRAMMAR_UNITS } from './grammarBasic';
import { ADVANCED_GRAMMAR_UNITS } from './grammarAdvanced';

export const ALL_GRAMMAR_UNITS: GrammarUnit[] = [
  ...BASIC_GRAMMAR_UNITS,
  ...ADVANCED_GRAMMAR_UNITS,
];

export function getGrammarUnitsByLevel(level: CefrLevel): GrammarUnit[] {
  return ALL_GRAMMAR_UNITS.filter((unit) => unit.level === level);
}

export type Question = {
  question: string;
  options: string[];
};

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 10;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 4;

function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasLengthInRange(arr: unknown[], min: number, max: number): boolean {
  return arr.length >= min && arr.length <= max;
}

export function isQuestion(obj: any): obj is Question {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isNonEmptyString(obj.question) &&
    Array.isArray(obj.options) &&
    hasLengthInRange(obj.options, MIN_OPTIONS, MAX_OPTIONS) &&
    obj.options.every(isNonEmptyString)
  );
}

export function isQuestionArray(obj: any): obj is Question[] {
  return (
    Array.isArray(obj) &&
    hasLengthInRange(obj, MIN_QUESTIONS, MAX_QUESTIONS) &&
    obj.every(isQuestion)
  );
}

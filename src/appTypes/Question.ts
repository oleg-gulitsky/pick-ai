export type Question = {
  question: string;
  options: string[];
};

export function isQuestion(obj: any): obj is Question {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.question === 'string' &&
    Array.isArray(obj.options) &&
    obj.options.every((opt: any) => typeof opt === 'string')
  );
}

export function isQuestionArray(obj: any): obj is Question[] {
  return Array.isArray(obj) && obj.every(isQuestion);
}

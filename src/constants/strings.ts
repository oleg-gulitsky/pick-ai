export const STRINGS = {
  NEW_DECISION_TAB_TITLE: 'Decide',
  HISTORY_TAB_TITLE: 'History',
  SETTINGS_TAB_TITLE: 'Settings',

  OPTIONS_EYEBROW: 'NEW DECISION',
  OPTIONS_TITLE: 'What are you torn between?',
  OPTION_PLACEHOLDER: (index: number) => `Option ${index + 1}`,
  REMOVE_OPTION_LABEL: (index: number) => `Remove option ${index + 1}`,
  ADD_OPTION: 'Add an option',
  GENERATE_QUESTIONS_BUTTON_TITLE: 'Help me decide',

  WAITING_EYEBROW: 'WEIGHING YOUR OPTIONS',
  WAITING_QUESTIONS: (optionsCount: number) =>
    optionsCount > 2
      ? `Writing questions that tell all ${NUMBER_WORDS[optionsCount]} apart…`
      : 'Writing questions that tell them apart…',
  WAITING_RESULT: 'Picking the one that fits your answers…',
  CANCEL_BUTTON_TITLE: 'Cancel',

  QUESTION_PROGRESS: (index: number, count: number) =>
    `QUESTION ${padNumber(index + 1)} / ${padNumber(count)}`,
  PREVIOUS_QUESTION_LABEL: 'Previous question',
  PREVIOUS_QUESTION_HINT: 'You can go back to the previous question',

  RESULT_PROGRESS: (count: number) =>
    `DONE ${padNumber(count)} / ${padNumber(count)}`,
  RESULT_SAVED: 'Saved',
  RESULT_EYEBROW: 'BEST FIT FOR YOU',
  NEW_DECISION_BUTTON_TITLE: 'New decision',
  OPEN_IN_HISTORY_BUTTON_TITLE: 'Open in history',

  HISTORY_SCREEN_TITLE: 'Your decisions',
  HISTORY_SAVED_COUNT: (count: number) => `${count} SAVED`,
  HISTORY_NOTHING_SAVED: 'NOTHING SAVED YET',
  HISTORY_OPTIONS_COUNT: (count: number) => `${count} OPTIONS`,
  HISTORY_TODAY: 'TODAY',
  HISTORY_EMPTY_TITLE: 'No decisions yet',
  HISTORY_EMPTY_MESSAGE:
    'Every decision is saved automatically, with your answers and the explanation.',
  START_DECISION_BUTTON_TITLE: 'Start a decision',

  BACK_BUTTON_LABEL: 'Back',
  OPTIONS_SEPARATOR: ' vs ',
  HISTORY_RECOMMENDATION_TITLE: 'RESULT',
  HISTORY_ANSWERS_TITLE: 'YOUR ANSWERS',
  DELETE_BUTTON_TITLE: 'Delete',

  SETTINGS_SCREEN_TITLE: 'Settings',
  SETTINGS_QUIZ_SECTION: 'QUIZ',
  SETTINGS_QUESTIONS_RANGE: 'Questions per decision',
  SETTINGS_ANSWERS_RANGE: 'Answers per question',
  SETTINGS_APPEARANCE_SECTION: 'APPEARANCE',
  THEME_SYSTEM: 'System',
  THEME_LIGHT: 'Light',
  THEME_DARK: 'Dark',
  SETTINGS_DATA_SECTION: 'DATA',
  CLEAR_HISTORY_BUTTON_TITLE: (count: number) =>
    `Clear history · ${count} saved`,
  APP_VERSION: (version: string) => `VERSION ${version}`,

  DELETE_ENTRY_ALERT_TITLE: 'Delete this decision?',
  DELETE_ENTRY_ALERT_MESSAGE:
    'It will be removed from your history. This can’t be undone.',
  DELETE_ENTRY_ALERT_CONFIRM: 'Delete',
  ALERT_CANCEL_BUTTON_TITLE: 'Cancel',
  CLEAR_HISTORY_ALERT_TITLE: 'Clear all history?',
  CLEAR_HISTORY_ALERT_MESSAGE:
    'All saved decisions will be deleted. This can’t be undone.',
  CLEAR_HISTORY_ALERT_CONFIRM: 'Clear',
  SERVICE_ERROR_LABEL: 'SERVICE ERROR',
  SERVICE_ERROR_ALERT_TITLE: 'We couldn’t reach the assistant',
  SERVICE_ERROR_ALERT_MESSAGE:
    'Your options are kept — try again in a moment or come back later.',
  TRY_AGAIN_BUTTON_TITLE: 'Try again',
  BACK_TO_OPTIONS_BUTTON_TITLE: 'Back to options',
};

const NUMBER_WORDS: Record<number, string> = { 3: 'three', 4: 'four' };

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

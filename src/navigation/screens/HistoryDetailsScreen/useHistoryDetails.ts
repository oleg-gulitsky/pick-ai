import { useCallback, useState } from 'react';
import { useAppNavigation } from '../..';
import { useDeleteHistoryEntry } from '../../../hooks/useDeleteHistoryEntry';
import { useHistoryStore } from '../../../store/useHistoryStore';

export function useHistoryDetails(id: string) {
  const navigation = useAppNavigation();
  const { isDeleteDialogVisible, requestDelete, confirmDelete, cancelDelete } =
    useDeleteHistoryEntry();

  const [entry] = useState(() =>
    useHistoryStore.getState().entries.find(item => item.id === id),
  );

  const answeredQuestions = entry
    ? entry.questions.map((question, questionIndex) => ({
        question: question.question,
        options: question.options.map((text, optionIndex) => ({
          text,
          isChosen: entry.answers[questionIndex] === optionIndex,
        })),
      }))
    : [];

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleDeletePress = useCallback(
    () => requestDelete(id, () => navigation.goBack()),
    [id, navigation, requestDelete],
  );

  return {
    entry,
    answeredQuestions,
    isDeleteDialogVisible,
    handleBackPress,
    handleDeletePress,
    handleDeleteConfirm: confirmDelete,
    handleDeleteCancel: cancelDelete,
  };
}

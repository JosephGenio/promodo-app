import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { TagPill } from '@/components/TagPill';
import { GradientButton } from '@/components/GradientButton';
import { useQuizzes, type QuizQuestion } from '@/features/quiz/quizStore';
import type { MainTabScreenProps } from '@/navigation/types';

type DraftQuestion = QuizQuestion;

export function QuizMakerScreen({ navigation }: MainTabScreenProps<'QuizMaker'>) {
  const { quizzes, isLoading, error, addQuiz } = useQuizzes();
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function addQuestion() {
    if (!questionText.trim() || options.some((opt) => !opt.trim())) return;
    setDraftQuestions((prev) => [
      ...prev,
      { id: String(Date.now()), text: questionText.trim(), options: [...options], correctIndex },
    ]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  }

  async function saveQuiz() {
    if (!title.trim() || draftQuestions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addQuiz({
        subject: subject.trim() || 'General',
        title: title.trim(),
        description: description.trim(),
        questions: draftQuestions,
      });
      setSubject('');
      setTitle('');
      setDescription('');
      setDraftQuestions([]);
      setIsCreating(false);
    } catch {
      // leave the draft in place so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  let listStatusMessage: string | null = null;
  if (isLoading && quizzes.length === 0) {
    listStatusMessage = 'Loading quizzes…';
  } else if (error) {
    listStatusMessage = "Couldn't load quizzes.";
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Self-Quiz Maker"
        subtitle="Create & take quizzes"
        right={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsCreating((prev) => !prev)}>
            <Ionicons name={isCreating ? 'close' : 'add'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      {isCreating ? (
        <SectionCard style={styles.createCard}>
          <Text style={styles.sectionLabel}>Quiz Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject (e.g. Biology)"
            placeholderTextColor={theme.colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder="Quiz title"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          {draftQuestions.length > 0 ? (
            <View style={styles.draftList}>
              {draftQuestions.map((q, index) => (
                <Text key={q.id} style={styles.draftItem}>
                  {index + 1}. {q.text}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Add Question</Text>
          <TextInput
            style={styles.input}
            placeholder="Question text"
            placeholderTextColor={theme.colors.textMuted}
            value={questionText}
            onChangeText={setQuestionText}
          />
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TouchableOpacity onPress={() => setCorrectIndex(index)} hitSlop={6}>
                <Ionicons
                  name={correctIndex === index ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={correctIndex === index ? theme.colors.success : theme.colors.textMuted}
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.optionInput]}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor={theme.colors.textMuted}
                value={option}
                onChangeText={(value) => updateOption(index, value)}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addQuestionButton} onPress={addQuestion}>
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.addQuestionText}>Add Question</Text>
          </TouchableOpacity>

          <GradientButton
            label={isSubmitting ? 'Saving…' : 'Save Quiz'}
            onPress={saveQuiz}
            disabled={isSubmitting || draftQuestions.length === 0 || !title.trim()}
          />
        </SectionCard>
      ) : null}

      {listStatusMessage ? (
        <Text style={styles.draftItem}>{listStatusMessage}</Text>
      ) : (
        quizzes.map((quiz) => (
          <SectionCard key={quiz.id} style={styles.quizCard}>
            <View style={styles.quizInfo}>
              <View style={styles.tagRow}>
                <TagPill label={quiz.subject} accent="purple" />
                <Text style={styles.questionCount}>{quiz.questionCount} Qs</Text>
              </View>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              {quiz.description ? <Text style={styles.quizDescription}>{quiz.description}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.takeButton}
              onPress={() => navigation.navigate('QuizTake', { quizId: quiz.id })}
            >
              <Ionicons name="play" size={14} color={theme.colors.white} />
              <Text style={styles.takeButtonText}>Take</Text>
            </TouchableOpacity>
          </SectionCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCard: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm + 2,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  addQuestionText: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
  draftList: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 4,
  },
  draftItem: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quizInfo: {
    flex: 1,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  questionCount: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  quizTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  quizDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  takeButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
});

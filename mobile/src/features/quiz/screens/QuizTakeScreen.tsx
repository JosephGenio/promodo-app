import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { GradientButton } from '@/components/GradientButton';
import { useQuizzes } from '@/features/quiz/quizStore';
import type { MainTabScreenProps } from '@/navigation/types';

export function QuizTakeScreen({ navigation, route }: MainTabScreenProps<'QuizTake'>) {
  const { getQuiz } = useQuizzes();
  const quiz = getQuiz(route.params.quizId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Quiz Not Found" />
        <Text style={styles.body}>This quiz no longer exists.</Text>
        <GradientButton label="Back to Quizzes" onPress={() => navigation.navigate('QuizMaker')} />
      </ScreenContainer>
    );
  }

  if (finished) {
    const score = answers.filter((answer, index) => answer === quiz.questions[index].correctIndex).length;
    const percent = Math.round((score / quiz.questions.length) * 100);
    return (
      <ScreenContainer>
        <ScreenHeader title={quiz.title} subtitle="Quiz complete" />
        <SectionCard style={styles.resultCard}>
          <Ionicons name="trophy" size={40} color={theme.colors.star} />
          <Text style={styles.resultScore}>
            {score}/{quiz.questions.length}
          </Text>
          <Text style={styles.resultPercent}>{percent}% correct</Text>
        </SectionCard>
        <GradientButton label="Back to Quizzes" onPress={() => navigation.navigate('QuizMaker')} />
      </ScreenContainer>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;

  function handleNext() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title={quiz.title}
        subtitle={`Question ${currentIndex + 1} of ${quiz.questions.length}`}
      />

      <SectionCard style={styles.questionCard}>
        <Text style={styles.questionText}>{question.text}</Text>
        {question.options.map((option, index) => {
          const active = selected === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setSelected(index)}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      <GradientButton label={isLast ? 'Finish' : 'Next'} onPress={handleNext} disabled={selected === null} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  questionCard: {
    gap: theme.spacing.sm,
  },
  questionText: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm + 2,
  },
  optionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  resultCard: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  resultPercent: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});

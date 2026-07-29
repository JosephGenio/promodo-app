import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StarRating } from '@/components/StarRating';
import { GradientButton } from '@/components/GradientButton';
import * as reflectionApi from '@/features/reflection/api';
import type { Reflection } from '@/features/reflection/api';

function formatDateLabel(dateIso: string): string {
  const date = new Date(dateIso);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function DailyReflectionScreen() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [learned, setLearned] = useState('');
  const [challenges, setChallenges] = useState('');
  const [productivity, setProductivity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadReflections() {
    setIsLoading(true);
    setLoadError(false);
    reflectionApi
      .fetchReflections()
      .then(setReflections)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadReflections, []);

  async function addReflection() {
    if (!subject.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await reflectionApi.createReflection({
        subject: subject.trim(),
        learned: learned.trim(),
        challenges: challenges.trim(),
        productivity,
      });
      setReflections((prev) => [created, ...prev]);
      setSubject('');
      setLearned('');
      setChallenges('');
      setProductivity(0);
      setIsAdding(false);
    } catch {
      // leave the form open with the entered values so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  function deleteReflection(id: string) {
    const previous = reflections;
    setReflections((prev) => prev.filter((entry) => entry.id !== id));
    reflectionApi.deleteReflection(id).catch(() => setReflections(previous));
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Daily Reflection"
        subtitle="Reflect on your study sessions"
        right={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding((prev) => !prev)}>
            <Ionicons name={isAdding ? 'close' : 'add'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      {isAdding ? (
        <SectionCard style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Subject (e.g. Math)"
            placeholderTextColor={theme.colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder="What did you learn?"
            placeholderTextColor={theme.colors.textMuted}
            value={learned}
            onChangeText={setLearned}
          />
          <TextInput
            style={styles.input}
            placeholder="What challenges did you face?"
            placeholderTextColor={theme.colors.textMuted}
            value={challenges}
            onChangeText={setChallenges}
          />
          <View style={styles.ratingRow}>
            <Text style={styles.label}>Productivity</Text>
            <StarRating value={productivity} onChange={setProductivity} />
          </View>
          <GradientButton
            label={isSubmitting ? 'Saving…' : 'Save Reflection'}
            onPress={addReflection}
            disabled={isSubmitting}
          />
        </SectionCard>
      ) : null}

      {isLoading ? (
        <Text style={styles.line}>Loading reflections…</Text>
      ) : loadError ? (
        <TouchableOpacity onPress={loadReflections}>
          <Text style={styles.line}>Couldn't load reflections. Tap to retry.</Text>
        </TouchableOpacity>
      ) : (
        reflections.map((entry) => (
          <SectionCard key={entry.id} style={styles.entryCard}>
            <View style={styles.headerRow}>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textPrimary} />
                <Text style={styles.dateText}>{formatDateLabel(entry.date)}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteReflection(entry.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subject}>{entry.subject}</Text>
            {entry.learned ? (
              <Text style={styles.line}>
                <Text style={styles.lineLabel}>Learned: </Text>
                {entry.learned}
              </Text>
            ) : null}
            {entry.challenges ? (
              <Text style={styles.line}>
                <Text style={styles.lineLabel}>Challenges: </Text>
                {entry.challenges}
              </Text>
            ) : null}
            <View style={styles.ratingRow}>
              <Text style={styles.productivityLabel}>Productivity:</Text>
              <StarRating value={entry.productivity} size={16} />
            </View>
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
  addCard: {
    gap: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm + 2,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  label: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  entryCard: {
    gap: theme.spacing.xs,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  dateText: {
    ...theme.typography.captionBold,
    color: theme.colors.textPrimary,
  },
  subject: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  line: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  lineLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  productivityLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

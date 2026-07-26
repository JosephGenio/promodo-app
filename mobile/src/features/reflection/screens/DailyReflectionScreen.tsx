import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StarRating } from '@/components/StarRating';
import { GradientButton } from '@/components/GradientButton';

type Reflection = {
  id: string;
  date: string;
  subject: string;
  learned: string;
  challenges: string;
  productivity: number;
};

function todayLabel(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
}

const INITIAL_REFLECTIONS: Reflection[] = [
  {
    id: '1',
    date: todayLabel(),
    subject: 'Math',
    learned: 'Practiced solving quadratic equations',
    challenges: 'Factoring larger expressions took longer than expected',
    productivity: 3,
  },
];

export function DailyReflectionScreen() {
  const [reflections, setReflections] = useState<Reflection[]>(INITIAL_REFLECTIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [learned, setLearned] = useState('');
  const [challenges, setChallenges] = useState('');
  const [productivity, setProductivity] = useState(0);

  function addReflection() {
    if (!subject.trim()) return;
    setReflections((prev) => [
      {
        id: String(Date.now()),
        date: todayLabel(),
        subject: subject.trim(),
        learned: learned.trim(),
        challenges: challenges.trim(),
        productivity,
      },
      ...prev,
    ]);
    setSubject('');
    setLearned('');
    setChallenges('');
    setProductivity(0);
    setIsAdding(false);
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
          <GradientButton label="Save Reflection" onPress={addReflection} />
        </SectionCard>
      ) : null}

      {reflections.map((entry) => (
        <SectionCard key={entry.id} style={styles.entryCard}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textPrimary} />
            <Text style={styles.dateText}>{entry.date}</Text>
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
      ))}
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

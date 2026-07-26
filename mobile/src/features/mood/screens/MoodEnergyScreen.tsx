import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { GradientButton } from '@/components/GradientButton';

const MOODS = [
  { label: 'Motivated', emoji: '😊' },
  { label: 'Good', emoji: '🙂' },
  { label: 'Normal', emoji: '😐' },
  { label: 'Tired', emoji: '😔' },
  { label: 'Stressed', emoji: '😣' },
];

const ENERGY_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

type CheckIn = {
  id: string;
  mood: string;
  energy: number;
  reflection: string;
};

export function MoodEnergyScreen() {
  const [mood, setMood] = useState('Good');
  const [energy, setEnergy] = useState(3);
  const [reflection, setReflection] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CheckIn[]>([]);

  function saveCheckIn() {
    setHistory((prev) => [{ id: String(Date.now()), mood, energy, reflection }, ...prev]);
    setReflection('');
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mood & Energy"
        subtitle="Track how you feel before studying"
        right={
          <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory((prev) => !prev)}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textPrimary} />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        }
      />

      <SectionCard style={styles.card}>
        <Text style={styles.question}>How are you feeling today?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
          {MOODS.map((option) => {
            const active = option.label === mood;
            return (
              <TouchableOpacity
                key={option.label}
                style={[styles.moodOption, active && styles.moodOptionActive]}
                onPress={() => setMood(option.label)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.question}>What is your energy level today?</Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${((energy - 1) / 4) * 100}%` }]} />
          <View style={styles.sliderTapRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity key={level} style={styles.sliderTap} onPress={() => setEnergy(level)} />
            ))}
          </View>
          <View style={[styles.sliderThumb, { left: `${((energy - 1) / 4) * 100}%` }]} />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelText}>1 — Very Low Energy</Text>
          <Text style={styles.sliderLabelText}>5 — Very High Energy</Text>
        </View>
        <Text style={styles.energyPill}>
          {energy} — {ENERGY_LABELS[energy - 1]}
        </Text>
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.question}>Study Reflection</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Write your study reflection..."
          placeholderTextColor={theme.colors.textMuted}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />
      </SectionCard>

      <GradientButton label="Save Check-In" onPress={saveCheckIn} />

      {showHistory ? (
        <View style={styles.historyList}>
          <Text style={styles.historyTitle}>Past Check-Ins</Text>
          {history.length === 0 ? (
            <Text style={styles.empty}>No check-ins yet.</Text>
          ) : (
            history.map((entry) => (
              <SectionCard key={entry.id} style={styles.historyCard}>
                <Text style={styles.historyMood}>
                  {MOODS.find((m) => m.label === entry.mood)?.emoji} {entry.mood} · Energy {entry.energy}
                </Text>
                {entry.reflection ? <Text style={styles.line}>{entry.reflection}</Text> : null}
              </SectionCard>
            ))
          )}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs + 2,
    backgroundColor: theme.colors.surface,
  },
  historyText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  card: {
    gap: theme.spacing.sm,
  },
  question: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  moodRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  moodOption: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  moodOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  sliderTrack: {
    height: 24,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  sliderTapRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sliderTap: {
    flex: 1,
    height: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    backgroundColor: theme.colors.white,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  energyPill: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm + 2,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  historyList: {
    gap: theme.spacing.sm,
  },
  historyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  historyCard: {
    gap: 4,
  },
  historyMood: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  line: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

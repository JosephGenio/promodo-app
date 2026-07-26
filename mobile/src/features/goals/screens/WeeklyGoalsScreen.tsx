import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { StatGrid } from '@/components/StatGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { GradientButton } from '@/components/GradientButton';

type Goal = {
  id: string;
  title: string;
  weekOf: string;
  current: number;
  target: number;
};

function currentWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return `Week of ${monday.getMonth() + 1}/${monday.getDate()}/${monday.getFullYear()}`;
}

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Study Mathematics 10 hours', weekOf: currentWeekLabel(), current: 4.5, target: 10 },
  { id: '2', title: 'Review Biology chapters 1-3', weekOf: currentWeekLabel(), current: 2, target: 6 },
  { id: '3', title: 'Practice English writing', weekOf: currentWeekLabel(), current: 4, target: 4 },
];

export function WeeklyGoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  const active = goals.filter((goal) => goal.current < goal.target);
  const achieved = goals.filter((goal) => goal.current >= goal.target);

  function adjust(id: string, delta: number) {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, current: Math.max(0, Math.min(goal.target, goal.current + delta)) }
          : goal,
      ),
    );
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }

  function addGoal() {
    const targetHours = Number(target);
    if (!title.trim() || !targetHours || targetHours <= 0) return;
    setGoals((prev) => [
      ...prev,
      { id: String(Date.now()), title: title.trim(), weekOf: currentWeekLabel(), current: 0, target: targetHours },
    ]);
    setTitle('');
    setTarget('');
    setIsAdding(false);
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Weekly Goals"
        subtitle="Set targets & stay motivated"
        right={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding((prev) => !prev)}>
            <Ionicons name={isAdding ? 'close' : 'add'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <StatGrid>
        <StatCard
          icon={<Ionicons name="radio-button-on-outline" size={20} color={theme.accents.indigo.fg} />}
          accent="indigo"
          value={String(active.length)}
          label="Active Goals"
        />
        <StatCard
          icon={<Ionicons name="checkmark" size={20} color={theme.accents.green.fg} />}
          accent="green"
          value={String(achieved.length)}
          label="Completed"
        />
      </StatGrid>

      {isAdding ? (
        <SectionCard style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Goal title (e.g. Study Chemistry 8 hours)"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Target hours"
            placeholderTextColor={theme.colors.textMuted}
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
          />
          <GradientButton label="Add Goal" onPress={addGoal} />
        </SectionCard>
      ) : null}

      {active.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>IN PROGRESS</Text>
          {active.map((goal) => {
            const percent = Math.round((goal.current / goal.target) * 100);
            return (
              <SectionCard key={goal.id} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.weekLabel}>{goal.weekOf}</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>
                    {goal.current}h / {goal.target}h
                  </Text>
                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
                <ProgressBar percent={percent} />
                <View style={styles.controlsRow}>
                  <TouchableOpacity style={styles.stepButton} onPress={() => adjust(goal.id, -1)}>
                    <Ionicons name="remove" size={18} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.stepButton} onPress={() => adjust(goal.id, 1)}>
                    <Ionicons name="add" size={18} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.hourButton} onPress={() => adjust(goal.id, 1)}>
                    <Text style={styles.hourButtonText}>+1 hour</Text>
                  </TouchableOpacity>
                </View>
              </SectionCard>
            );
          })}
        </>
      ) : null}

      {achieved.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>ACHIEVED ✨</Text>
          {achieved.map((goal) => (
            <SectionCard key={goal.id} style={styles.achievedCard}>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
              <View style={styles.achievedInfo}>
                <Text style={styles.achievedTitle}>{goal.title}</Text>
                <Text style={styles.weekLabel}>
                  {goal.current}h / {goal.target}h
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeGoal(goal.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </SectionCard>
          ))}
        </>
      ) : null}
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
  sectionLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  goalCard: {
    gap: theme.spacing.xs,
  },
  goalTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  weekLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  percentText: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  achievedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  achievedInfo: {
    flex: 1,
    gap: 2,
  },
  achievedTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
});

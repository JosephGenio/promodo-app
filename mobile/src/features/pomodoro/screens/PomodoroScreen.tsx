import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { Pill } from '@/components/Pill';

type Mode = 'study' | 'short' | 'long';

const DURATIONS: Record<Mode, number> = {
  study: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  study: 'Study Time',
  short: 'Short Break',
  long: 'Long Break',
};

const PRESET_SUBJECTS = ['Mathematics', 'Science', 'History', 'English'];

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PomodoroScreen() {
  const [mode, setMode] = useState<Mode>('study');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.study);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [subject, setSubject] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'study') setSessionsCompleted((count) => count + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  function selectMode(next: Mode) {
    setMode(next);
    setSecondsLeft(DURATIONS[next]);
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(DURATIONS[mode]);
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Pomodoro Timer" />

      <View style={styles.tabRow}>
        <Pill label="Study" active={mode === 'study'} onPress={() => selectMode('study')} variant="gradient" style={styles.flex} />
        <Pill label="Short Break" active={mode === 'short'} onPress={() => selectMode('short')} variant="gradient" style={styles.flex} />
        <Pill label="Long Break" active={mode === 'long'} onPress={() => selectMode('long')} variant="gradient" style={styles.flex} />
      </View>

      <View style={styles.ringWrap}>
        <View style={styles.ring}>
          <MaterialCommunityIcons name="brain" size={32} color={theme.colors.primary} />
          <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.modeLabel}>{MODE_LABELS[mode]}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={() => setIsRunning((prev) => !prev)}>
          <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sessionRow}>
        {Array.from({ length: 4 }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, i < sessionsCompleted % 4 && styles.dotFilled]}
          />
        ))}
        <Text style={styles.sessionLabel}>{sessionsCompleted} sessions completed</Text>
      </View>

      <SectionCard style={styles.subjectCard}>
        <Text style={styles.label}>Study Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mathematics"
          placeholderTextColor={theme.colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />
        <Text style={[styles.label, styles.presetsLabel]}>Quick Presets</Text>
        <View style={styles.presetsRow}>
          {PRESET_SUBJECTS.map((preset) => (
            <TouchableOpacity key={preset} style={styles.presetChip} onPress={() => setSubject(preset)}>
              <Text style={styles.presetText}>{preset}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flexGrow: 1 },
  tabRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  ring: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 10,
    borderColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  time: {
    fontSize: 44,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modeLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
  },
  sessionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  subjectCard: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  presetsLabel: {
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
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  presetText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

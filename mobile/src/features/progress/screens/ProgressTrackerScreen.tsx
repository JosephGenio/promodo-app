import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { StatGrid } from '@/components/StatGrid';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STUDY_HOURS = [0.5, 0.75, 3, 0, 0, 0, 0];
const CHART_HEIGHT = 140;

export function ProgressTrackerScreen() {
  const maxValue = Math.max(...STUDY_HOURS, 1);

  return (
    <ScreenContainer>
      <ScreenHeader title="Progress Tracker" />

      <StatGrid>
        <StatCard
          icon={<Ionicons name="time-outline" size={20} color={theme.accents.blue.fg} />}
          accent="blue"
          value="5.1h"
          label="Study Hours"
        />
        <StatCard
          icon={<Ionicons name="flame" size={20} color={theme.accents.orange.fg} />}
          accent="orange"
          value="0"
          label="Day Streak"
        />
        <StatCard
          icon={<Ionicons name="checkmark-circle" size={20} color={theme.accents.green.fg} />}
          accent="green"
          value="0/6"
          label="Tasks Done"
        />
        <StatCard
          icon={<Ionicons name="radio-button-on-outline" size={20} color={theme.accents.purple.fg} />}
          accent="purple"
          value="1/3"
          label="Goals Done"
        />
        <StatCard
          icon={<MaterialCommunityIcons name="brain" size={20} color={theme.accents.pink.fg} />}
          accent="pink"
          value="75%"
          label="Quiz Score"
        />
        <StatCard
          icon={<Ionicons name="ribbon-outline" size={20} color={theme.accents.indigo.fg} />}
          accent="indigo"
          value="4"
          label="Sessions"
        />
      </StatGrid>

      <SectionCard style={styles.chartCard}>
        <View style={styles.chartTitleRow}>
          <Ionicons name="trending-up" size={18} color={theme.colors.primary} />
          <Text style={styles.chartTitle}>Study Hours (Last 7 Days)</Text>
        </View>
        <View style={styles.chart}>
          {STUDY_HOURS.map((value, index) => (
            <View key={DAYS[index]} style={styles.barColumn}>
              {value > 0 ? <Text style={styles.barValue}>{value}h</Text> : null}
              <View style={[styles.bar, { height: Math.max((value / maxValue) * CHART_HEIGHT, 2) }]} />
              <Text style={styles.barLabel}>{DAYS[index]}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    gap: theme.spacing.md,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  chartTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 40,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 20,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  barValue: {
    ...theme.typography.tiny,
    color: theme.colors.textSecondary,
  },
  barLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

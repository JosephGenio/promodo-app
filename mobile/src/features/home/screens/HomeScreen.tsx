import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, type AccentKey } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { StatGrid } from '@/components/StatGrid';
import { useAuth } from '@/features/auth/AuthContext';
import type { MainTabParamList, MainTabScreenProps } from '@/navigation/types';

type FeatureRoute = Exclude<
  keyof MainTabParamList,
  'Home' | 'Timer' | 'Tasks' | 'Notes' | 'Profile' | 'QuizTake'
>;

type FeatureItem = {
  route: FeatureRoute;
  title: string;
  subtitle: string;
  accent: AccentKey;
  icon: React.ReactNode;
};

const FEATURES: FeatureItem[] = [
  {
    route: 'StudyPlanner',
    title: 'Study Planner',
    subtitle: 'Plan your study sessions',
    accent: 'indigo',
    icon: <Ionicons name="calendar-outline" size={22} color={theme.accents.indigo.fg} />,
  },
  {
    route: 'QuizMaker',
    title: 'Self-Quiz Maker',
    subtitle: 'Create & take quizzes',
    accent: 'purple',
    icon: <Ionicons name="help-circle-outline" size={22} color={theme.accents.purple.fg} />,
  },
  {
    route: 'WeeklyGoals',
    title: 'Weekly Goals',
    subtitle: 'Set targets & stay motivated',
    accent: 'green',
    icon: <Ionicons name="checkmark-done-outline" size={22} color={theme.accents.green.fg} />,
  },
  {
    route: 'ProgressTracker',
    title: 'Progress Tracker',
    subtitle: 'See how far you’ve come',
    accent: 'blue',
    icon: <Ionicons name="stats-chart-outline" size={22} color={theme.accents.blue.fg} />,
  },
  {
    route: 'MoodEnergy',
    title: 'Mood & Energy',
    subtitle: 'Check in before you study',
    accent: 'amber',
    icon: <Ionicons name="happy-outline" size={22} color={theme.accents.amber.fg} />,
  },
  {
    route: 'DailyReflection',
    title: 'Daily Reflection',
    subtitle: 'Reflect on your sessions',
    accent: 'pink',
    icon: <Ionicons name="book-outline" size={22} color={theme.accents.pink.fg} />,
  },
  {
    route: 'ExamCountdown',
    title: 'Exam Countdown',
    subtitle: 'Never miss an exam date',
    accent: 'red',
    icon: <Ionicons name="alarm-outline" size={22} color={theme.accents.red.fg} />,
  },
  {
    route: 'DailyReminder',
    title: 'Daily Reminder',
    subtitle: 'Stay on top of your routine',
    accent: 'orange',
    icon: <Ionicons name="notifications-outline" size={22} color={theme.accents.orange.fg} />,
  },
  {
    route: 'AchievementBadges',
    title: 'Achievement Badges',
    subtitle: 'Earn badges as you progress',
    accent: 'indigo',
    icon: <MaterialCommunityIcons name="medal-outline" size={22} color={theme.accents.indigo.fg} />,
  },
];

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? user?.email.split('@')[0] ?? 'there';

  return (
    <ScreenContainer>
      <ScreenHeader title="Home" subtitle={`Welcome back, ${firstName}!`} />

      <StatGrid>
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
      </StatGrid>

      <Text style={styles.sectionTitle}>Study Tools</Text>
      <View style={styles.grid}>
        {FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature.route}
            style={styles.cardWrap}
            onPress={() => navigation.navigate(feature.route)}
          >
            <SectionCard style={styles.card}>
              <View style={[styles.iconBadge, { backgroundColor: theme.accents[feature.accent].bg }]}>
                {feature.icon}
              </View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
            </SectionCard>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  cardWrap: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  card: {
    gap: 2,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

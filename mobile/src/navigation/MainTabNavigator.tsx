import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '@/theme/theme';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { PomodoroScreen } from '@/features/pomodoro/screens/PomodoroScreen';
import { TodoListScreen } from '@/features/todo/screens/TodoListScreen';
import { DigitalNotesScreen } from '@/features/notes/screens/DigitalNotesScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { DailyReflectionScreen } from '@/features/reflection/screens/DailyReflectionScreen';
import { MoodEnergyScreen } from '@/features/mood/screens/MoodEnergyScreen';
import { ProgressTrackerScreen } from '@/features/progress/screens/ProgressTrackerScreen';
import { QuizMakerScreen } from '@/features/quiz/screens/QuizMakerScreen';
import { QuizTakeScreen } from '@/features/quiz/screens/QuizTakeScreen';
import { StudyPlannerScreen } from '@/features/planner/screens/StudyPlannerScreen';
import { WeeklyGoalsScreen } from '@/features/goals/screens/WeeklyGoalsScreen';
import { DailyReminderScreen } from '@/features/reminders/screens/DailyReminderScreen';
import { ExamCountdownScreen } from '@/features/exams/screens/ExamCountdownScreen';
import { AchievementBadgesScreen } from '@/features/achievements/screens/AchievementBadgesScreen';
import type { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Partial<Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap>> = {
  Home: 'home-outline',
  Timer: 'timer-outline',
  Tasks: 'checkbox-outline',
  Notes: 'document-text-outline',
  Profile: 'person-outline',
};

// Hidden tabs are reached via navigation.navigate(...) from Home/Profile,
// never from a tab bar button, but staying inside the same tab navigator
// keeps the bottom bar visible on every screen (see navigation/types.ts).
//
// tabBarButton: () => null only removes the button's *content* — the tab
// bar still gives every route (hidden or not) an equal flex:1 slot in the
// row (see @react-navigation/bottom-tabs' BottomTabBar `bottomItem` style),
// so 10 empty hidden slots squeeze the 5 visible tabs into 5/15 of the bar
// width. tabBarItemStyle collapses that slot to zero width so the visible
// tabs' flex:1 can split the full bar width evenly among themselves.
const hiddenTabOptions = {
  tabBarButton: () => null,
  tabBarItemStyle: { flex: 0, width: 0, height: 0, padding: 0, margin: 0 },
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        // Fixed size + no OS font-scaling: with 5 tabs, letting a device's
        // large-text/accessibility setting scale this up truncates labels
        // to a single character (e.g. "H…", "T…") since each tab has a
        // narrow, roughly-equal share of the bar's width.
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarAllowFontScaling: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] ?? 'ellipse-outline'} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timer" component={PomodoroScreen} />
      <Tab.Screen name="Tasks" component={TodoListScreen} />
      <Tab.Screen name="Notes" component={DigitalNotesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      <Tab.Screen name="DailyReflection" component={DailyReflectionScreen} options={hiddenTabOptions} />
      <Tab.Screen name="MoodEnergy" component={MoodEnergyScreen} options={hiddenTabOptions} />
      <Tab.Screen name="ProgressTracker" component={ProgressTrackerScreen} options={hiddenTabOptions} />
      <Tab.Screen name="QuizMaker" component={QuizMakerScreen} options={hiddenTabOptions} />
      <Tab.Screen name="QuizTake" component={QuizTakeScreen} options={hiddenTabOptions} />
      <Tab.Screen name="StudyPlanner" component={StudyPlannerScreen} options={hiddenTabOptions} />
      <Tab.Screen name="WeeklyGoals" component={WeeklyGoalsScreen} options={hiddenTabOptions} />
      <Tab.Screen name="DailyReminder" component={DailyReminderScreen} options={hiddenTabOptions} />
      <Tab.Screen name="ExamCountdown" component={ExamCountdownScreen} options={hiddenTabOptions} />
      <Tab.Screen name="AchievementBadges" component={AchievementBadgesScreen} options={hiddenTabOptions} />
    </Tab.Navigator>
  );
}

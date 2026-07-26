import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

// A single tab navigator holds every main-app screen. Home/Timer/Tasks/
// Notes/Profile render a visible tab bar button; the rest (reached via
// Home's feature grid or Profile's links) are registered as tabs with
// their button hidden, so the same persistent bottom bar stays visible
// everywhere, matching the reference design (no screen shows a back arrow).
export type MainTabParamList = {
  Home: undefined;
  Timer: undefined;
  Tasks: undefined;
  Notes: undefined;
  Profile: undefined;
  DailyReflection: undefined;
  MoodEnergy: undefined;
  ProgressTracker: undefined;
  QuizMaker: undefined;
  QuizTake: { quizId: string };
  StudyPlanner: undefined;
  WeeklyGoals: undefined;
  DailyReminder: undefined;
  ExamCountdown: undefined;
  AchievementBadges: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

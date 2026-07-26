import type { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({ children, scroll = true, contentContainerStyle }: Props) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.body, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
});

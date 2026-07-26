import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/theme/theme';

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
});

import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme, type AccentKey } from '@/theme/theme';
import { SectionCard } from '@/components/SectionCard';

type Props = {
  icon: ReactNode;
  accent: AccentKey;
  value: string;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ icon, accent, value, label, style }: Props) {
  const accentColors = theme.accents[accent];
  return (
    <SectionCard style={[styles.card, style]}>
      <View style={[styles.iconBadge, { backgroundColor: accentColors.bg }]}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xs,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.h1,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

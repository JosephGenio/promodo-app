import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { theme, type AccentKey } from '@/theme/theme';

type Props = {
  label: string;
  accent?: AccentKey;
  style?: StyleProp<ViewStyle>;
};

export function TagPill({ label, accent = 'indigo', style }: Props) {
  const accentColors = theme.accents[accent];
  return (
    <Text style={[styles.pill, { backgroundColor: accentColors.bg, color: accentColors.fg }, style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    ...theme.typography.captionBold,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
});

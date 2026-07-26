import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  variant?: 'gradient' | 'solid';
  style?: StyleProp<ViewStyle>;
};

export function Pill({ label, active, onPress, variant = 'solid', style }: Props) {
  if (active && variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.flex, style]}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pill}
        >
          <Text style={styles.activeLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        style,
        active ? styles.solidActive : styles.inactive,
      ]}
    >
      <Text style={active ? styles.activeLabel : styles.inactiveLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {
    flexGrow: 1,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  solidActive: {
    backgroundColor: theme.colors.primary,
  },
  inactive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  activeLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
  inactiveLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
});

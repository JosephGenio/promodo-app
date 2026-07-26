import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GradientButton({ label, onPress, icon, disabled, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[disabled && styles.disabled, style]}>
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {icon}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  label: {
    ...theme.typography.bodyBold,
    color: theme.colors.white,
  },
  disabled: {
    opacity: 0.6,
  },
});

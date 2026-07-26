import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function IconCircleButton({ name, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.circle} onPress={onPress} disabled={!onPress}>
      <Ionicons name={name} size={18} color={theme.colors.textPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card,
  },
});

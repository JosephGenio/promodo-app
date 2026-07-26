import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
};

export function StarRating({ value, onChange, max = 5, size = 22 }: Props) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <View style={styles.row}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          hitSlop={4}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? theme.colors.star : theme.colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});

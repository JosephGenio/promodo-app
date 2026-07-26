import { StyleSheet, View } from 'react-native';
import { theme } from '@/theme/theme';

type Props = {
  percent: number;
  color?: string;
  trackColor?: string;
};

export function ProgressBar({ percent, color = theme.colors.primary, trackColor = theme.colors.primaryLight }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
});

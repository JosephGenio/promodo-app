import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { StatGrid } from '@/components/StatGrid';
import { IconCircleButton } from '@/components/IconCircleButton';
import { useAuth } from '@/features/auth/AuthContext';
import type { MainTabScreenProps } from '@/navigation/types';

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const { user, signOut } = useAuth();
  const name = user?.name ?? user?.email.split('@')[0] ?? 'Student';
  const initial = name.charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Profile"
        right={<IconCircleButton name="pencil-outline" />}
      />

      <LinearGradient
        colors={theme.gradients.profileHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="school-outline" size={14} color={theme.colors.white} />
              <Text style={styles.badgeText}>Grade N/A</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="business-outline" size={14} color={theme.colors.white} />
              <Text style={styles.badgeText}>School N/A</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <StatGrid>
        <StatCard
          icon={<Ionicons name="time-outline" size={20} color={theme.accents.blue.fg} />}
          accent="blue"
          value="0h"
          label="Study Hours"
        />
        <StatCard
          icon={<Ionicons name="flame" size={20} color={theme.accents.orange.fg} />}
          accent="orange"
          value="0"
          label="Day Streak"
        />
        <StatCard
          icon={<Ionicons name="checkmark-circle" size={20} color={theme.accents.green.fg} />}
          accent="green"
          value="0/6"
          label="Tasks Done"
        />
        <StatCard
          icon={<Ionicons name="radio-button-on-outline" size={20} color={theme.accents.purple.fg} />}
          accent="purple"
          value="1/3"
          label="Goals Done"
        />
        <StatCard
          icon={<MaterialCommunityIcons name="brain" size={20} color={theme.accents.pink.fg} />}
          accent="pink"
          value="75%"
          label="Quiz Score"
        />
        <StatCard
          icon={<Ionicons name="time-outline" size={20} color={theme.accents.indigo.fg} />}
          accent="indigo"
          value="4"
          label="Sessions"
        />
      </StatGrid>

      <TouchableOpacity onPress={() => navigation.navigate('ProgressTracker')}>
        <SectionCard style={styles.linkCard}>
          <Ionicons name="bar-chart-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.linkText}>View Detailed Progress</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </SectionCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => void signOut()}>
        <SectionCard style={styles.linkCard}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={[styles.linkText, { color: theme.colors.error }]}>Sign Out</Text>
        </SectionCard>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.white,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.white,
  },
  email: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  linkText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});

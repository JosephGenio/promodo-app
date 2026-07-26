import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { TagPill } from '@/components/TagPill';
import { GradientButton } from '@/components/GradientButton';

type EventType = 'Test' | 'Assignment' | 'Study';

type PlannerEvent = {
  id: string;
  dateKey: string;
  title: string;
  type: EventType;
  subject: string;
  time: string;
  notes: string;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const TYPE_ACCENT: Record<EventType, 'red' | 'orange' | 'blue'> = {
  Test: 'red',
  Assignment: 'orange',
  Study: 'blue',
};
const TYPE_ICON: Record<EventType, keyof typeof Ionicons.glyphMap> = {
  Test: 'flask-outline',
  Assignment: 'document-text-outline',
  Study: 'book-outline',
};

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildCalendarGrid(monthDate: Date): (Date | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const INITIAL_EVENTS: PlannerEvent[] = [];

export function StudyPlannerScreen() {
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<PlannerEvent[]>(INITIAL_EVENTS);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Study');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const grid = useMemo(() => buildCalendarGrid(monthDate), [monthDate]);
  const eventDateKeys = useMemo(() => new Set(events.map((event) => event.dateKey)), [events]);
  const selectedKey = dateKey(selectedDate);
  const dayEvents = events.filter((event) => event.dateKey === selectedKey);

  function changeMonth(delta: number) {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function addEvent() {
    if (!title.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        dateKey: selectedKey,
        title: title.trim(),
        type,
        subject: subject.trim(),
        time: time.trim(),
        notes: notes.trim(),
      },
    ]);
    setTitle('');
    setSubject('');
    setTime('');
    setNotes('');
    setIsAdding(false);
  }

  const selectedLabel = selectedDate
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();

  return (
    <ScreenContainer>
      <ScreenHeader title="Study Planner" />

      <SectionCard style={styles.calendarCard}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((date, index) => {
            if (!date) return <View key={index} style={styles.cell} />;
            const isSelected = dateKey(date) === selectedKey;
            const hasEvent = eventDateKeys.has(dateKey(date));
            return (
              <TouchableOpacity key={index} style={styles.cell} onPress={() => setSelectedDate(date)}>
                <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{date.getDate()}</Text>
                </View>
                {hasEvent ? <View style={styles.eventDot} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </SectionCard>

      <View style={styles.dayHeaderRow}>
        <Text style={styles.dayHeaderLabel}>{selectedLabel}</Text>
        <TouchableOpacity onPress={() => setIsAdding((prev) => !prev)}>
          <Text style={styles.addLink}>{isAdding ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {isAdding ? (
        <SectionCard style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.typeRow}>
            {(['Study', 'Assignment', 'Test'] as EventType[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.typeChip, type === option && styles.typeChipActive]}
                onPress={() => setType(option)}
              >
                <Text style={[styles.typeChipText, type === option && styles.typeChipTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={theme.colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (e.g. 06:00 PM)"
            placeholderTextColor={theme.colors.textMuted}
            value={time}
            onChangeText={setTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            placeholderTextColor={theme.colors.textMuted}
            value={notes}
            onChangeText={setNotes}
          />
          <GradientButton label="Add to Planner" onPress={addEvent} />
        </SectionCard>
      ) : null}

      {dayEvents.length === 0 && !isAdding ? (
        <Text style={styles.empty}>Nothing planned for this day.</Text>
      ) : (
        dayEvents.map((event) => (
          <SectionCard key={event.id} style={styles.eventCard}>
            <View style={[styles.eventIcon, { backgroundColor: theme.accents[TYPE_ACCENT[event.type]].bg }]}>
              <Ionicons name={TYPE_ICON[event.type]} size={18} color={theme.accents[TYPE_ACCENT[event.type]].fg} />
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventTitleRow}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <TagPill label={event.type} accent={TYPE_ACCENT[event.type]} />
              </View>
              {event.subject ? <Text style={styles.eventMeta}>{event.subject}</Text> : null}
              {event.time ? <Text style={styles.eventMeta}>{event.time}</Text> : null}
              {event.notes ? <Text style={styles.eventNotes}>{event.notes}</Text> : null}
            </View>
          </SectionCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    gap: theme.spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  dayTextActive: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayHeaderLabel: {
    ...theme.typography.captionBold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  addLink: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
  addCard: {
    gap: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm + 2,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
  typeChipTextActive: {
    color: theme.colors.white,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  eventCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  eventMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  eventNotes: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

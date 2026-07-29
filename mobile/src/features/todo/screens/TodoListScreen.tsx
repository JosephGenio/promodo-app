import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { GradientButton } from '@/components/GradientButton';
import * as todoApi from '@/features/todo/api';
import type { Todo } from '@/features/todo/api';

type Filter = 'Active' | 'Done' | 'All';

export function TodoListScreen() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>('Active');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadTasks() {
    setIsLoading(true);
    setLoadError(false);
    todoApi
      .fetchTodos()
      .then(setTasks)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadTasks, []);

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'Active') return !task.done;
    if (filter === 'Done') return task.done;
    return true;
  });

  function toggleTask(id: string) {
    const previous = tasks;
    const target = tasks.find((task) => task.id === id);
    if (!target) return;
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
    todoApi.updateTodo(id, { done: !target.done }).catch(() => setTasks(previous));
  }

  function deleteTask(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== id));
    todoApi.deleteTodo(id).catch(() => setTasks(previous));
  }

  async function addTask() {
    if (!newTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await todoApi.createTodo({
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setIsAdding(false);
    } catch {
      // leave the form open with the entered values so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="To-Do List"
        right={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding((prev) => !prev)}>
            <Ionicons name={isAdding ? 'close' : 'add'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.segmented}>
        {(['Active', 'Done', 'All'] as Filter[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.segment, filter === option && styles.segmentActive]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.segmentText, filter === option && styles.segmentTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isAdding ? (
        <SectionCard style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Task title"
            placeholderTextColor={theme.colors.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Description (optional)"
            placeholderTextColor={theme.colors.textMuted}
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
          />
          <GradientButton
            label={isSubmitting ? 'Adding…' : 'Add Task'}
            onPress={addTask}
            disabled={isSubmitting}
          />
        </SectionCard>
      ) : null}

      {isLoading ? (
        <Text style={styles.empty}>Loading tasks…</Text>
      ) : loadError ? (
        <TouchableOpacity onPress={loadTasks}>
          <Text style={styles.empty}>Couldn't load tasks. Tap to retry.</Text>
        </TouchableOpacity>
      ) : visibleTasks.length === 0 ? (
        <Text style={styles.empty}>No {filter.toLowerCase()} tasks yet.</Text>
      ) : (
        visibleTasks.map((task) => (
          <SectionCard key={task.id} style={styles.taskCard}>
            <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.checkbox}>
              {task.done ? (
                <Ionicons name="checkbox" size={22} color={theme.colors.primary} />
              ) : (
                <Ionicons name="square-outline" size={22} color={theme.colors.border} />
              )}
            </TouchableOpacity>
            <View style={styles.taskBody}>
              <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
              {task.description ? (
                <Text style={styles.taskDescription} numberOfLines={3}>
                  {task.description}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => deleteTask(task.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </SectionCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.textPrimary,
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
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  checkbox: {
    paddingTop: 2,
  },
  taskBody: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  taskTitleDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

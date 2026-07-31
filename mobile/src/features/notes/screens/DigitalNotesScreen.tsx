import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';
import { TagPill } from '@/components/TagPill';
import { GradientButton } from '@/components/GradientButton';
import * as notesApi from '@/features/notes/api';
import type { Note } from '@/features/notes/api';

export function DigitalNotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadNotes() {
    setIsLoading(true);
    setLoadError(false);
    notesApi
      .fetchNotes()
      .then(setNotes)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadNotes, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(notes.map((note) => note.category)));
    return ['All', ...unique];
  }, [notes]);

  const visibleNotes = notes.filter((note) => {
    const matchesCategory = activeCategory === 'All' || note.category === activeCategory;
    const matchesSearch =
      search.trim().length === 0 ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function addNote() {
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await notesApi.createNote({
        title: newTitle.trim(),
        category: newCategory.trim() || 'General',
        content: newContent.trim(),
      });
      setNotes((prev) => [created, ...prev]);
      setNewTitle('');
      setNewCategory('');
      setNewContent('');
      setIsAdding(false);
    } catch {
      // leave the form open with the entered values so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  function deleteNote(id: string) {
    const previous = notes;
    setNotes((prev) => prev.filter((note) => note.id !== id));
    notesApi.deleteNote(id).catch(() => setNotes(previous));
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Digital Notes"
        right={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding((prev) => !prev)}>
            <Ionicons name={isAdding ? 'close' : 'add'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.chipsRow}>
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAdding ? (
        <SectionCard style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Note title"
            placeholderTextColor={theme.colors.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Category (e.g. Mathematics)"
            placeholderTextColor={theme.colors.textMuted}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Write your note..."
            placeholderTextColor={theme.colors.textMuted}
            value={newContent}
            onChangeText={setNewContent}
            multiline
          />
          <GradientButton
            label={isSubmitting ? 'Saving…' : 'Save Note'}
            onPress={addNote}
            disabled={isSubmitting}
          />
        </SectionCard>
      ) : null}

      {isLoading ? (
        <Text style={styles.noteContent}>Loading notes…</Text>
      ) : loadError ? (
        <TouchableOpacity onPress={loadNotes}>
          <Text style={styles.noteContent}>Couldn't load notes. Tap to retry.</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.grid}>
          {visibleNotes.map((note) => (
            <SectionCard key={note.id} style={styles.noteCard}>
              <View style={styles.headerRow}>
                <TagPill label={note.category} accent="amber" />
                <TouchableOpacity onPress={() => deleteNote(note.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteContent} numberOfLines={4}>
                {note.content}
              </Text>
            </SectionCard>
          ))}
        </View>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.white,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  noteCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  noteContent: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

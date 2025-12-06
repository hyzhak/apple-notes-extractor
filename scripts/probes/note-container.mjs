/**
 * Minimal probe: via @jxa/run, print first note's container chain.
 * Run: node scripts/probes/note-container.mjs
 */
import { run } from '@jxa/run';

const result = await run(() => {
  const Notes = Application('Notes');
  const self = Application.currentApplication();
  self.includeStandardAdditions = true;

  const safe = (fn, fallback = null) => {
    try {
      const value = fn();
      return value === undefined ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const nameOf = (obj) => {
    return obj && typeof obj.name === 'function' ? safe(() => obj.name(), '<unnamed>') : '<unknown>';
  };

  const describeContainer = (note) => {
    const chain = [];
    let current = safe(() => note.container && note.container());
    while (current) {
      chain.push(nameOf(current));
      current = safe(() => current.container && current.container());
    }
    return chain;
  };

  const notes = safe(() => Notes.notes(), []);
  const count = notes.length ?? 0;

  if (!count) {
    return { count: 0, note: null };
  }

  const note = notes[0];
  return {
    count,
    note: {
      id: safe(() => (typeof note.id === 'function' ? note.id() : null)),
      name: safe(() => (typeof note.name === 'function' ? note.name() : null)),
      containerChain: describeContainer(note)
    }
  };
});

console.log(JSON.stringify(result, null, 2));

// Augment the global ImportMeta with Node.js 21.2+ fields (import.meta.dirname / .filename).
// @types/node v18 predates these additions; we add them here so tsc is happy.
// This file must remain a "script" (no import/export) to merge into the global scope.

interface ImportMeta {
  dirname:  string;
  filename: string;
}

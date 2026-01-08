import Typo from 'typo-js';
import { linter, Diagnostic } from '@codemirror/lint';
import { EditorView, keymap } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';
import { CompletionContext, Completion, startCompletion } from '@codemirror/autocomplete';
import affData from './dictionaries/en_US.aff?raw';
import dicData from './dictionaries/en_US.dic?raw';

// Initialize Typo.js with bundled dictionary
let typoInstance: Typo | null = null;

function getTypo(): Typo {
  if (!typoInstance) {
    typoInstance = new Typo('en_US', affData, dicData);
  }
  return typoInstance;
}

// Words to ignore (common technical terms, markdown syntax, etc.)
const ignoreWords = new Set([
  // Technical terms
  'api', 'apis', 'url', 'urls', 'html', 'css', 'js', 'jsx', 'tsx', 'json',
  'npm', 'yarn', 'pnpm', 'git', 'github', 'localhost', 'http', 'https',
  'async', 'await', 'const', 'let', 'var', 'func', 'params', 'args',
  'config', 'configs', 'env', 'dev', 'prod', 'src', 'dist', 'node',
  'ui', 'ux', 'cli', 'gui', 'ide', 'sdk', 'cdn', 'dns', 'ssl', 'tls',
  'jwt', 'oauth', 'auth', 'crypto', 'regex', 'yaml', 'toml', 'xml',
  'frontend', 'backend', 'fullstack', 'middleware', 'webhook', 'websocket',
  'localhost', 'stylesheet', 'inline', 'metadata', 'timestamp', 'boolean',
  // Common abbreviations
  'etc', 'eg', 'ie', 'vs', 'ok', 'id', 'ids',
  // Markdown/blog terms
  'frontmatter', 'markdown', 'mdx', 'blockquote', 'codeblock',
  'todo', 'todos', 'readme', 'changelog',
]);

// Custom dictionary - user can add words here
const customDictionary = new Set<string>();

// Add word to custom dictionary
export function addToCustomDictionary(word: string): void {
  customDictionary.add(word.toLowerCase());
}

// Check if a word is correctly spelled
export function isWordCorrect(word: string): boolean {
  const lowerWord = word.toLowerCase();

  if (word.length <= 2) return true;
  if (ignoreWords.has(lowerWord) || customDictionary.has(lowerWord)) return true;
  if (/[_]/.test(word) || /[A-Z].*[A-Z]/.test(word)) return true;
  if (word === word.toUpperCase() && word.length > 1) return true;
  if (/\d/.test(word)) return true;

  return getTypo().check(word);
}

// Get spelling suggestions for a word
export function getSuggestions(word: string): string[] {
  return getTypo().suggest(word, 8);
}

// Extract words from text, preserving positions
interface WordPosition {
  word: string;
  from: number;
  to: number;
}

function extractWords(text: string, offset: number): WordPosition[] {
  const words: WordPosition[] = [];
  const wordRegex = /[a-zA-Z]+(?:['\u2019][a-zA-Z]+)*/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    words.push({
      word: match[0],
      from: offset + match.index,
      to: offset + match.index + match[0].length
    });
  }

  return words;
}

// Check if position is in code block
function isInSpecialBlock(doc: string, pos: number): boolean {
  const beforePos = doc.slice(0, pos);
  const codeBlockMatches = beforePos.match(/```/g) || [];
  if (codeBlockMatches.length % 2 === 1) return true;

  const line = doc.slice(doc.lastIndexOf('\n', pos - 1) + 1, pos);
  const backticks = line.match(/`/g) || [];
  if (backticks.length % 2 === 1) return true;

  return false;
}

// Check if position is in YAML frontmatter
function isInFrontmatter(doc: string, pos: number): boolean {
  if (!doc.startsWith('---')) return false;

  const firstDash = doc.indexOf('---');
  const secondDash = doc.indexOf('---', firstDash + 3);

  if (secondDash === -1) return false;

  return pos >= firstDash && pos <= secondDash + 3;
}

// Find word at cursor position
function getWordAtCursor(view: EditorView): { word: string; from: number; to: number } | null {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  const lineText = line.text;
  const posInLine = pos - line.from;

  let start = posInLine;
  let end = posInLine;

  while (start > 0 && /[a-zA-Z'\u2019]/.test(lineText[start - 1])) {
    start--;
  }
  while (end < lineText.length && /[a-zA-Z'\u2019]/.test(lineText[end])) {
    end++;
  }

  if (start === end) return null;

  const word = lineText.slice(start, end);
  return {
    word,
    from: line.from + start,
    to: line.from + end
  };
}

// State effect to trigger spell check completion
const triggerSpellCheck = StateEffect.define<boolean>();

// Store grammar issues for the completion source
interface GrammarIssue {
  from: number;
  to: number;
  fix: string;
  original: string;
  message?: string;
  replacements?: string[];
}

let grammarIssuesCache: GrammarIssue[] = [];

// LanguageTool API integration
interface LanguageToolMatch {
  message: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  rule: {
    id: string;
    description: string;
    category: { id: string; name: string };
  };
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
}

// Cache for LanguageTool results
let languageToolCache: { text: string; matches: LanguageToolMatch[] } | null = null;
let languageToolPending = false;

// Check grammar with LanguageTool API
async function checkGrammarWithLanguageTool(text: string): Promise<LanguageToolMatch[]> {
  // Return cached results if text hasn't changed
  if (languageToolCache && languageToolCache.text === text) {
    return languageToolCache.matches;
  }

  // Don't make multiple simultaneous requests
  if (languageToolPending) {
    return languageToolCache?.matches || [];
  }

  // Skip very short texts
  if (text.trim().length < 10) {
    return [];
  }

  languageToolPending = true;

  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US',
        enabledOnly: 'false',
      }),
    });

    if (!response.ok) {
      console.warn('LanguageTool API error:', response.status);
      return [];
    }

    const data: LanguageToolResponse = await response.json();

    // Filter out some overly pedantic rules
    const filteredMatches = data.matches.filter(match => {
      const ruleId = match.rule.id;
      // Skip some common false positives
      if (ruleId === 'WHITESPACE_RULE') return false;
      if (ruleId === 'EN_QUOTES') return false;
      if (ruleId === 'MORFOLOGIK_RULE_EN_US') return false; // Spelling - we handle separately
      return true;
    });

    languageToolCache = { text, matches: filteredMatches };
    return filteredMatches;
  } catch (error) {
    console.warn('LanguageTool API error:', error);
    return [];
  } finally {
    languageToolPending = false;
  }
}

// Extract content text from document (excluding frontmatter, code blocks, etc.)
function extractContentForGrammarCheck(doc: string): { text: string; offsetMap: Array<{ docOffset: number; textOffset: number }> } {
  const lines = doc.split('\n');
  let inFrontmatter = false;
  let inCodeBlock = false;
  let frontmatterCount = 0;

  const textParts: string[] = [];
  const offsetMap: Array<{ docOffset: number; textOffset: number }> = [];
  let currentTextOffset = 0;
  let currentDocOffset = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Track frontmatter
    if (trimmedLine === '---') {
      frontmatterCount++;
      if (frontmatterCount === 1) inFrontmatter = true;
      else if (frontmatterCount === 2) inFrontmatter = false;
    }

    // Track code blocks
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // Skip special content
    const shouldSkip = inFrontmatter || inCodeBlock ||
      trimmedLine.startsWith('#') ||
      trimmedLine.startsWith('@') ||
      trimmedLine.startsWith('![') ||
      trimmedLine.startsWith('[') ||
      trimmedLine === '---' ||
      trimmedLine === '===' ||
      trimmedLine.startsWith('```');

    if (!shouldSkip && line.trim().length > 0) {
      offsetMap.push({ docOffset: currentDocOffset, textOffset: currentTextOffset });
      textParts.push(line);
      currentTextOffset += line.length + 1; // +1 for newline
    }

    currentDocOffset += line.length + 1;
  }

  return { text: textParts.join('\n'), offsetMap };
}

// Convert LanguageTool offset to document offset
function languageToolOffsetToDoc(ltOffset: number, offsetMap: Array<{ docOffset: number; textOffset: number }>): number {
  for (let i = offsetMap.length - 1; i >= 0; i--) {
    if (ltOffset >= offsetMap[i].textOffset) {
      return offsetMap[i].docOffset + (ltOffset - offsetMap[i].textOffset);
    }
  }
  return ltOffset;
}

// Get grammar fix at cursor position
function getGrammarFixAtCursor(view: EditorView): GrammarIssue | null {
  const pos = view.state.selection.main.head;
  return grammarIssuesCache.find(issue => pos >= issue.from && pos <= issue.to) || null;
}

// Spell check completion source - triggered by Cmd+. or context menu
export function spellCheckCompletionSource(context: CompletionContext) {
  if (!context.view) return null;

  // First check for grammar issues (they take priority since they have specific fixes)
  const grammarIssue = getGrammarFixAtCursor(context.view);
  if (grammarIssue) {
    const options: Completion[] = [];

    // Add all replacement options from LanguageTool
    const replacements = grammarIssue.replacements || [grammarIssue.fix];
    replacements.slice(0, 5).forEach((replacement, index) => {
      if (replacement && replacement !== grammarIssue.original) {
        options.push({
          label: replacement,
          type: 'text',
          detail: index === 0 ? grammarIssue.message : undefined,
          boost: 100 - index,
          apply: (view) => {
            view.dispatch({
              changes: { from: grammarIssue.from, to: grammarIssue.to, insert: replacement }
            });
          }
        });
      }
    });

    if (options.length === 0) return null;

    return {
      from: grammarIssue.from,
      to: grammarIssue.to,
      options,
      validFor: /^.*$/
    };
  }

  // Then check for spelling issues
  const wordInfo = getWordAtCursor(context.view);

  if (!wordInfo) return null;

  const { word, from, to } = wordInfo;

  if (isWordCorrect(word)) return null;

  const suggestions = getSuggestions(word);
  if (suggestions.length === 0) return null;

  const options: Completion[] = suggestions.map((suggestion, index) => ({
    label: suggestion,
    type: 'text',
    boost: 100 - index,
    apply: (view, completion, from, to) => {
      let finalSuggestion = suggestion;
      if (word[0] === word[0].toUpperCase()) {
        finalSuggestion = suggestion[0].toUpperCase() + suggestion.slice(1);
      }
      view.dispatch({
        changes: { from, to, insert: finalSuggestion }
      });
    }
  }));

  options.push({
    label: `Add "${word}" to dictionary`,
    type: 'keyword',
    boost: -1,
    apply: (view) => {
      addToCustomDictionary(word);
      view.dispatch({
        effects: triggerSpellCheck.of(true)
      });
    }
  });

  return {
    from,
    to,
    options,
    validFor: /^[a-zA-Z]*$/
  };
}

// Helper to check if cursor is on a grammar or spelling issue
function isOnIssue(view: EditorView): boolean {
  const grammarIssue = getGrammarFixAtCursor(view);
  if (grammarIssue) return true;

  const wordInfo = getWordAtCursor(view);
  if (wordInfo && !isWordCorrect(wordInfo.word)) return true;

  return false;
}

// Keymap to trigger spell/grammar check suggestions with Cmd+.
export const spellCheckKeymap = keymap.of([
  {
    key: 'Mod-.',
    run: (view) => {
      if (isOnIssue(view)) {
        startCompletion(view);
        return true;
      }
      return false;
    }
  }
]);

// Create the spell check linter for CodeMirror (async with LanguageTool)
export const spellCheckLinter = linter(async (view) => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc.toString();
  grammarIssuesCache = [];

  // Extract content for grammar check
  const { text: grammarText, offsetMap } = extractContentForGrammarCheck(doc);

  // Run LanguageTool check in parallel with local checks
  const languageToolPromise = checkGrammarWithLanguageTool(grammarText);

  // Local spell checking
  for (let i = 1; i <= view.state.doc.lines; i++) {
    const line = view.state.doc.line(i);
    const lineText = line.text;

    // Skip special lines
    if (lineText.startsWith('```') || lineText.startsWith('---') ||
        lineText.startsWith('@') || lineText.startsWith('#') ||
        lineText.startsWith('![') || lineText.match(/^\[.*\]\(.*\)$/)) {
      continue;
    }

    if (isInFrontmatter(doc, line.from)) continue;
    if (isInSpecialBlock(doc, line.from)) continue;

    // Check spelling
    const words = extractWords(lineText, line.from);

    for (const { word, from, to } of words) {
      const beforeWord = lineText.slice(0, from - line.from);
      const backticks = beforeWord.match(/`/g) || [];
      if (backticks.length % 2 === 1) continue;

      if (lineText.slice(0, from - line.from).includes('[') &&
          !lineText.slice(0, from - line.from).includes(']')) continue;

      if (!isWordCorrect(word)) {
        diagnostics.push({
          from,
          to,
          severity: 'warning',
          message: '',
          source: 'spelling'
        });
      }
    }
  }

  // Wait for LanguageTool results
  try {
    const ltMatches = await languageToolPromise;

    for (const match of ltMatches) {
      const docOffset = languageToolOffsetToDoc(match.offset, offsetMap);
      const from = docOffset;
      const to = docOffset + match.length;

      // Skip if in special block
      if (isInSpecialBlock(doc, from) || isInFrontmatter(doc, from)) continue;

      // Store for completion source
      grammarIssuesCache.push({
        from,
        to,
        fix: match.replacements[0]?.value || '',
        original: doc.slice(from, to),
        message: match.message,
        replacements: match.replacements.map(r => r.value)
      });

      diagnostics.push({
        from,
        to,
        severity: 'info',
        message: '',
        source: 'grammar'
      });
    }
  } catch (error) {
    console.warn('LanguageTool check failed:', error);
  }

  return diagnostics;
}, {
  delay: 3000, // 3 second delay for API calls
  tooltipFilter: () => []
});

// Theme for spell check underlines
export const spellCheckTheme = EditorView.theme({
  '.cm-lintRange-warning': {
    textDecoration: 'underline wavy #ef4444',
    textDecorationSkipInk: 'none'
  },
  '.cm-lintRange-info': {
    textDecoration: 'underline wavy #f59e0b',
    textDecorationSkipInk: 'none'
  },
  // Hide gutter markers
  '.cm-lint-marker-warning, .cm-lint-marker-info': {
    display: 'none'
  },
  // Style the spell check autocomplete
  '.cm-tooltip-autocomplete': {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'
  }
});

/**
 * Helpers for working with Payload's Lexical richtext field value.
 *
 * Payload stores richtext as a serialized Lexical document:
 * `{ root: { children: [...] } }`. The app does not (yet) render Lexical to
 * HTML, so for now we flatten a document to plain text for display in places
 * that previously expected a plain string (e.g. practitioner bio).
 */

interface LexicalNode {
  text?: string
  children?: LexicalNode[]
  [k: string]: unknown
}

export interface LexicalRichText {
  root?: {
    children?: LexicalNode[]
  }
  [k: string]: unknown
}

function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) return node.children.map(nodeText).join('')
  return ''
}

/**
 * Flatten a Lexical richtext value to plain text. Top-level blocks (paragraphs,
 * headings, list items) are separated by blank lines so the result reads
 * sensibly when rendered with `whitespace-pre-line`. Returns '' for empty or
 * non-richtext input.
 */
export function richTextToPlainText(value: unknown): string {
  const root = (value as LexicalRichText | null | undefined)?.root
  if (!root?.children) return ''
  return root.children
    .map((block) => nodeText(block))
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

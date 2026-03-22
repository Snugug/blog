/** Result of splitting a file into frontmatter and body */
export type SplitResult = {
  rawFrontmatter: string;
  body: string;
};

/**
 * Splits a markdown/MDX file into raw YAML frontmatter and body content.
 * Handles BOM stripping, CRLF normalization, and horizontal rule rejection.
 * @param {string} content - Raw file content
 * @return {SplitResult} The separated frontmatter and body strings
 */
export function splitFrontmatter(content: string): SplitResult {
  let str = content.startsWith('\uFEFF') ? content.slice(1) : content;
  str = str.replace(/\r\n/g, '\n');

  // Reject horizontal rules (----) and content not starting with frontmatter delimiter
  if (str.startsWith('----') || !str.startsWith('---\n')) {
    return { rawFrontmatter: '', body: str };
  }

  const closeIndex = str.indexOf('\n---\n', 3);
  if (closeIndex === -1) {
    // Check for --- at end of file with no trailing newline
    if (str.endsWith('\n---')) {
      return {
        rawFrontmatter: str.slice(4, str.length - 4),
        body: '',
      };
    }
    return { rawFrontmatter: '', body: str };
  }

  return {
    rawFrontmatter: str.slice(4, closeIndex),
    body: str.slice(closeIndex + 5),
  };
}

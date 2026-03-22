import { describe, it } from 'node:test';
import assert from 'node:assert';
import { splitFrontmatter } from '../../../src/js/admin/frontmatter.ts';

describe('splitFrontmatter', () => {
  it('splits standard frontmatter from body', () => {
    const content = '---\ntitle: Hello\n---\n\nBody text here.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Hello');
    assert.strictEqual(result.body, '\nBody text here.');
  });

  it('handles frontmatter with no trailing body newline', () => {
    const content = '---\ntitle: Test\n---\nBody';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Test');
    assert.strictEqual(result.body, 'Body');
  });

  it('returns empty frontmatter and full content when no frontmatter', () => {
    const content = 'Just a body with no frontmatter.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, '');
    assert.strictEqual(result.body, 'Just a body with no frontmatter.');
  });

  it('handles empty body after frontmatter', () => {
    const content = '---\ntitle: Empty\n---\n';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Empty');
    assert.strictEqual(result.body, '');
  });

  it('strips BOM before splitting', () => {
    const content = '\uFEFF---\ntitle: BOM\n---\n\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: BOM');
    assert.strictEqual(result.body, '\nBody.');
  });

  it('normalizes CRLF line endings', () => {
    const content = '---\r\ntitle: CRLF\r\n---\r\n\r\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: CRLF');
    assert.strictEqual(result.body, '\nBody.');
  });

  it('rejects horizontal rule (----) as frontmatter', () => {
    const content = '----\nnot frontmatter\n---\n\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, '');
    assert.strictEqual(result.body, '----\nnot frontmatter\n---\n\nBody.');
  });
});

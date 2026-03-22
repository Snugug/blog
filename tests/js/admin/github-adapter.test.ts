// tests/js/admin/github-adapter.test.ts
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

// Tests verify URL construction and request/response handling
// by mocking globalThis.fetch

describe('GitHubAdapter', () => {
  let GitHubAdapter: any;

  beforeEach(async () => {
    const mod = await import('../../../src/js/admin/github-adapter.ts');
    GitHubAdapter = mod.GitHubAdapter;
  });

  describe('validate', () => {
    it('sets default branch from repo metadata', async () => {
      const mockFetch = mock.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'develop' }),
        }),
      );
      globalThis.fetch = mockFetch as any;

      const adapter = new GitHubAdapter('test-token', 'owner/repo');
      await adapter.validate();

      assert.strictEqual(mockFetch.mock.calls.length, 1);
      const [url, opts] = mockFetch.mock.calls[0].arguments;
      assert.strictEqual(url, 'https://api.github.com/repos/owner/repo');
      assert.strictEqual(opts.headers.Authorization, 'Bearer test-token');
    });

    it('throws on 401', async () => {
      globalThis.fetch = mock.fn(() =>
        Promise.resolve({ ok: false, status: 401 }),
      ) as any;

      const adapter = new GitHubAdapter('bad-token', 'owner/repo');
      await assert.rejects(() => adapter.validate(), {
        message: 'Invalid or expired token',
      });
    });

    it('throws on 404', async () => {
      globalThis.fetch = mock.fn(() =>
        Promise.resolve({ ok: false, status: 404 }),
      ) as any;

      const adapter = new GitHubAdapter('token', 'owner/missing');
      await assert.rejects(() => adapter.validate(), {
        message: 'Repository "owner/missing" not found',
      });
    });
  });

  describe('readFile', () => {
    it('requests raw content with correct path and accept header', async () => {
      const mockFetch = mock.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('file content'),
        }),
      );
      globalThis.fetch = mockFetch as any;

      const adapter = new GitHubAdapter('token', 'owner/repo');

      const content = await adapter.readFile('posts', 'hello.md');
      assert.strictEqual(content, 'file content');

      const [url, opts] = mockFetch.mock.calls[0].arguments;
      assert.ok(
        url.includes('/repos/owner/repo/contents/src/content/posts/hello.md'),
      );
      assert.strictEqual(
        opts.headers.Accept,
        'application/vnd.github.raw+json',
      );
    });
  });
});

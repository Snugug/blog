// src/js/admin/github-adapter.ts
import type { StorageAdapter, FileEntry, FileWrite } from './storage-adapter';

/**
 * Storage adapter backed by the GitHub REST API. Uses a Personal Access Token for authentication. All file operations target src/content/{collection}/ within the repository.
 */
export class GitHubAdapter implements StorageAdapter {
  private token: string;
  private owner: string;
  private repo: string;
  // Cached on validate(); defaults to 'main' before validation
  private defaultBranch: string = 'main';

  /**
   * @param {string} token - GitHub Personal Access Token
   * @param {string} repoSlug - Repository in "owner/repo" format
   */
  constructor(token: string, repoSlug: string) {
    this.token = token;
    const [owner, repo] = repoSlug.split('/');
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Validates credentials by fetching repo metadata and caches the default branch.
   * @return {Promise<void>}
   */
  async validate(): Promise<void> {
    const res = await this.request('GET', `/repos/${this.owner}/${this.repo}`);
    if (!res.ok) {
      const status = res.status;
      if (status === 401) throw new Error('Invalid or expired token');
      if (status === 403) throw new Error('Token lacks repository access');
      if (status === 404)
        throw new Error(`Repository "${this.owner}/${this.repo}" not found`);
      throw new Error(`GitHub API error: ${status}`);
    }
    const data = await res.json();
    this.defaultBranch = data.default_branch;
  }

  /**
   * Lists all .md/.mdx files in a collection with their raw content.
   * @param {string} collection - The collection name
   * @return {Promise<FileEntry[]>} Array of filename + content pairs
   */
  async listFiles(collection: string): Promise<FileEntry[]> {
    const path = `src/content/${collection}`;
    // Get directory listing
    const listRes = await this.request(
      'GET',
      `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.defaultBranch}`,
    );
    if (!listRes.ok) {
      if (listRes.status === 404) return [];
      throw new Error(`Failed to list files: ${listRes.status}`);
    }
    const listing: Array<{ name: string; download_url: string }> =
      await listRes.json();

    // Filter to markdown and fetch each file's content
    const mdFiles = listing.filter(
      (f) => f.name.endsWith('.md') || f.name.endsWith('.mdx'),
    );
    const entries: FileEntry[] = [];

    for (const file of mdFiles) {
      const content = await this.readFile(collection, file.name);
      entries.push({ filename: file.name, content });
    }

    return entries;
  }

  /**
   * Reads a single file's raw content via the raw+json Accept header.
   * @param {string} collection - The collection name
   * @param {string} filename - The filename
   * @return {Promise<string>} The file content
   */
  async readFile(collection: string, filename: string): Promise<string> {
    const path = `src/content/${collection}/${filename}`;
    const res = await this.request(
      'GET',
      `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.defaultBranch}`,
      { Accept: 'application/vnd.github.raw+json' },
    );
    if (!res.ok) {
      throw new Error(`Failed to read ${path}: ${res.status}`);
    }
    return res.text();
  }

  /**
   * Writes a single file via the Contents API. Fetches the current SHA for updates.
   * @param {string} collection - The collection name
   * @param {string} filename - The filename
   * @param {string} content - The content to write
   * @return {Promise<void>}
   */
  async writeFile(
    collection: string,
    filename: string,
    content: string,
  ): Promise<void> {
    const path = `src/content/${collection}/${filename}`;
    // Get current SHA if file exists (required by GitHub API for updates)
    let sha: string | undefined;
    const existing = await this.request(
      'GET',
      `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.defaultBranch}`,
    );
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }

    const body: Record<string, string> = {
      message: `Update ${path}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.defaultBranch,
    };
    if (sha) body.sha = sha;

    const res = await this.request(
      'PUT',
      `/repos/${this.owner}/${this.repo}/contents/${path}`,
      undefined,
      body,
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to write ${path}: ${res.status} ${errText}`);
    }
  }

  /**
   * Writes multiple files in a single atomic commit using the Git Trees + Commits API.
   * @param {FileWrite[]} files - Array of files to write
   * @return {Promise<void>}
   */
  async writeFiles(files: FileWrite[]): Promise<void> {
    if (files.length === 0) return;
    if (files.length === 1) {
      await this.writeFile(
        files[0].collection,
        files[0].filename,
        files[0].content,
      );
      return;
    }

    // 1. Get current commit SHA for the default branch
    const refRes = await this.request(
      'GET',
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${this.defaultBranch}`,
    );
    if (!refRes.ok)
      throw new Error(`Failed to get branch ref: ${refRes.status}`);
    const refData = await refRes.json();
    const baseCommitSha = refData.object.sha;

    // Get the base tree SHA from the current commit
    const commitRes = await this.request(
      'GET',
      `/repos/${this.owner}/${this.repo}/git/commits/${baseCommitSha}`,
    );
    if (!commitRes.ok)
      throw new Error(`Failed to get commit: ${commitRes.status}`);
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 2. Create a new tree containing all file changes
    const tree = files.map((f) => ({
      path: `src/content/${f.collection}/${f.filename}`,
      mode: '100644' as const,
      type: 'blob' as const,
      content: f.content,
    }));

    const treeRes = await this.request(
      'POST',
      `/repos/${this.owner}/${this.repo}/git/trees`,
      undefined,
      { base_tree: baseTreeSha, tree },
    );
    if (!treeRes.ok)
      throw new Error(`Failed to create tree: ${treeRes.status}`);
    const treeData = await treeRes.json();

    // 3. Create a new commit pointing at the new tree
    const paths = files.map((f) => `${f.collection}/${f.filename}`).join(', ');
    const newCommitRes = await this.request(
      'POST',
      `/repos/${this.owner}/${this.repo}/git/commits`,
      undefined,
      {
        message: `Update ${paths}`,
        tree: treeData.sha,
        parents: [baseCommitSha],
      },
    );
    if (!newCommitRes.ok)
      throw new Error(`Failed to create commit: ${newCommitRes.status}`);
    const newCommitData = await newCommitRes.json();

    // 4. Advance the branch ref to the new commit
    const updateRefRes = await this.request(
      'PATCH',
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.defaultBranch}`,
      undefined,
      { sha: newCommitData.sha },
    );
    if (!updateRefRes.ok)
      throw new Error(`Failed to update ref: ${updateRefRes.status}`);
  }

  /**
   * Makes an authenticated request to the GitHub API.
   * @param {string} method - HTTP method
   * @param {string} path - API path (appended to https://api.github.com)
   * @param {Record<string, string>} [extraHeaders] - Additional headers to merge
   * @param {unknown} [body] - JSON body to send
   * @return {Promise<Response>} The fetch response
   */
  private async request(
    method: string,
    path: string,
    extraHeaders?: Record<string, string>,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      'X-GitHub-Api-Version': '2026-03-10',
      // Default to JSON so the browser cache distinguishes from raw content requests
      Accept: 'application/vnd.github+json',
      ...extraHeaders,
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(`https://api.github.com${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // API responses must never be served from browser cache
      cache: 'no-store',
    });
  }
}

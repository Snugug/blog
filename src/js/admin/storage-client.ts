// src/js/admin/storage-client.ts
import type {
  StorageRequest,
  StorageResponse,
  FileEntry,
  FileWrite,
} from './storage-adapter';

/**
 * Typed client for communicating with the storage SharedWorker over a MessagePort. Wraps postMessage/onmessage into async request/response calls.
 */
export class StorageClient {
  private port: MessagePort;
  private pending = new Map<
    string,
    { resolve: (v: any) => void; reject: (e: Error) => void }
  >();
  private idCounter = 0;

  /**
   * Creates a client wrapping the given port.
   * @param {MessagePort} port - The port connected to the storage SharedWorker
   */
  constructor(port: MessagePort) {
    this.port = port;
    this.port.addEventListener('message', (event) => {
      this.handleResponse(event.data);
    });
    this.port.start();
  }

  /**
   * Routes responses to their pending promises. Responses without an _id are broadcast (like port-connected) and are ignored here.
   * @param {StorageResponse & { _id?: string }} data - The response data
   * @return {void}
   */
  private handleResponse(data: StorageResponse & { _id?: string }): void {
    if (!data._id) return;
    const entry = this.pending.get(data._id);
    if (!entry) return;
    this.pending.delete(data._id);
    if ('ok' in data && data.ok === false && 'error' in data) {
      entry.reject(new Error((data as any).error));
    } else {
      entry.resolve(data);
    }
  }

  /**
   * Sends a request and waits for the matching response.
   * @param {StorageRequest} msg - The request to send
   * @return {Promise<StorageResponse>} The matched response
   */
  private send<T extends StorageResponse>(msg: StorageRequest): Promise<T> {
    const _id = String(++this.idCounter);
    return new Promise((resolve, reject) => {
      this.pending.set(_id, { resolve, reject });
      this.port.postMessage({ ...msg, _id });
    });
  }

  /**
   * Initializes the backend adapter in the SharedWorker.
   * @param {StorageRequest & { type: 'init' }} config - The init config
   * @return {Promise<void>}
   */
  async init(config: StorageRequest & { type: 'init' }): Promise<void> {
    await this.send(config);
  }

  /**
   * Lists all files in a collection.
   * @param {string} collection - The collection name
   * @return {Promise<FileEntry[]>} Array of file entries
   */
  async listFiles(collection: string): Promise<FileEntry[]> {
    const res = await this.send<
      Extract<StorageResponse, { type: 'listFiles'; ok: true }>
    >({
      type: 'listFiles',
      collection,
    });
    return res.files;
  }

  /**
   * Reads a single file's content.
   * @param {string} collection - The collection name
   * @param {string} filename - The filename
   * @return {Promise<string>} The file content
   */
  async readFile(collection: string, filename: string): Promise<string> {
    const res = await this.send<
      Extract<StorageResponse, { type: 'readFile'; ok: true }>
    >({
      type: 'readFile',
      collection,
      filename,
    });
    return res.content;
  }

  /**
   * Writes a single file.
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
    await this.send({ type: 'writeFile', collection, filename, content });
  }

  /**
   * Writes multiple files atomically.
   * @param {FileWrite[]} files - Array of files to write
   * @return {Promise<void>}
   */
  async writeFiles(files: FileWrite[]): Promise<void> {
    await this.send({ type: 'writeFiles', files });
  }

  /**
   * Tears down the active backend adapter.
   * @return {Promise<void>}
   */
  async teardown(): Promise<void> {
    await this.send({ type: 'teardown' });
  }
}

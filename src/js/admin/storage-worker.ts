// src/js/admin/storage-worker.ts
import type {
  StorageAdapter,
  StorageRequest,
  StorageResponse,
} from './storage-adapter';

// The single active adapter instance shared across all connected ports
let adapter: StorageAdapter | null = null;

/**
 * Handles a request message and returns the appropriate response.
 * @param {StorageRequest} msg - The incoming request message
 * @return {Promise<StorageResponse>} The response to send back
 */
async function handleMessage(msg: StorageRequest): Promise<StorageResponse> {
  switch (msg.type) {
    case 'init': {
      try {
        if (msg.backend.type === 'fsa') {
          const { FsaAdapter } = await import('./fsa-adapter');
          adapter = new FsaAdapter(msg.backend.handle);
        } else {
          const { GitHubAdapter } = await import('./github-adapter');
          const gh = new GitHubAdapter(msg.backend.token, msg.backend.repo);
          await gh.validate();
          adapter = gh;
        }
        return { type: 'init', ok: true };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return { type: 'init', ok: false, error };
      }
    }

    case 'listFiles': {
      if (!adapter)
        return {
          type: 'listFiles',
          ok: false,
          error: 'No backend initialized',
        };
      try {
        const files = await adapter.listFiles(msg.collection);
        return { type: 'listFiles', ok: true, files };
      } catch (err) {
        return {
          type: 'listFiles',
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    case 'readFile': {
      if (!adapter)
        return { type: 'readFile', ok: false, error: 'No backend initialized' };
      try {
        const content = await adapter.readFile(msg.collection, msg.filename);
        return { type: 'readFile', ok: true, content };
      } catch (err) {
        return {
          type: 'readFile',
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    case 'writeFile': {
      if (!adapter)
        return {
          type: 'writeFile',
          ok: false,
          error: 'No backend initialized',
        };
      try {
        await adapter.writeFile(msg.collection, msg.filename, msg.content);
        return { type: 'writeFile', ok: true };
      } catch (err) {
        return {
          type: 'writeFile',
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    case 'writeFiles': {
      if (!adapter)
        return {
          type: 'writeFiles',
          ok: false,
          error: 'No backend initialized',
        };
      try {
        await adapter.writeFiles(msg.files);
        return { type: 'writeFiles', ok: true };
      } catch (err) {
        return {
          type: 'writeFiles',
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    case 'teardown': {
      adapter = null;
      return { type: 'teardown', ok: true };
    }

    default: {
      // Prevents silent hangs if an unrecognized message type arrives
      const exhaustive: never = msg;
      return {
        type: (exhaustive as any).type,
        ok: false,
        error: 'Unknown message type',
      } as StorageResponse;
    }
  }
}

/**
 * Wires up message handling for a connected port. Passes through `_id` from requests so the StorageClient can correlate responses.
 * @param {MessagePort} port - The port to listen on
 * @return {void}
 */
function setupPort(port: MessagePort): void {
  port.addEventListener('message', async (event) => {
    const { _id, ...msg } = event.data;

    // Handle port bridging — main thread transfers ports for dedicated workers
    if (msg.type === 'connect-port') {
      const transferredPort = event.ports[0];
      if (transferredPort) setupPort(transferredPort);
      return;
    }

    const response = await handleMessage(msg as StorageRequest);
    port.postMessage({ ...response, _id });
  });
  port.start();
  // Acknowledge the connection so the caller knows the port is ready
  port.postMessage({ type: 'port-connected' });
}

// SharedWorker entry — handle direct connections from Window contexts
self.addEventListener('connect', (event: MessageEvent) => {
  const port = (event as any).ports[0] as MessagePort;
  setupPort(port);
});

import BulkExportWorker from './bulk-export-worker?worker';
import type { LabelEntry } from '$lib/input/package/package.svelte';

const worker = new BulkExportWorker();

let pendingResolve: ((files: Record<string, Uint8Array>) => void) | null = null;
let pendingReject: ((err: Error) => void) | null = null;

worker.onmessage = (e: MessageEvent<{ files: Record<string, Uint8Array> } | { error: string }>) => {
    if ('error' in e.data) {
        pendingReject?.(new Error(e.data.error));
    } else {
        pendingResolve?.(e.data.files);
    }

    pendingResolve = null;
    pendingReject = null;
};

worker.onerror = (err) => {
    pendingReject?.(new Error(err.message));

    pendingResolve = null;
    pendingReject = null;
};

export const runBulkExport = (entries: LabelEntry[]): Promise<Record<string, Uint8Array>> => {
    return new Promise((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;
        worker.postMessage($state.snapshot(entries));
    });
};
import { generateStlEntries } from '$lib/generation/util/bulk-generation-util';
import { serializeAllToStlBinaries } from '$lib/exporter/util/stl-export-util';
import type { LabelEntry } from '$lib/input/package/package.svelte';
import { type Fonts, loadOverpassRegularFont, loadOverpassBoldFont, loadOverpassExtraBoldFont } from '$lib/generation/general/font-utils';

self.onmessage = async (e: MessageEvent<LabelEntry[]>) => {
    try {
        const fonts = await loadFontsOnce();
        const stlEntries = generateStlEntries(e.data, fonts);
        const files = serializeAllToStlBinaries(stlEntries);

        const buffers = Object.values(files).map(u8 => u8.buffer);
        self.postMessage({ files }, { transfer: buffers as ArrayBuffer[] });
    } catch (err) {
        self.postMessage({ error: String(err) });
    }
};

let fonts: Fonts | null = null;

export const loadFontsOnce = async (): Promise<Fonts> => {
    if (fonts) {
        return fonts;
    }
    const [regular, bold, extraBold] = await Promise.all([
        loadOverpassRegularFont(),
        loadOverpassBoldFont(),
        loadOverpassExtraBoldFont()
    ]);
    fonts = { regular, bold, extraBold };
    return fonts;
};
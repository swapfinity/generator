// @ts-ignore
import * as stlSerializer from '@jscad/stl-serializer';
const { serialize, mimeType: STL_MIME_TYPE } = stlSerializer

import type { Geom3 } from '@jscad/modeling/src/geometries/geom3';
import type { LabelEntry } from '$lib/input/package/package.svelte';
import { globalGenerator } from '$lib/generation/util/global-generator-util';
import type { Fonts } from '$lib/generation/general/font-utils';
import type { StlEntry } from '$lib/generation/util/bulk-generation-util';


export { STL_MIME_TYPE };

/**
 * Generates a binary stl from the given geometries.
 * jscad returns an array of array buffers with the following structure:
 * [header (80 bytes), triangle count (4 bytes), triangle data (n * 50 bytes)]
 * 
 * These are merge into a single array
 * @param geometries 
 * @returns 
 */
export const serializeToStlBinary = (geometries: Geom3[]): Uint8Array => {
    const buffers: ArrayBuffer[] = serialize({ binary: true }, geometries);
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const result = new Uint8Array(totalLength);

    let offset = 0;
    for (const buf of buffers) {
        result.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
    }
    return result;
};

export const serializeAllToStlBinaries = (entries: StlEntry[]): Record<string, Uint8Array> =>
    Object.fromEntries(
        entries.map(({ filename, geometry }) => [`${filename}.stl`, serializeToStlBinary(geometry)])
    );

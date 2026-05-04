import type { Fonts } from '$lib/generation/general/font-utils';
import type { LabelEntry } from '$lib/input/package/package.svelte';
import { globalGenerator } from '$lib/generation/util/global-generator-util';
import type { Geom3 } from '@jscad/modeling/src/geometries/types';

export const generateStlEntries = (entries: LabelEntry[], fonts: Fonts): StlEntry[] =>
    entries.flatMap(({ label, filename }) => {
        const result = globalGenerator.generate(label, fonts);
        return result?.geometry ? [{ filename, geometry: result.geometry }] : [];
    });

export type StlEntry = {
    filename: string;
    geometry: Geom3[];
};
// label-gen.bench.ts
import { describe, bench, beforeAll } from 'vitest';
import { resolve } from 'path';
import opentype from 'opentype.js';
import { LabelGenerator } from './label-gen';
import type { Fonts } from './font-utils';
import type { LabelDefinition } from '$lib/input/schemas/general-schemas';

let fonts: Fonts;

// test data & config
const SCREW_ITERATIONS = 100;
const SCREW_LABELS: LabelDefinition[] = [
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x10', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'TORX', screwType: 'ROUND_HEAD', screwMainText: 'M5x20', screwDriveText: 'T25' },
    { type: 'SCREW', screwDrive: 'SLOT', screwType: 'FLAT_HEAD', screwMainText: 'M4x16', screwDriveText: '' },
    { type: 'SCREW', screwDrive: 'HEX_SOCKET', screwType: 'PAN_HEAD', screwMainText: 'M6x30', screwDriveText: 'H4' },
    { type: 'SCREW', screwDrive: 'PZ', screwType: 'ROUND_HEAD', screwMainText: 'M2x8', screwDriveText: 'PH1' },
    { type: 'SCREW', screwDrive: 'SQUARE', screwType: 'PAN_HEAD', screwMainText: 'M5x25', screwDriveText: '#2' },
];
const SIMILAR_SCREW_LABELS: LabelDefinition[] = [
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x10', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x16', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x20', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x25', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x30', screwDriveText: 'PH2' },
    { type: 'SCREW', screwDrive: 'PH', screwType: 'FLAT_HEAD', screwMainText: 'M3x45', screwDriveText: 'PH2' },
];

const CUSTOMIZABLE_TEXT_ITERATIONS = 100;
const CUSTOMIZABLE_TEXT_LABELS: LabelDefinition[] = [
    { type: 'CUSTOMIZABLE_TEXT', firstLine: 'Hello', firstLineFontWeight: 'bold', firstLineAutoSize: true, firstLineFontSize: 6, firstLineXOffset: 0, firstLineYOffset: 0, secondLine: 'World', secondLineFontWeight: 'bold', secondLineAutoSize: true, secondLineFontSize: 6, secondLineXOffset: 0, secondLineYOffset: 0 },
    { type: 'CUSTOMIZABLE_TEXT', firstLine: 'Screws', firstLineFontWeight: 'extraBold', firstLineAutoSize: true, firstLineFontSize: 6, firstLineXOffset: 0, firstLineYOffset: 0, secondLine: '', secondLineFontWeight: 'bold', secondLineAutoSize: true, secondLineFontSize: 6, secondLineXOffset: 0, secondLineYOffset: 0 },
    { type: 'CUSTOMIZABLE_TEXT', firstLine: 'M3x10', firstLineFontWeight: 'regular', firstLineAutoSize: false, firstLineFontSize: 7, firstLineXOffset: 0, firstLineYOffset: 0, secondLine: 'Phillips', secondLineFontWeight: 'bold', secondLineAutoSize: true, secondLineFontSize: 6, secondLineXOffset: 0, secondLineYOffset: 0 },
    { type: 'CUSTOMIZABLE_TEXT', firstLine: 'Storage', firstLineFontWeight: 'bold', firstLineAutoSize: true, firstLineFontSize: 6, firstLineXOffset: 0, firstLineYOffset: 0, secondLine: 'Box A', secondLineFontWeight: 'regular', secondLineAutoSize: true, secondLineFontSize: 6, secondLineXOffset: 0, secondLineYOffset: 0 },
    { type: 'CUSTOMIZABLE_TEXT', firstLine: 'FRAGILE', firstLineFontWeight: 'extraBold', firstLineAutoSize: false, firstLineFontSize: 8, firstLineXOffset: 0, firstLineYOffset: 0, secondLine: '', secondLineFontWeight: 'bold', secondLineAutoSize: true, secondLineFontSize: 6, secondLineXOffset: 0, secondLineYOffset: 0 },
];

// benchmarks
beforeAll(async () => {
    const load = (name: string) => opentype.load(resolve('src/lib/assets', name));
    const [regular, bold, extraBold] = await Promise.all([
        load('Overpass-Regular.ttf'),
        load('Overpass-Bold.ttf'),
        load('Overpass-ExtraBold.ttf'),
    ]);
    fonts = { regular, bold, extraBold };
});

describe('SCREW label generation', () => {
    const genNoOpts = new LabelGenerator({ enable3DPartsCache: false, enableLazyLabelBase3D: false });
    const genPartsCache = new LabelGenerator({ enable3DPartsCache: true, enableLazyLabelBase3D: false });
    const genLazyBaseOnly = new LabelGenerator({ enable3DPartsCache: false, enableLazyLabelBase3D: true });
    const genAllOpts = new LabelGenerator();

    bench('no optimizations', () => { genNoOpts.generate(randomScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
    bench('parts cache only', () => { genPartsCache.generate(randomScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
    bench('cached base only', () => { genLazyBaseOnly.generate(randomScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
    bench('all optimizations', () => { genAllOpts.generate(randomScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
});

describe('SCREW similar labels (cache stress)', () => {
    const genNoCache = new LabelGenerator({ enable3DPartsCache: false, enableLazyLabelBase3D: false });
    const genPartsCache = new LabelGenerator({ enable3DPartsCache: true, enableLazyLabelBase3D: false });

    bench('no cache', () => { genNoCache.generate(randomSimilarScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
    bench('parts cache', () => { genPartsCache.generate(randomSimilarScrewLabel(), fonts) }, { iterations: SCREW_ITERATIONS });
});

describe('CUSTOMIZABLE_TEXT label generation', () => {
    const genNoOpts = new LabelGenerator({ enable3DPartsCache: false, enableLazyLabelBase3D: false });
    const genPartsCacheOnly = new LabelGenerator({ enable3DPartsCache: true, enableLazyLabelBase3D: false });
    const genLazyBaseOnly = new LabelGenerator({ enable3DPartsCache: false, enableLazyLabelBase3D: true });
    const genAllOpts = new LabelGenerator();

    bench('no optimizations', () => { genNoOpts.generate(randomTextLabel(), fonts) }, { iterations: CUSTOMIZABLE_TEXT_ITERATIONS });
    bench('parts cache only', () => { genPartsCacheOnly.generate(randomTextLabel(), fonts) }, { iterations: CUSTOMIZABLE_TEXT_ITERATIONS });
    bench('cached base only', () => { genLazyBaseOnly.generate(randomTextLabel(), fonts) }, { iterations: CUSTOMIZABLE_TEXT_ITERATIONS });
    bench('all optimizations', () => { genAllOpts.generate(randomTextLabel(), fonts) }, { iterations: CUSTOMIZABLE_TEXT_ITERATIONS });
});

// helpers
const randomScrewLabel = () => SCREW_LABELS[Math.floor(Math.random() * SCREW_LABELS.length)];

const randomTextLabel = () => CUSTOMIZABLE_TEXT_LABELS[Math.floor(Math.random() * CUSTOMIZABLE_TEXT_LABELS.length)];

const randomSimilarScrewLabel = () => SIMILAR_SCREW_LABELS[Math.floor(Math.random() * SIMILAR_SCREW_LABELS.length)];


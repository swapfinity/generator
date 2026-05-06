import opentype from 'opentype.js';
// @ts-ignore
import type { Geom2 } from '@jscad/modeling/src/geometries/geom2';

import overpassRegularFontUrl from '$lib/assets/Overpass-Regular.ttf?url'
import overpassBoldFontUrl from '$lib/assets/Overpass-Bold.ttf?url'
import overpassExtraBoldFontUrl from '$lib/assets/Overpass-ExtraBold.ttf?url'

import * as jscad from '@jscad/modeling';
const { transforms, geometries } = jscad;

const CURVE_STEPS = 32

export function createText(text: string, font: opentype.Font, size = 10) {

    const path = createPath(text, font, size)

    const contours = flattenPath(path)
    const text2D: Geom2 = polygonFromPoints(contours)
    // convert the coordinates from ttf y to openjscad y
    const text2DYMirrored = transforms.mirrorY(text2D)

    const text2DCentered = transforms.center({ axes: [true, true, true] }, (text2DYMirrored))

    return text2DCentered
}

export const createPath = (text: string, font: opentype.Font, size = 10) => {
    return font.getPath(text, 0, 0, size, { kerning: true });
};

function flattenPath(path: opentype.Path, steps = CURVE_STEPS): [number, number][][] {
    const polygons: [number, number][][] = []

    let contourPoints: [number, number][] = []
    let cursor: [number, number] | undefined

    for (const cmd of path.commands) {
        switch (cmd.type) {
            case 'M':
                // start new contour
                if (contourPoints.length) polygons.push(contourPoints)
                contourPoints = []
                cursor = [cmd.x, cmd.y]
                break

            case 'L':
                cursor = [cmd.x, cmd.y]
                contourPoints.push(cursor)
                break

            case 'Q':
                if (!cursor) break
                const q0 = cursor
                for (let t = 0; t <= 1; t += 1 / steps) {
                    const x = (1 - t) * (1 - t) * q0[0] + 2 * (1 - t) * t * cmd.x1 + t * t * cmd.x
                    const y = (1 - t) * (1 - t) * q0[1] + 2 * (1 - t) * t * cmd.y1 + t * t * cmd.y
                    cursor = [x, y]
                    contourPoints.push([x, y])
                }
                break

            case 'C':
                if (!cursor) break
                const c0 = cursor
                for (let t = 0; t <= 1; t += 1 / steps) {
                    const x = (1 - t) ** 3 * c0[0] + 3 * (1 - t) ** 2 * t * cmd.x1 + 3 * (1 - t) * t ** 2 * cmd.x2 + t ** 3 * cmd.x
                    const y = (1 - t) ** 3 * c0[1] + 3 * (1 - t) ** 2 * t * cmd.y1 + 3 * (1 - t) * t ** 2 * cmd.y2 + t ** 3 * cmd.y
                    cursor = [x, y]
                    contourPoints.push([x, y])
                }
                break

            // finish path
            case 'Z':
                break
        }
    }

    if (contourPoints.length) polygons.push(contourPoints)

    return polygons
}


function polygonFromPoints(paths: [number, number][][]): Geom2 {
    const allSides: [[number, number], [number, number]][] = [];

    paths.forEach((points) => {
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            allSides.push([p1, p2]);
        }
    });

    return geometries.geom2.create(allSides);
}

export const loadFont = async (fontUrl: string): Promise<opentype.Font> => {
    const response = await fetch(fontUrl);
    const buffer = await response.arrayBuffer();
    return opentype.parse(buffer);
}

export const loadOverpassRegularFont = async (): Promise<opentype.Font> => {
    return loadFont(overpassRegularFontUrl)
}

export const loadOverpassBoldFont = async (): Promise<opentype.Font> => {
    return loadFont(overpassBoldFontUrl)
}

export const loadOverpassExtraBoldFont = async (): Promise<opentype.Font> => {
    return loadFont(overpassExtraBoldFontUrl)
}

export interface Fonts {
    regular: opentype.Font
    bold: opentype.Font
    extraBold: opentype.Font
}

const getFontId = (font: opentype.Font): string | null =>
    font.names?.postScriptName?.en ??
    font.names?.fullName?.en ??
    Object.values(font.names?.postScriptName ?? {})[0] ??
    Object.values(font.names?.fullName ?? {})[0] ??
    null;

export const createTextCacheKey = (text: string, font: opentype.Font, size: number): string => {
    const fontId = getFontId(font);

    if (!fontId) {
        throw new Error("Font has no usable identifier (postScriptName/fullName missing)");
    }

    return `${fontId}|${size}|${text.normalize("NFC")}`;
}

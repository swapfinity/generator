import opentype from 'opentype.js';
// @ts-ignore
import type { Geom2 } from '@jscad/modeling/src/geometries/geom2';

import overpassRegularFontUrl from '$lib/assets/Overpass-Regular.ttf?url'
import overpassBoldFontUrl from '$lib/assets/Overpass-Bold.ttf?url'

import * as jscad from '@jscad/modeling';
import { center } from './geom2-utils';
const { transforms, geometries } = jscad;


export function createText(text: string, font: any, size = 10, steps = 1) {
    const path = font.getPath(text, 0, 0, size, { kerning: true })

    const contours = flattenPath(path)
    console.log("path: ", path)
    console.log("contours: ", contours)
    const text2D: Geom2 = polygonFromPoints(contours)
    // convert the coordinates from ttf y to openjscad y
    const text2DYMirrored = transforms.mirrorY(text2D)

    const text2DCentered = center(text2DYMirrored)

    console.log("geoms: ", text2D)

    return text2DCentered
}

function flattenPath(path: opentype.Path, steps = 10): [number, number][][] {
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
        const processedPoints = points;

        // 3. Create segments (sides) for this path and add to the master list
        for (let i = 0; i < processedPoints.length; i++) {
            const p1 = processedPoints[i];
            const p2 = processedPoints[(i + 1) % processedPoints.length];
            allSides.push([p1, p2]);
        }
    });

    return geometries.geom2.create(allSides);
}

export const loadFont = async (fontUrl: string): Promise<opentype.Font> => {
    return opentype.load(fontUrl);
}

export const loadOverpassRegularFont = async (): Promise<opentype.Font> => {
    return loadFont(overpassRegularFontUrl)
}

export const loadOverpassBoldFont = async (): Promise<opentype.Font> => {
    return loadFont(overpassBoldFontUrl)
}

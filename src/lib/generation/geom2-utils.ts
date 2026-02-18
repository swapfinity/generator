import * as jscad from '@jscad/modeling';
import type { Geom2 } from '@jscad/modeling/src/geometries/types';
const { transforms, measurements } = jscad;

export const center = (geomToCenter: Geom2): Geom2 => {
    const [[minX, minY], [maxX, maxY]] = measurements.measureBoundingBox(geomToCenter);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return transforms.translate([-centerX, -centerY], geomToCenter)
}
import geom2 from "@jscad/modeling/src/geometries/geom2";
import type { Geom2 } from "@jscad/modeling/src/geometries/types";
import type { Vec2 } from "@jscad/modeling/src/maths/vec2";

/**
 * Creates an arc with the given width & height, centered to the origin.
 * @param width 
 * @param height 
 * @param segments 
 * @returns 
 */
export const flatArc = (width = 60, height = 12, segments = 40): Geom2 => {
    const pts: Vec2[] = []

    for (let i = segments; i >= 0; i--) {
        const x = (i / segments) * width - width / 2
        const y = height * (1 - Math.pow(2 * x / width, 2)) - height / 2
        pts.push([x, y])
    }

    return geom2.fromPoints(pts)
} 
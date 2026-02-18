import crossIcon from '$lib/assets/icons/cross_icon.svg'
import type { Geom2 } from '@jscad/modeling/src/geometries/types'

// @ts-ignore
import { svgDeserializer } from '@jscad/svg-deserializer';

export const generateIconGeometry = (): Geom2 => {
    const options = {
        output: 'geometry',
        target: 'geom2',
        segments: 32 // You can adjust this for smoothness of curves
    };
    const rawGeoms = svgDeserializer.deserialize(options, crossIcon);
    console.log("GEOMS2: ", rawGeoms)

    return rawGeoms
}
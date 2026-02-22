import type { Geom2 } from "@jscad/modeling/src/geometries/types"
import * as jscad from '@jscad/modeling';
import type { ScrewType } from "./screw-schema";
const { booleans, transforms, primitives, utils, expansions, hulls } = jscad;


export const getScrewTypeIcon = (screwType: ScrewType): Geom2 => {
    return getIconForScrewType(screwType)
}

const getIconForScrewType = (screwType: ScrewType): Geom2 => {
    switch (screwType) {
        case "FLAT_HEAD":
            return generateFlatHeadIcon()
        case "ROUND_HEAD":
        case "PAN_HEAD":
        default:
            throw new Error("Invalid screw type")
    }
}

// helpers - consts
export const SCREW_LENGTH = 20
export const SCREW_WIDTH = 2.7

const FLAT_HEAD_HEAD_WIDTH = 6.5

const segments = 64

const SCREW_ROUNDING = 0.3

// helpers - functions
const generateFlatHeadIcon = (): Geom2 => { //TODO triangle from polygon for head, coordinates calculation
    const screwShank = primitives.roundedRectangle({ size: [SCREW_LENGTH, SCREW_WIDTH], roundRadius: SCREW_ROUNDING })
    const screwHead = expansions.offset(
        { delta: SCREW_ROUNDING, corners: "round", segments: segments },
        expansions.offset(
            { delta: -SCREW_ROUNDING, corners: "round", segments: segments },
            primitives.triangle({
                type: 'ASA',
                values: [utils.degToRad(55), FLAT_HEAD_HEAD_WIDTH, utils.degToRad(55)]
            }
            )
        )
    )
    const rotatedScrewHead = transforms.rotateZ(utils.degToRad(-90), screwHead)
    const repositionedScrewHead = transforms.translate([-SCREW_LENGTH / 2, FLAT_HEAD_HEAD_WIDTH / 2], rotatedScrewHead)
    return booleans.union(screwShank, repositionedScrewHead)
}



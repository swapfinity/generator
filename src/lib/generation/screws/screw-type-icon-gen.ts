import type { Geom2 } from "@jscad/modeling/src/geometries/types"
import * as jscad from '@jscad/modeling';
import type { ScrewType } from "./screw-schema";
import { flatArc } from "../geom-utils";
const { booleans, transforms, primitives, utils, expansions, hulls } = jscad;


export const getScrewTypeIcon = (screwType: ScrewType): Geom2 => {
    return getIconForScrewType(screwType)
}

const getIconForScrewType = (screwType: ScrewType): Geom2 => {
    switch (screwType) {
        case "FLAT_HEAD":
            return generateFlatHeadIcon()
        case "ROUND_HEAD":
            return generateRoundHeadIcon()
        case "PAN_HEAD":
            return generatePanHeadIcon()
        default:
            throw new Error("Invalid screw type")
    }
}

// helpers - consts
export const SCREW_SHANK_LENGTH = 20
export const SCREW_SHANK_WIDTH = 2.7

const FLAT_HEAD_HEAD_WIDTH = 6.5
const ROUND_HEAD_HEAD_RADIUS = 3

const PAN_HEAD_HEAD_WIDTH = 5.4
const PAN_HEAD_HEAD_HEIGHT = 1
const PAN_HEAD_HEAD_ROUNDING = 0.2
const PAN_HEAD_HEAD_ARC_HEIGHT = 1


const segments = 64

const SCREW_ROUNDING = 0.3

// helpers - functions
const generateDefaultScrewShank = (): Geom2 => {
    return primitives.roundedRectangle({ size: [SCREW_SHANK_LENGTH, SCREW_SHANK_WIDTH], roundRadius: SCREW_ROUNDING })
}

const generateFlatHeadIcon = (): Geom2 => {
    const screwShank = generateDefaultScrewShank()
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
    const repositionedScrewHead = transforms.translate([-SCREW_SHANK_LENGTH / 2, FLAT_HEAD_HEAD_WIDTH / 2], rotatedScrewHead)
    return booleans.union(screwShank, repositionedScrewHead)
}

const generateRoundHeadIcon = (): Geom2 => {
    const screwShank = generateDefaultScrewShank()
    const screwHead = expansions.offset(
        { delta: SCREW_ROUNDING, corners: "round", segments: segments },
        expansions.offset(
            { delta: -SCREW_ROUNDING, corners: "round", segments: segments },
            booleans.intersect(
                primitives.circle({ radius: ROUND_HEAD_HEAD_RADIUS }),
                primitives.square({ size: 2 * ROUND_HEAD_HEAD_RADIUS, center: [-ROUND_HEAD_HEAD_RADIUS, 0] })
            )
        )
    )
    const repositionedScrewHead = transforms.translateX(-(SCREW_SHANK_LENGTH / 2 - ROUND_HEAD_HEAD_RADIUS + 0.3), screwHead)


    return booleans.union(repositionedScrewHead, screwShank)
}

const generatePanHeadIcon = (): Geom2 => {
    const screwShank = generateDefaultScrewShank()

    const fullHeadHeightOffset = PAN_HEAD_HEAD_HEIGHT / 2 + PAN_HEAD_HEAD_ARC_HEIGHT / 2
    const screwHeadTop = flatArc(PAN_HEAD_HEAD_WIDTH, PAN_HEAD_HEAD_ARC_HEIGHT, segments)
    const rotatedScrewAndRepositionedHeadTop = transforms.translateX(
        -(SCREW_SHANK_LENGTH / 2), transforms.rotateZ(utils.degToRad(90), screwHeadTop)
    )
    const screwHeadMain = primitives.rectangle({ size: [PAN_HEAD_HEAD_HEIGHT, PAN_HEAD_HEAD_WIDTH] })
    const repositionedScrewHeadMain = transforms.translateX(-(SCREW_SHANK_LENGTH / 2 - fullHeadHeightOffset), screwHeadMain)

    const fullHead = expansions.offset(
        { delta: PAN_HEAD_HEAD_ROUNDING, corners: "round", segments: segments },
        expansions.offset(
            { delta: PAN_HEAD_HEAD_ROUNDING, corners: "round", segments: segments },
            booleans.union(
                rotatedScrewAndRepositionedHeadTop,
                repositionedScrewHeadMain
            )
        )
    )

    return booleans.union(fullHead, screwShank)
}

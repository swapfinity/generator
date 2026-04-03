import type { Geom2 } from '@jscad/modeling/src/geometries/types'
import * as jscad from '@jscad/modeling';
import type { ScrewDrive } from '$lib/input/schemas/screw-schema';
const { booleans, transforms, primitives, utils } = jscad;


export const getScrewDriveIcon = (screwDrive: ScrewDrive): Geom2 => {
    return addCircle(getIconForScrewDrive(screwDrive))
}

const getIconForScrewDrive = (screwDrive: ScrewDrive) => {
    switch (screwDrive) {
        case "PH":
            return generatePhIcon()
        case "PZ":
            return generatePzIcon()
        case "SLOT":
            return generateSlotIcon()
        case "CROSS":
            return generateCrossIcon()
        case "SQUARE":
            return generateSquareIcon()
        case "HEX_SOCKET":
            return generateHexSocketIcon()
        case "TORX":
            return generateTorxIcon()
        default:
            throw new Error("Invalid screw drive type")
    }
}


// helpers - consts
const segments = 64

const crossBarLength = 6.5
const barWidth = 1.575

export const ICON_CIRCLE_RADIUS = 4.45
const iconCircleWallStrength = 0.45

const PZ_DIAGONAL_BAR_LENGTH = 5.5
const PZ_DIAGONAL_BAR_WIDTH = 0.9

const squareWidth = 3.6

const hexCircleRadius = 3.15

const torxLobes = 6
const innerLobeRadius = 0.8
const innerLobeCircleRadius = 3

const outerLobeRadius = 0.731
const outerLobeCircleRadius = 2.5

// helpers - generate icon functions
const generateSlotIcon = (): Geom2 => {
    const horizontalBar = primitives.rectangle({ size: [2 * ICON_CIRCLE_RADIUS, barWidth] })

    return removeOutOfCircle(horizontalBar)
}

const generateCrossIcon = (): Geom2 => {
    const horizontalBar = primitives.rectangle({ size: [2 * ICON_CIRCLE_RADIUS, barWidth] })
    const verticalBar = primitives.rectangle({ size: [barWidth, 2 * ICON_CIRCLE_RADIUS] })


    return removeOutOfCircle(booleans.union(horizontalBar, verticalBar))
}

const generatePhIcon = (): Geom2 => {
    const horizontalBar = primitives.rectangle({ size: [crossBarLength, barWidth] })
    const verticalBar = primitives.rectangle({ size: [barWidth, crossBarLength] })
    const middleSquare = transforms.rotateZ(Math.PI / 4, primitives.square({ size: 2 * barWidth }))

    return booleans.union(horizontalBar, verticalBar, middleSquare)
}

const generatePzIcon = (): Geom2 => {
    const horizontalBar = primitives.rectangle({ size: [crossBarLength, barWidth] })
    const verticalBar = primitives.rectangle({ size: [barWidth, crossBarLength] })
    const middleSquare = transforms.rotateZ(Math.PI / 4, primitives.square({ size: 2 * barWidth }))

    const diagonalBar = primitives.rectangle({ size: [PZ_DIAGONAL_BAR_LENGTH, PZ_DIAGONAL_BAR_WIDTH] })
    const rotatedDiagonalBar = transforms.rotateZ(utils.degToRad(45), diagonalBar)
    const rotatedDiagonalBar2 = transforms.rotateZ(utils.degToRad(-45), diagonalBar)

    return booleans.union(horizontalBar, verticalBar, middleSquare, rotatedDiagonalBar, rotatedDiagonalBar2)
}

const generateSquareIcon = (): Geom2 => {
    const square = primitives.square({ size: squareWidth })

    return square
}

const generateHexSocketIcon = (): Geom2 => {
    const hexagon = primitives.circle({ radius: hexCircleRadius, segments: 6 })

    return hexagon
}

const generateTorxIcon = (): Geom2 => {
    const outerCircle = primitives.circle({ radius: outerLobeCircleRadius, segments: segments })

    const outerPoints = [];
    const innerPoints = [];

    for (let i = 0; i < torxLobes; i++) {
        const angle = (2 * Math.PI * i) / torxLobes;
        const midAngle = angle + Math.PI / torxLobes;

        outerPoints.push([outerLobeCircleRadius * Math.cos(angle), outerLobeCircleRadius * Math.sin(angle)]);
        innerPoints.push([innerLobeCircleRadius * Math.cos(midAngle), innerLobeCircleRadius * Math.sin(midAngle)]);
    }

    const circleWithLobes = booleans.union(
        outerCircle,
        ...outerPoints.map(point => primitives.circle({ radius: outerLobeRadius, center: [point[0], point[1]] }))
    )

    const circleWithLobesAndCutouts = booleans.subtract(
        circleWithLobes,
        ...innerPoints.map(point => primitives.circle({ radius: innerLobeRadius, center: [point[0], point[1]] }))
    )

    return transforms.rotateZ(Math.PI / 2, circleWithLobesAndCutouts)
}

// helper - functions
const addCircle = (icon: Geom2) => {
    const outerIconCircle = primitives.circle({ radius: ICON_CIRCLE_RADIUS, segments: segments })
    const innerIconCircle = primitives.circle({ radius: ICON_CIRCLE_RADIUS - iconCircleWallStrength, segments: segments })

    const iconCircle = booleans.subtract(outerIconCircle, innerIconCircle)

    return booleans.union(icon, iconCircle)
}

const removeOutOfCircle = (geometry: Geom2) => {
    const innerIconCircle = primitives.circle({ radius: ICON_CIRCLE_RADIUS - iconCircleWallStrength, segments: segments })

    return booleans.intersect(geometry, innerIconCircle)

}
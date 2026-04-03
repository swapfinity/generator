import opentype from 'opentype.js';
import * as jscad from '@jscad/modeling';
const { booleans, colors, extrusions, primitives, transforms, geometries } = jscad;
import { createText, type Fonts } from './font-utils';
import { getScrewDriveIcon, ICON_CIRCLE_RADIUS } from '../screws/screw-drive-icon-gen';
import type { Geom2, Geom3 } from '@jscad/modeling/src/geometries/types';
import { getScrewTypeIcon } from '../screws/screw-type-icon-gen';
import type { LabelDefinition } from '../../input/schemas/general-schemas';
import type { ScrewLabelDefinition } from '$lib/input/schemas/screw-schema';


const x_length = 33.50
const y_length = 13.40
const rounding = 1;
const tab_rounding_offset = 0.192;
const tab_diameter = 5.40;
const tab_radius = tab_diameter / 2;
const segments = 32;
const label_thickness = 0.6;

const main_text_thickness = 0.4;

const screwTypeIconAndMainTextXOffset = -0.5

export const generateLabelGeometry = (
    labelDefinition: LabelDefinition,
    fonts: Fonts
) => {
    const labelBase3D = createLabelBase3D();

    switch (labelDefinition.type) {
        case "SCREW": {
            const iconAndText2D = booleans.union(
                createScrewDriveTextAndIcon(labelDefinition, fonts.extraBold),
                createScrewTypeIconAndMainText(labelDefinition, fonts.extraBold)
            )
            const iconandText3D = transforms.translateZ(label_thickness, colors.colorize([0, 0, 0], extrusions.extrudeLinear({ height: main_text_thickness }, iconAndText2D)));
            return [labelBase3D, iconandText3D];
        }

        case "CUSTOMIZABLE_TEXT": {
            const firstLinePresent = Boolean(labelDefinition.firstLine)
            const secondLinePresent = Boolean(labelDefinition.secondLine)

            const result: Geom3[] = [labelBase3D]

            // first line
            if (firstLinePresent) {

                const firstLineY = (secondLinePresent ? y_length / 4 : 0) + labelDefinition.firstLineYOffset
                const firstLine2D = transforms.translate(
                    [labelDefinition.firstLineXOffset, firstLineY, 0],
                    createText(labelDefinition.firstLine, fonts[labelDefinition.firstLineFontWeight], labelDefinition.firstLineFontSize)
                )
                const firstLine3D = transforms.translateZ(label_thickness, colors.colorize([0, 0, 0], extrusions.extrudeLinear({ height: main_text_thickness }, firstLine2D)));

                result.push(firstLine3D)
            }

            // second line
            if (secondLinePresent) {
                const secondLineY = -(y_length / 4) + labelDefinition.secondLineYOffset
                const secondLine2D = transforms.translate(
                    [labelDefinition.secondLineXOffset, secondLineY, 0],
                    createText(labelDefinition.secondLine, fonts[labelDefinition.secondLineFontWeight], labelDefinition.secondLineFontSize)
                )
                const secondLine3D = transforms.translateZ(label_thickness, colors.colorize([0, 0, 0], extrusions.extrudeLinear({ height: main_text_thickness }, secondLine2D)));

                result.push(secondLine3D)
            }

            return result
        }
    }
}

// helpers
const screwDriveTextSize = 5
const screwTypeTextSize = 6.7

const createLabelBase3D = (): Geom3 => {
    const leftTab = primitives.circle({ radius: tab_radius, center: [-x_length / 2, 0], segments });
    const rightTab = primitives.circle({ radius: tab_radius, center: [x_length / 2, 0], segments });

    const labelBody = primitives.roundedRectangle({ size: [x_length, y_length], roundRadius: rounding, segments: segments });

    // create inner corner fillets
    const topRightFillet = booleans.subtract(
        primitives.square({ size: rounding, center: [x_length / 2 + rounding / 2 - 0.001, tab_radius + rounding / 2 - tab_rounding_offset] }),
        primitives.circle({ radius: rounding, center: [x_length / 2 + rounding - 0.001, tab_radius + rounding - tab_rounding_offset] })
    );
    const topLeftFillet = transforms.mirrorX(topRightFillet);
    const innerCornerFillets = [
        topRightFillet,
        topLeftFillet,
        transforms.mirrorY(topRightFillet),
        transforms.mirrorY(topLeftFillet)
    ];

    const labelBase2D = booleans.union(leftTab, rightTab, labelBody, ...innerCornerFillets);
    const labelBase3D = colors.colorize([1, 1, 1], extrusions.extrudeLinear({ height: label_thickness }, labelBase2D));

    return labelBase3D;
}

const createScrewDriveTextAndIcon = (labelDefinition: ScrewLabelDefinition, boldFont: opentype.Font): Geom2 => {
    const withScrewDriveText = Boolean(labelDefinition.screwDriveText)
    const centerForIcon = getCenterForScrewDriveIcon(withScrewDriveText)
    const icon = transforms.translate(centerForIcon, getScrewDriveIcon(labelDefinition.screwDrive))

    if (withScrewDriveText) {
        const screwDriveText2D = transforms.translate([-(x_length / 2 - x_length / 6), - y_length / 2 + screwDriveTextSize / 2.4, 0], createText(labelDefinition.screwDriveText!, boldFont, screwDriveTextSize))
        return booleans.union(icon, screwDriveText2D)

    }

    else {
        return icon
    }
}

const getCenterForScrewDriveIcon = (withText: boolean): [number, number, number] => {
    const x = -(x_length / 2 - x_length / 6)
    if (withText) {
        const y = y_length / 2 - (0.4 + ICON_CIRCLE_RADIUS)
        return [x, y, 0]
    }
    else {
        return [x, 0, 0]
    }
}

const createScrewTypeIconAndMainText = (labelDefinition: ScrewLabelDefinition, boldFont: opentype.Font): Geom2 => {
    const withScrewTypeText = Boolean(labelDefinition.screwMainText)
    const centerForIcon = getCenterForScrewTypeIcon(withScrewTypeText)
    const icon = transforms.translate(centerForIcon, getScrewTypeIcon(labelDefinition.screwType))

    if (withScrewTypeText) {
        const screwTypeText2D = transforms.translate(
            [x_length / 2 - x_length / 3 + screwTypeIconAndMainTextXOffset, -(y_length / 2 - y_length / 4), 0],
            createText(labelDefinition.screwMainText, boldFont, screwTypeTextSize)
        )
        return booleans.union(icon, screwTypeText2D)

    }
    else {
        return icon

    }
}

const getCenterForScrewTypeIcon = (withText: boolean): [number, number, number] => {
    const x = x_length / 2 - x_length / 3 + screwTypeIconAndMainTextXOffset
    if (withText) {
        const y = y_length / 2 - (y_length / 4 + 0.4)
        return [x, y, 0]
    }
    else {
        return [x, 0, 0]
    }
}

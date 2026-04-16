import opentype from 'opentype.js';
import * as jscad from '@jscad/modeling';
const { booleans, colors, extrusions, primitives, transforms, geometries } = jscad;
import { createText, type Fonts } from './font-utils';
import { getScrewDriveIcon, ICON_CIRCLE_RADIUS } from '../screws/screw-drive-icon-gen';
import type { Geom3 } from '@jscad/modeling/src/geometries/types';
import { getScrewTypeIcon } from '../screws/screw-type-icon-gen';
import type { LabelDefinition } from '../../input/schemas/general-schemas';
import type { ScrewLabelDefinition } from '$lib/input/schemas/screw-schema';
import { calculateFontSizeFor } from './font-size-utils';
import type { LabelPart2D } from '../types/label-part';
import { PART_STATE_COLORS } from './part-state-colors';
import type { GenerationResult } from '../types/generation-result';
import { GenerationNotifications } from './notifications';


const x_length = 33.50
const y_length = 13.40
const rounding = 1;
const tab_rounding_offset = 0.192;
const tab_diameter = 5.40;
const tab_radius = tab_diameter / 2;
const segments = 32;
const label_thickness = 0.6;

const LABEL_CONTENT_TICKNESS = 0.4;

const screwTypeIconAndMainTextXOffset = -0.5

const LABEL_PADDING = 1
const LABEL_LINE_GAP = LABEL_PADDING;

const MIN_CUSTOM_TEXT_TYPE_TEXT_SIZE = 5
const MAX_CUSTOM_TEXT_TYPE_TEXT_SIZE = 8

export const generateLabelGeometry = (
    labelDefinition: LabelDefinition,
    fonts: Fonts
): GenerationResult => {
    const startTime = performance.now()
    const labelBase3D = createLabelBase3D();

    switch (labelDefinition.type) {
        case "SCREW": {
            const notifications = new GenerationNotifications();

            const parts2D = [
                ...createScrewDriveTextAndIcon(labelDefinition, fonts.extraBold),
                ...createScrewTypeIconAndMainText(labelDefinition, fonts.extraBold),
            ];

            const parts3D = extrudeLabelContent(parts2D, notifications)

            const timeSpent = performance.now() - startTime;
            return { geometry: [labelBase3D, ...parts3D], notifications, timeSpent };
        }

        case "CUSTOMIZABLE_TEXT": {
            const firstLinePresent = Boolean(labelDefinition.firstLine)
            const secondLinePresent = Boolean(labelDefinition.secondLine)

            const usableWidth = x_length - LABEL_PADDING * 2;
            const usableHeight = y_length - LABEL_PADDING * 2;
            const lineHeight = secondLinePresent ? (usableHeight - LABEL_LINE_GAP) / 2 : usableHeight;

            const result: Geom3[] = [labelBase3D]
            const notifications = new GenerationNotifications();

            // first line
            if (firstLinePresent) {
                const firstLineY = secondLinePresent ? y_length / 4 : 0
                const firstLine2D = buildTextLine({
                    text: labelDefinition.firstLine,
                    font: fonts[labelDefinition.firstLineFontWeight],
                    autoSize: labelDefinition.firstLineAutoSize,
                    requestedFontSize: labelDefinition.firstLineFontSize,
                    availableWidth: usableWidth,
                    availableHeight: lineHeight,
                    baseY: firstLineY,
                    xOffset: labelDefinition.firstLineXOffset,
                    yOffset: labelDefinition.firstLineYOffset,
                    fieldName: 'firstLine',
                })

                result.push(...extrudeLabelContent([firstLine2D], notifications))
            }

            // second line
            if (secondLinePresent) {
                const secondLineY = -(y_length / 4);
                const secondLine2D = buildTextLine({
                    text: labelDefinition.secondLine,
                    font: fonts[labelDefinition.secondLineFontWeight],
                    autoSize: labelDefinition.secondLineAutoSize,
                    requestedFontSize: labelDefinition.secondLineFontSize,
                    availableWidth: usableWidth,
                    availableHeight: lineHeight,
                    baseY: secondLineY,
                    xOffset: labelDefinition.secondLineXOffset,
                    yOffset: labelDefinition.secondLineYOffset,
                    fieldName: 'secondLine',
                });

                result.push(...extrudeLabelContent([secondLine2D], notifications));
            }

            const timeSpent = performance.now() - startTime;
            return { geometry: result, notifications: notifications, timeSpent }
        }
    }
}

// general helpers

const TEXT_OVERSIZED_WARNING = 'Text too long, displaying at minimum font size'

const extrudeLabelContent = (parts: LabelPart2D[], notifications: GenerationNotifications): Geom3[] =>
    parts.map((part) => {
        notifications.addFromPart(part);

        return transforms.translateZ(label_thickness,
            colors.colorize(PART_STATE_COLORS[part.state] ?? [0, 0, 0],
                extrusions.extrudeLinear({ height: LABEL_CONTENT_TICKNESS + (part.state !== 'OK' ? 0.001 : 0) }, part.geom)));
    });

// custom text helpers
type LineConfig = {
    text: string;
    font: opentype.Font;
    autoSize: boolean;
    requestedFontSize: number;
    availableWidth: number;
    availableHeight: number;
    baseY: number;
    xOffset: number;
    yOffset: number;
    fieldName: string;
};

const buildTextLine = ({
    text,
    font,
    autoSize,
    requestedFontSize,
    availableWidth,
    availableHeight,
    baseY,
    xOffset,
    yOffset,
    fieldName,
}: LineConfig): LabelPart2D => {
    const autoCalculatedSize = autoSize
        ? calculateFontSizeFor(
            text,
            font,
            availableWidth,
            availableHeight,
            MIN_CUSTOM_TEXT_TYPE_TEXT_SIZE,
            MAX_CUSTOM_TEXT_TYPE_TEXT_SIZE
        )
        : null;

    const resolvedSize = autoSize ? autoCalculatedSize ?? MIN_CUSTOM_TEXT_TYPE_TEXT_SIZE : requestedFontSize;

    const x = autoSize ? 0 : xOffset;
    const y = baseY + (autoSize ? 0 : yOffset);
    const geom2D = transforms.translate([x, y, 0], createText(text, font, resolvedSize));

    if (autoSize && autoCalculatedSize === null) {
        return { geom: geom2D, state: 'WARN', fieldName, message: TEXT_OVERSIZED_WARNING };
    }

    return { geom: geom2D, state: 'OK' }
};

// screw type helpers
const screwDriveTextSize = 5

const MIN_SCREW_TYPE_TEXT_SIZE = 5
const MAX_SCREW_TYPE_TEXT_SIZE = 6.7


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

const createScrewDriveTextAndIcon = (labelDefinition: ScrewLabelDefinition, boldFont: opentype.Font): LabelPart2D[] => {
    const withScrewDriveText = Boolean(labelDefinition.screwDriveText)
    const centerForIcon = getCenterForScrewDriveIcon(withScrewDriveText)
    const icon = transforms.translate(centerForIcon, getScrewDriveIcon(labelDefinition.screwDrive))

    if (withScrewDriveText) {
        const screwDriveText2D = transforms.translate([-(x_length / 2 - x_length / 6), - y_length / 2 + screwDriveTextSize / 2.4, 0], createText(labelDefinition.screwDriveText, boldFont, screwDriveTextSize))
        return [{ geom: icon, state: 'OK', }, { geom: screwDriveText2D, state: 'OK' }]

    }

    else {
        return [{ geom: icon, state: 'OK' }]
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

const createScrewTypeIconAndMainText = (labelDefinition: ScrewLabelDefinition, boldFont: opentype.Font): LabelPart2D[] => {
    const withScrewTypeText = Boolean(labelDefinition.screwMainText)
    const centerForIcon = getCenterForScrewTypeIcon(withScrewTypeText)
    const icon = transforms.translate(centerForIcon, getScrewTypeIcon(labelDefinition.screwType))

    if (withScrewTypeText) {
        const calculatedFontSize = calculateFontSizeFor(
            labelDefinition.screwMainText,
            boldFont,
            x_length / 3 * 2 - 1.5,
            y_length / 2,
            MIN_SCREW_TYPE_TEXT_SIZE,
            MAX_SCREW_TYPE_TEXT_SIZE,
            MAX_SCREW_TYPE_TEXT_SIZE
        )

        const screwTypeText2D = transforms.translate(
            [x_length / 2 - x_length / 3 + screwTypeIconAndMainTextXOffset, -(y_length / 2 - y_length / 4), 0],
            createText(labelDefinition.screwMainText, boldFont, calculatedFontSize ?? MIN_SCREW_TYPE_TEXT_SIZE)
        )

        const textPart: LabelPart2D = calculatedFontSize
            ? { geom: screwTypeText2D, state: 'OK' }
            : { geom: screwTypeText2D, state: 'WARN', fieldName: 'screwMainText', message: TEXT_OVERSIZED_WARNING };

        return [{ geom: icon, state: 'OK' }, textPart];
    }
    else {
        return [{ geom: icon, state: 'OK' }]

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

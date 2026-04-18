import opentype from 'opentype.js';
import * as jscad from '@jscad/modeling';
const { booleans, colors, extrusions, primitives, transforms } = jscad;
import { createText, createTextCacheKey, type Fonts } from './font-utils';
import { getScrewDriveIcon, ICON_CIRCLE_RADIUS } from '../screws/screw-drive-icon-gen';
import type { Geom3 } from '@jscad/modeling/src/geometries/types';
import { getScrewTypeIcon } from '../screws/screw-type-icon-gen';
import type { LabelDefinition } from '../../input/schemas/general-schemas';
import type { ScrewLabelDefinition } from '$lib/input/schemas/screw-schema';
import { calculateFontSizeFor } from './font-size-utils';
import type { LabelPart2D, PartState } from '../types/label-part';
import { PART_STATE_COLORS } from './part-state-colors';
import type { GenerationResult } from '../types/generation-result';
import { GenerationNotifications } from './notifications';
import { Cached } from '$lib/shared/utils/cached';
import { LRUCache } from '$lib/shared/utils/lru-cache';


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


export type LabelGeneratorConfig = {
    enable3DPartsCache: boolean;
    enableLazyLabelBase3D: boolean;
}

const DEFAULT_LABEL_GEN_CONFIG: LabelGeneratorConfig = {
    enable3DPartsCache: true,
    enableLazyLabelBase3D: true,
}

export class LabelGenerator {
    private labelBase3D: Cached<Geom3>;
    private partsCache: LRUCache<string, Geom3>;


    constructor(private config: LabelGeneratorConfig = DEFAULT_LABEL_GEN_CONFIG) {
        this.labelBase3D = new Cached(() => createLabelBase3D(), config.enableLazyLabelBase3D);
        this.partsCache = new LRUCache<string, Geom3>(100);
    }

    generate(labelDefinition: LabelDefinition, fonts: Fonts): GenerationResult {
        const startTime = performance.now()

        switch (labelDefinition.type) {
            case "SCREW": {
                const notifications = new GenerationNotifications();

                const parts3D: Geom3[] = [
                    this.getLabelBase3D(),
                    ...this.createScrewDriveTextAndIcon(labelDefinition, fonts.extraBold),
                    ...this.createScrewTypeIconAndMainText(labelDefinition, fonts.extraBold, notifications),
                ];

                const timeSpent = performance.now() - startTime;
                return { geometry: parts3D, notifications, timeSpent };
            }

            case "CUSTOMIZABLE_TEXT": {
                const firstLinePresent = Boolean(labelDefinition.firstLine)
                const secondLinePresent = Boolean(labelDefinition.secondLine)

                const usableWidth = x_length - LABEL_PADDING * 2;
                const usableHeight = y_length - LABEL_PADDING * 2;
                const lineHeight = secondLinePresent ? (usableHeight - LABEL_LINE_GAP) / 2 : usableHeight;

                const result: Geom3[] = [this.getLabelBase3D()]
                const notifications = new GenerationNotifications();

                // first line
                if (firstLinePresent) {
                    const firstLineY = secondLinePresent ? y_length / 4 : 0
                    const firstLine2D = this.buildTextLine(
                        {
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
                        },
                        notifications
                    )

                    result.push(firstLine2D)
                }

                // second line
                if (secondLinePresent) {
                    const secondLineY = -(y_length / 4);
                    const secondLine2D = this.buildTextLine(
                        {
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
                        },
                        notifications
                    );

                    result.push(secondLine2D);
                }

                const timeSpent = performance.now() - startTime;
                return { geometry: result, notifications: notifications, timeSpent }
            }
        }

    }

    // helpers
    private getLabelBase3D(): Geom3 {
        return this.labelBase3D.get();
    }

    private buildTextLine(
        {
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
        }: LineConfig,
        notifications: GenerationNotifications
    ): Geom3 {
        const autoCalculatedSize = calculateFontSizeFor(
            text,
            font,
            availableWidth,
            availableHeight,
            MIN_CUSTOM_TEXT_TYPE_TEXT_SIZE,
            MAX_CUSTOM_TEXT_TYPE_TEXT_SIZE,
        );

        const resolvedSize = autoSize ? autoCalculatedSize ?? MIN_CUSTOM_TEXT_TYPE_TEXT_SIZE : requestedFontSize;
        const partState: PartState = autoCalculatedSize === null || (!autoSize && autoCalculatedSize < requestedFontSize)
            ? 'WARN'
            : 'OK';
        if (partState === 'WARN') {
            notifications.add(fieldName, { message: TEXT_OVERSIZED_WARNING, level: 'WARN' });
        }

        const x = autoSize ? 0 : xOffset;
        const y = baseY + (autoSize ? 0 : yOffset);

        const rawText3D = this.getCachedOrGeneratePart(
            this.createTextWithStateCacheKey(text, font, resolvedSize, partState),
            () => this.extrudeLabelContent({ geom: createText(text, font, resolvedSize), state: partState })
        );

        const position: [number, number, number] = [x, y, 0];
        return this.getCachedOrGeneratePart(
            this.createTextWithStateAndPositionCacheKey(
                text,
                font,
                resolvedSize,
                partState,
                position[0],
                position[1]
            ),
            () => transforms.translate(position, rawText3D)
        );
    };

    private createScrewTypeIconAndMainText(
        labelDefinition: ScrewLabelDefinition,
        boldFont: opentype.Font,
        notifications: GenerationNotifications
    ): Geom3[] {
        const withScrewTypeText = Boolean(labelDefinition.screwMainText)
        const centerForIcon = this.getCenterForScrewTypeIcon(withScrewTypeText)
        const icon3D =
            this.getCachedOrGeneratePart(
                labelDefinition.screwType,
                () => this.extrudeLabelContent({ geom: getScrewTypeIcon(labelDefinition.screwType), state: 'OK' })
            )

        const positionedIcon3D =
            this.getCachedOrGeneratePart(
                this.createIconWithPositionCacheKey(
                    labelDefinition.screwType,
                    centerForIcon[0],
                    centerForIcon[1]
                ),
                () => transforms.translate(centerForIcon, icon3D)
            );

        if (withScrewTypeText) {
            const calculatedFontSize = calculateFontSizeFor(
                labelDefinition.screwMainText,
                boldFont,
                x_length / 3 * 2 - 1.5,
                y_length / 2,
                MIN_SCREW_TYPE_TEXT_SIZE,
                MAX_SCREW_TYPE_TEXT_SIZE
            )
            const resolvedSize = calculatedFontSize ?? MIN_SCREW_TYPE_TEXT_SIZE;
            const fontPartState: PartState = calculatedFontSize ? 'OK' : 'WARN';
            if (fontPartState === 'WARN') {
                notifications.add('screwMainText', { message: TEXT_OVERSIZED_WARNING, level: 'WARN' });
            }

            const screwMainText3D = this.getCachedOrGeneratePart(
                this.createTextWithStateCacheKey(labelDefinition.screwMainText, boldFont, resolvedSize, fontPartState),
                () => this.extrudeLabelContent({ geom: createText(labelDefinition.screwMainText, boldFont, resolvedSize), state: fontPartState })
            );

            const textPosition: [number, number, number] = [x_length / 2 - x_length / 3 + screwTypeIconAndMainTextXOffset, -(y_length / 2 - y_length / 4), 0];
            const positionedScrewMainText3D = this.getCachedOrGeneratePart(
                this.createTextWithStateAndPositionCacheKey(
                    labelDefinition.screwMainText,
                    boldFont,
                    resolvedSize,
                    fontPartState,
                    textPosition[0],
                    textPosition[1]
                ),
                () => transforms.translate(textPosition, screwMainText3D)
            );

            return [positionedIcon3D, positionedScrewMainText3D];
        }
        else {
            return [positionedIcon3D]
        }
    }

    private getCenterForScrewTypeIcon(withText: boolean): [number, number, number] {
        const x = x_length / 2 - x_length / 3 + screwTypeIconAndMainTextXOffset
        if (withText) {
            const y = y_length / 2 - (y_length / 4 + 0.4)
            return [x, y, 0]
        }
        else {
            return [x, 0, 0]
        }
    }

    private createScrewDriveTextAndIcon(labelDefinition: ScrewLabelDefinition, boldFont: opentype.Font): Geom3[] {
        const withScrewDriveText = Boolean(labelDefinition.screwDriveText)
        const centerForIcon = this.getCenterForScrewDriveIcon(withScrewDriveText)

        const icon3D = this.getCachedOrGeneratePart(
            labelDefinition.screwDrive,
            () => this.extrudeLabelContent({ geom: getScrewDriveIcon(labelDefinition.screwDrive), state: 'OK' })
        )

        const positionedIcon3D = this.getCachedOrGeneratePart(
            this.createIconWithPositionCacheKey(
                labelDefinition.screwDrive,
                centerForIcon[0],
                centerForIcon[1]
            ),
            () => transforms.translate(centerForIcon, icon3D)
        )

        if (withScrewDriveText) {
            const textPosition: [number, number, number] = [-(x_length / 2 - x_length / 6), -y_length / 2 + screwDriveTextSize / 2.4, 0]

            const screwDriveText3D = this.getCachedOrGeneratePart(
                this.createTextWithStateCacheKey(labelDefinition.screwDriveText, boldFont, screwDriveTextSize, "OK"),
                () => this.extrudeLabelContent({ geom: createText(labelDefinition.screwDriveText, boldFont, screwDriveTextSize), state: 'OK' })
            )
            const positionedScrewDriveText3D = this.getCachedOrGeneratePart(
                this.createTextWithStateAndPositionCacheKey(
                    labelDefinition.screwDriveText,
                    boldFont,
                    screwDriveTextSize,
                    "OK",
                    textPosition[0],
                    textPosition[1]
                ),
                () => transforms.translate(textPosition, screwDriveText3D)
            )
            return [positionedIcon3D, positionedScrewDriveText3D]
        } else {
            return [positionedIcon3D]
        }
    }

    private getCenterForScrewDriveIcon(withText: boolean): [number, number, number] {
        const x = -(x_length / 2 - x_length / 6)
        if (withText) {
            const y = y_length / 2 - (0.4 + ICON_CIRCLE_RADIUS)
            return [x, y, 0]
        }
        else {
            return [x, 0, 0]
        }
    }

    private getCachedOrGeneratePart(key: string, fn: () => Geom3): Geom3 {
        if (!this.config.enable3DPartsCache) {
            return fn();
        }

        const cached = this.partsCache.get(key);
        if (cached) {
            return cached;
        }
        const value = fn();
        this.partsCache.set(key, value);
        return value;
    }

    private extrudeLabelContent(part: LabelPart2D): Geom3 {
        return transforms.translateZ(label_thickness,
            colors.colorize(PART_STATE_COLORS[part.state] ?? [0, 0, 0],
                extrusions.extrudeLinear({ height: LABEL_CONTENT_TICKNESS + (part.state !== 'OK' ? 0.001 : 0) }, part.geom)));
    }

    private createTextWithStateCacheKey(
        text: string,
        font: opentype.Font,
        size: number,
        state: PartState
    ): string {
        return `${createTextCacheKey(text, font, size)}|${state}`;
    }

    private createTextWithStateAndPositionCacheKey(
        text: string,
        font: opentype.Font,
        size: number,
        state: PartState,
        x: number,
        y: number
    ): string {
        return `${this.createTextWithStateCacheKey(text, font, size, state)}|${x.toFixed(4)}|${y.toFixed(4)}`;
    }


    private createIconWithPositionCacheKey(id: string, x: number, y: number): string {
        return `${id}|${x.toFixed(4)}|${y.toFixed(4)}`;
    }
}

// general helpers

const TEXT_OVERSIZED_WARNING = 'Text too long, displaying at minimum if auto font size'


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

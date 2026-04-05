import opentype from 'opentype.js';
import { createPath } from './font-utils';
import { floorTo } from '$lib/shared/utils/math-util';

/**
 * Calculates the ideal, possible font size (height in mm) for the given parameters.
 * @param text
 * @param font 
 * @param maxWidth 
 * @param maxHeight 
 * @param minFontSize 
 * @param maxFontSize 
 * @param preferredFontSize 
 */
export const calculateFontSizeFor = (
    text: string,
    font: opentype.Font,
    maxWidth: number,
    maxHeight: number,
    minFontSize: number,
    maxFontSize: number,
    preferredFontSize: number = maxFontSize,
): number | null => {
    const { width, height } = measurePath(font, text, preferredFontSize);

    if (width <= maxWidth && height <= maxHeight) {
        return preferredFontSize;
    }

    // scale the font size based on the available space
    const recommendedSize =
        floorTo(
            preferredFontSize * Math.min(maxWidth / width, maxHeight / height),
            2
        )

    return recommendedSize < minFontSize ? null : recommendedSize;
}


// helpers
type PathDimension = { width: number; height: number };

export const measurePath = (font: opentype.Font, text: string, size: number): PathDimension => {
    const boundingBox = createPath(text, font, size).getBoundingBox();

    return {
        width: boundingBox.x2 - boundingBox.x1,
        height: boundingBox.y2 - boundingBox.y1,
    };
};
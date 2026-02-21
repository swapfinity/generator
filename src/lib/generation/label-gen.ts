
import * as jscad from '@jscad/modeling';
const { booleans, colors, extrusions, primitives, transforms, geometries } = jscad;
import { createText } from './font-utils';
import { getScrewDriveIcon } from './screw-drive-icon-gen';


const x_length = 33.50
const y_length = 13.40
const rounding = 1;
const tab_rounding_offset = 0.192;
const tab_diameter = 5.40;
const tab_radius = tab_diameter / 2;
const segments = 32;
const label_thickness = 0.6;

const main_text_size = 6.5;
const main_text_thickness = 0.4;

export const generateLabelGeometry = (
    text: string,
    overpassRegularFont: any
) => {
    const leftTab = primitives.circle({ radius: tab_radius, center: [-x_length / 2, 0], segments });
    const rightTab = primitives.circle({ radius: tab_radius, center: [x_length / 2, 0], segments });

    const labelBody = primitives.roundedRectangle({ size: [x_length, y_length], roundRadius: rounding, segments: segments })

    // create inner corner fillets
    const topRightFillet = booleans.subtract(
        primitives.square({ size: rounding, center: [x_length / 2 + rounding / 2 - 0.001, tab_radius + rounding / 2 - tab_rounding_offset] }),
        primitives.circle({ radius: rounding, center: [x_length / 2 + rounding - 0.001, tab_radius + rounding - tab_rounding_offset] })
    )
    const topLeftFillet = transforms.mirrorX(topRightFillet)
    const innerCornerFillets = [
        topRightFillet,
        topLeftFillet,
        transforms.mirrorY(topRightFillet),
        transforms.mirrorY(topLeftFillet)
    ]

    const labelBase2D = booleans.union(leftTab, rightTab, labelBody, ...innerCornerFillets);
    const labelBase3D = colors.colorize([1, 1, 1], extrusions.extrudeLinear({ height: label_thickness }, labelBase2D));
    geometries.geom3.validate(labelBase3D)

    const textParts2D = createText(text, overpassRegularFont, main_text_size);
    const text3D = transforms.translateZ(main_text_thickness, colors.colorize([0, 0, 0], extrusions.extrudeLinear({ height: main_text_thickness }, textParts2D)));

    const icon2D = getScrewDriveIcon("TORX");
    const icon3D = transforms.translateZ(main_text_thickness, colors.colorize([0, 0, 0], extrusions.extrudeLinear({ height: label_thickness }, icon2D)));

    return [labelBase3D, icon3D];
}

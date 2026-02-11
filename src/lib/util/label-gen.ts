import jscad from '@jscad/modeling';
import Geom3 from '@jscad/modeling/src/geometries/geom3';

const { booleans, primitives, transforms, colors, extrusions } = jscad;

const x_length = 33.50
const y_length = 13.40
const rounding = 1;
const tab_rounding_offset = 0.192;
const tab_diameter = 5.40;
const tab_radius = tab_diameter / 2;
const segments = 32;
const label_thickness = 0.6;

const main_text = "Key Chain";
const main_text_size = 5;
const main_text_thickness = 0.4;

export const generateLabelGeometry = () => {
    const leftTab = primitives.circle({ radius: tab_radius, center: [-x_length / 2, 0], segments });
    const rightTab = primitives.circle({ radius: tab_radius, center: [x_length / 2, 0], segments });

    const labelBody = primitives.roundedRectangle({ size: [x_length, y_length], roundRadius: rounding, segments: segments })

    // create inner corner fillets
    const topRightFillet = booleans.subtract(
        primitives.square({ size: rounding, center: [x_length / 2 + rounding / 2, tab_radius + rounding / 2 - tab_rounding_offset] }),
        primitives.circle({ radius: rounding, center: [x_length / 2 + rounding, tab_radius + rounding - tab_rounding_offset] })
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
    // TODO proper text & svg variants


    Geom3.validate(labelBase3D)
    return [labelBase3D];
}
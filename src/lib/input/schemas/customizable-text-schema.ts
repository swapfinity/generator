import { z } from "zod";

const firstLineFontType = z
    .enum(["regular", "bold", "extraBold"])
    .default("bold")
    .describe("The font type of the text.")
    .meta({
        viewName: "Font Type",
        asRadio: true,
        labelMap: {
            regular: "Regular",
            bold: "Bold",
            extraBold: "Extra Bold",
        },
        rowName: "firstLineFontProps",
        rowWeight: 1,
    });

const firstLineAutoSize = z
    .boolean()
    .default(true)
    .describe("Auto size text.")
    .meta({
        viewName: "Auto Size",
        rowName: "firstLineFontProps",
        rowWeight: 0,
    });

const firstLineFontSize = z
    .number()
    .default(6.5)
    .describe("Font height in mm")
    .meta({
        viewName: "Font Size",
        rowName: "firstLineFontProps",
        rowWeight: 2,
        disabledWhen: { field: "firstLineAutoSize", when: true },
        min: 1,
        max: 15,
        step: 0.1,
    });

const firstLineXOffset = z
    .number()
    .default(0)
    .describe("X offset in mm")
    .meta({
        viewName: "X Offset",
        rowName: "firstLineFontProps",
        rowWeight: 3,
        min: -50,
        max: 50,
        step: 0.1,
    });

const firstLineYOffset = z
    .number()
    .default(0)
    .describe("Y offset in mm")
    .meta({
        viewName: "Y Offset",
        rowName: "firstLineFontProps",
        rowWeight: 3,
        min: -50,
        max: 50,
        step: 0.1,
    });

const secondLineFontType = z
    .enum(["regular", "bold", "extraBold"])
    .default("bold")
    .describe("The font type of the text.")
    .meta({
        viewName: "Font Type",
        asRadio: true,
        labelMap: {
            regular: "Regular",
            bold: "Bold",
            extraBold: "Extra Bold",
        },
        rowName: "secondLineFontProps",
        rowWeight: 1,
    });

const secondLineAutoSize = z
    .boolean()
    .default(true)
    .describe("Auto size text.")
    .meta({
        viewName: "Auto Size",
        rowName: "secondLineFontProps",
        rowWeight: 0,
    });

const secondLineFontSize = z
    .number()
    .default(6.5)
    .describe("Font height in mm")
    .meta({
        viewName: "Font Size",
        rowName: "secondLineFontProps",
        rowWeight: 2,
        disabledWhen: { field: "secondLineAutoSize", when: true },
        min: 1,
        max: 15,
        step: 0.1,
    });

const secondLineXOffset = z
    .number()
    .default(0)
    .describe("X offset in mm")
    .meta({
        viewName: "X Offset",
        rowName: "secondLineFontProps",
        rowWeight: 3,
        min: -50,
        max: 50,
        step: 0.1,
    });

const secondLineYOffset = z
    .number()
    .default(0)
    .describe("Y offset in mm")
    .meta({
        viewName: "Y Offset",
        rowName: "secondLineFontProps",
        rowWeight: 3,
        min: -50,
        max: 50,
        step: 0.1,
    });

export const CustomizableTextLabelSchema = z.object({
    type: z.literal("CUSTOMIZABLE_TEXT").default("CUSTOMIZABLE_TEXT"),
    firstLine: z.string().default("Label Text").meta({ viewName: "First Line" }),
    firstLineFontWeight: firstLineFontType,
    firstLineFontSize: firstLineFontSize,
    firstLineXOffset,
    firstLineYOffset,
    secondLine: z.string().default("").describe("Additional Line of Text - Optional").meta({ viewName: "Second Line", rowName: "secondLine" }),
    secondLineFontWeight: secondLineFontType,
    secondLineFontSize: secondLineFontSize,
    secondLineXOffset,
    secondLineYOffset,
}).meta({
    rows: {
        firstLineFontProps: {
            viewName: "Extended Properties",
            collapsible: true,
            defaultCollapsed: true,
        },
        secondLine: {
            spacingBefore: "calc(var(--pico-spacing) * 3)",
        },
        secondLineFontProps: {
            viewName: "Extended Properties",
            collapsible: true,
            defaultCollapsed: true,
        },
    }
});

export type CustomizableTextLabel = z.infer<typeof CustomizableTextLabelSchema>;

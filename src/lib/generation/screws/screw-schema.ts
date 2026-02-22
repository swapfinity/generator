import { z } from "zod";

// schemas
const ScrewDrive = z.enum(["PH", "SLOT", "CROSS", "SQUARE", "HEX_SOCKET", "TORX"]).default("TORX")
const ScrewType = z.enum(["FLAT_HEAD", "ROUND_HEAD", "PAN_HEAD"])

export const ScrewLabelSchema = z.object({
    type: z.literal("SCREW"),
    screwDrive: ScrewDrive,
    screwDriveText: z.string().nullable().meta({ viewName: "Screw Drive Text" }),
    screwType: ScrewType,
    screwTypeText: z.string().nullable(),
});

export const PlainTextLabelSchema = z.object({
    type: z.literal("PLAIN_TEXT"),
    text: z.string(),
});

export const LabelDefinitionSchema = z.discriminatedUnion("type", [
    ScrewLabelSchema,
    PlainTextLabelSchema,
]);

// types
export type ScrewDrive = z.infer<typeof ScrewDrive>
export type ScrewType = z.infer<typeof ScrewType>

export type ScrewLabel = z.infer<typeof ScrewLabelSchema>
export type PlainTextLabel = z.infer<typeof PlainTextLabelSchema>
export type LabelDefinition = z.infer<typeof LabelDefinitionSchema>

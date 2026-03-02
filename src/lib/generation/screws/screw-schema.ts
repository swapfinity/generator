import { z, ZodObject } from "zod";

// schemas
const screwDrive = z.enum(["PH", "SLOT", "CROSS", "SQUARE", "HEX_SOCKET", "TORX"]).default("TORX").describe("The drive type of the screw.").meta({ rowWeight: 1, rowName: "screwDrive" })
const screwType = z.enum(["FLAT_HEAD", "ROUND_HEAD", "PAN_HEAD"]).default("FLAT_HEAD").describe("The type of the screw.").meta({ rowWeight: 1, rowName: "screwType" })

const screwDriveText = z.string().nullable().default(null).meta({ viewName: "Screw Drive Description Text (Optional)", rowWeight: 5, rowName: "screwDrive" }).describe("The text specifying the drive type of the screw.")
const screwTypeText = z.string().nullable().default(null).meta({ viewName: "Screw Type Description Text *", rowWeight: 5, rowName: "screwType" }).describe("The text specifying the type of the screw.")


export const ScrewLabelSchema = z.object({
    type: z.literal("SCREW").default("SCREW"),
    screwDrive: screwDrive,
    screwDriveText: screwDriveText,
    screwType: screwType,
    screwTypeText: screwTypeText,
});

export const PlainTextLabelSchema = z.object({ //TODO move into own file
    type: z.literal("PLAIN_TEXT").default("PLAIN_TEXT"),
    text: z.string().nullable().default(null),
});

// when adding schemas to the map, make sure to add them to the LabelDefinitionSchema type as well
export const LABEL_SCHEMA_MAP = {
    'Screw Label': ScrewLabelSchema,
    'Single Line Text Label': PlainTextLabelSchema,
};
export const LabelDefinitionSchema = z.discriminatedUnion("type", [ScrewLabelSchema, PlainTextLabelSchema]);

// types
export type ScrewDrive = z.infer<typeof screwDrive>
export type ScrewType = z.infer<typeof screwType>

export type ScrewLabel = z.infer<typeof ScrewLabelSchema>
export type PlainTextLabel = z.infer<typeof PlainTextLabelSchema>
export type LabelDefinition = z.infer<typeof LabelDefinitionSchema>

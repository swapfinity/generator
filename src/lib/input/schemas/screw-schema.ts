import { z } from "zod";

// schemas
const screwDrive = z
    .enum(["PH", "PZ", "SLOT", "CROSS", "SQUARE", "HEX_SOCKET", "TORX"])
    .default("TORX")
    .describe("The drive type of the screw.")
    .meta({
        viewName: "Screw Drive",
        rowWeight: 1,
        rowName: "screwDrive",
        labelMap: {
            PH: "Phillips",
            PZ: "Pozidrive",
            SLOT: "Slotted",
            CROSS: "Cross",
            SQUARE: "Square",
            HEX_SOCKET: "Hex Socket",
            TORX: "Torx",
        }
    })

const screwType = z
    .enum(["FLAT_HEAD", "ROUND_HEAD", "PAN_HEAD"])
    .default("PAN_HEAD")
    .describe("The type of the screw.")
    .meta({
        viewName: "Screw Type",
        rowWeight: 1,
        rowName: "screwType",
        labelMap: {
            FLAT_HEAD: "Flat Head",
            ROUND_HEAD: "Round Head",
            PAN_HEAD: "Pan Head",
        }
    })

const screwDriveText = z
    .string()
    .default("")
    .meta({
        viewName: "Screw Drive Description Text (Optional)",
        rowWeight: 2, rowName: "screwDrive",
        patterns: [{ pattern: '^.{0,3}$', message: 'Maximum 3 characters' }]
    })
    .describe("The text specifying the drive type of the screw.")

const screwMainText = z
    .string()
    .default("")
    .meta({
        viewName: "Screw Description Text (Optional)",
        rowWeight: 2, rowName: "screwType",
        patterns: [{ pattern: '^.{0,15}$', message: 'Maximum 15 characters' }]
    })
    .describe("The main text describing the screw.")


export const ScrewLabelSchema = z.object({
    type: z.literal("SCREW").default("SCREW"),
    screwDrive: screwDrive,
    screwDriveText: screwDriveText,
    screwType: screwType,
    screwMainText: screwMainText,
});

// types
export type ScrewDrive = z.infer<typeof screwDrive>
export type ScrewType = z.infer<typeof screwType>

export type ScrewLabelDefinition = z.infer<typeof ScrewLabelSchema>

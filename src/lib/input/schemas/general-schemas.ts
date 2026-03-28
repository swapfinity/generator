import { z } from "zod";
import { ScrewLabelSchema } from "./screw-schema";

// schemas
export const PlainTextLabelSchema = z.object({
    type: z.literal("PLAIN_TEXT").default("PLAIN_TEXT"),
    text: z.string().default("Label Text").meta({ viewName: "Text" })
});

// when adding schemas to the map, make sure to add them to the LabelDefinitionSchema type as well
export const LABEL_SCHEMA_MAP = {
    'Screw Label': ScrewLabelSchema,
    'Single Line Text Label': PlainTextLabelSchema,
};

// types
export const LabelDefinitionSchema = z.discriminatedUnion("type", [ScrewLabelSchema, PlainTextLabelSchema]);
export type LabelDefinition = z.infer<typeof LabelDefinitionSchema>

export type PlainTextLabel = z.infer<typeof PlainTextLabelSchema>

// TODO move to input folder

import { z } from "zod";
import { ScrewLabelSchema } from "./screw-schema";
import { CustomizableTextLabelSchema } from "./customizable-text-schema";
import type { RowDefinition } from "../row-types";

// when adding schemas to the map, make sure to add them to the LabelDefinitionSchema type as well
export const LABEL_SCHEMA_MAP = {
    'Screw Label': ScrewLabelSchema,
    'Customizable Text Label': CustomizableTextLabelSchema,
};

export const LabelDefinitionSchema = z.discriminatedUnion("type", [ScrewLabelSchema, CustomizableTextLabelSchema]);
export type LabelDefinition = z.infer<typeof LabelDefinitionSchema>;

export interface ObjectMeta {
    rows?: Record<string, RowDefinition>;
}

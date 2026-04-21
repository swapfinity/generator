import { z } from "zod";
import { ScrewLabelSchema } from "./screw-schema";
import { CustomizableTextLabelSchema } from "./customizable-text-schema";
import type { RowDefinition } from "../row-types";

// when adding schemas to the map, make sure to add them to the LabelDefinitionSchema type as well
export const LABEL_SCHEMA_MAP: Record<LabelType, LabelSchemaEntry> = {
    'SCREW': {
        displayName: 'Screw Label',
        schema: ScrewLabelSchema,
        nameTemplate: "screw_label{screwType|prefix:_}{screwMainText|prefix:_}{screwDrive|prefix:_}{screwDriveText|prefix:_}"
    },
    'CUSTOMIZABLE_TEXT': { displayName: 'Customizable Text Label', schema: CustomizableTextLabelSchema },
};

export const LabelDefinitionSchema = z.discriminatedUnion("type", [ScrewLabelSchema, CustomizableTextLabelSchema]);
type LabelDefinitionSchema = typeof ScrewLabelSchema | typeof CustomizableTextLabelSchema;
export type LabelDefinition = z.infer<typeof LabelDefinitionSchema>;
export type LabelType = LabelDefinition['type'];
export interface LabelSchemaEntry {
    displayName: string;
    schema: LabelDefinitionSchema;
    nameTemplate?: string;
}

export interface ObjectMeta {
    rows?: Record<string, RowDefinition>;
}

import { LabelDefinitionSchema } from "$lib/input/schemas/general-schemas";
import { z } from "zod";

export const packageSchema = z.array(LabelDefinitionSchema)

export type Package = z.infer<typeof packageSchema>

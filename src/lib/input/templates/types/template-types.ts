import type { LabelDefinition } from "$lib/input/schemas/general-schemas"

export type Template = {
    displayName: string
    labelDefinition: LabelDefinition
}

export type TemplateSet = {
    id: string;
    displayName: string;
    description?: string;
    tags: string[];
    entries: Template[];
} 
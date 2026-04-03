export interface RowDefinition {
    viewName?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    spacingBefore?: string;
}

export type RowDefinitions = Record<string, RowDefinition>;
// base definition
export type BaseInputDefinition = {
    fieldName: string,
    viewName?: string,
    description?: string,
    optional: boolean,
    nullable: boolean,
    default: any
    rowName?: string,
    rowWeight?: number,
    disabledWhen?: DisabledWhen
}

export type DisabledWhen = {
    field: string,
    when: boolean
}

export type InputPattern = {
    pattern: string;
    message: string;
};

// type definition
export type TextInputDefinition = BaseInputDefinition & {
    type: "TEXT";
    patterns?: InputPattern[];
}

export type NumberInputDefinition = BaseInputDefinition & {
    type: "NUMBER";
    min?: number;
    max?: number;
    softMin?: number;
    softMax?: number;
    step?: number;
}

export type SelectInputDefinition = BaseInputDefinition & {
    type: "SELECT"
    options: string[]
    labelMap?: Record<string, string>
}

export type RadioInputDefinition = BaseInputDefinition & {
    type: "RADIO"
    options: string[]
    labelMap?: Record<string, string>
}

export type CheckboxInputDefinition = BaseInputDefinition & {
    type: "BOOLEAN"
}

export type InputDefinition =
    TextInputDefinition
    | NumberInputDefinition
    | SelectInputDefinition
    | RadioInputDefinition
    | CheckboxInputDefinition;

export type GroupedInputs = Record<string, InputDefinition[]>;

export type BaseInput = {
    fieldName: string,
    viewName?: string,
    description?: string,
    optional: boolean,
    nullable: boolean,
    default: any
    rowName?: string,
    rowWeight?: number
}

export type TextInput = BaseInput & {
    type: "TEXT"
}

export type EnumInput = BaseInput & {
    type: "ENUM"
    options: string[]
}

export type EnumOption = {
    value: string
    label: string
}

export type BooleanInput = BaseInput & {
    type: "BOOLEAN"
}


export type InputDefinition = TextInput | EnumInput | BooleanInput

export type GroupedInputs = Record<string, InputDefinition[]>;

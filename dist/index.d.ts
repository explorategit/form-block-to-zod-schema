import zod from "zod";
export declare enum WorkflowFormBlockType {
    SingleSelectField = "single_select_field",
    TextField = "text_field",
    FileField = "file_field",
    CheckboxField = "checkbox_field",
    EmailField = "email_field",
    UrlField = "url_field",
    PhoneField = "phone_field",
    HeadingOne = "heading_one",
    HeadingTwo = "heading_two",
    HeadingThree = "heading_three",
    Divider = "divider",
    Paragraph = "paragraph"
}
export declare const workflowFormFieldBlockTypes: readonly [WorkflowFormBlockType.CheckboxField, WorkflowFormBlockType.SingleSelectField, WorkflowFormBlockType.TextField, WorkflowFormBlockType.FileField, WorkflowFormBlockType.EmailField, WorkflowFormBlockType.UrlField, WorkflowFormBlockType.PhoneField];
export type WorkflowFormFieldBlockTypes = (typeof workflowFormFieldBlockTypes)[number];
export interface WorkflowFormFile {
    type: string;
    name: string;
    key: string;
    size: number;
    uploadedAt: string;
}
export interface WorkflowFormText {
    content: string;
    url: string | null;
    model: {
        id: number;
        name: string;
        attribute: string;
    } | null;
}
export interface CheckboxFieldConfig {
    label: string;
    description: string | null;
    optional: boolean;
}
export interface SingleSelectFieldConfig {
    options: {
        label: string;
        value: string;
    }[];
    label: string;
    description: string | null;
    optional: boolean;
}
export interface TextFieldConfig {
    minLength: number | null;
    maxLength: number | null;
    pattern: {
        value: string;
        message: string;
    } | null;
    label: string;
    description: string | null;
    optional: boolean;
}
export interface FileFieldConfig {
    maxSize: number | null;
    allowedTypes: string[] | null;
    multiple: boolean;
    label: string;
    description: string | null;
    optional: boolean;
}
export interface EmailFieldConfig {
    label: string;
    description: string | null;
    optional: boolean;
    allowedDomains: {
        domain: string;
        exact: boolean;
    }[] | null;
}
export interface PhoneFieldConfig {
    label: string;
    description: string | null;
    optional: boolean;
    allowedCountries: string[] | null;
}
export interface UrlFieldConfig {
    label: string;
    description: string | null;
    optional: boolean;
    allowedDomains: {
        domain: string;
        exact: boolean;
    }[] | null;
}
export type WorkflowFormBlock = {
    key: string;
} & ({
    type: WorkflowFormBlockType.CheckboxField;
    value: boolean | null;
    [WorkflowFormBlockType.CheckboxField]: CheckboxFieldConfig;
} | {
    type: WorkflowFormBlockType.SingleSelectField;
    value: string | null;
    [WorkflowFormBlockType.SingleSelectField]: SingleSelectFieldConfig;
} | {
    type: WorkflowFormBlockType.TextField;
    value: string | null;
    [WorkflowFormBlockType.TextField]: TextFieldConfig;
} | {
    type: WorkflowFormBlockType.FileField;
    value: (File | WorkflowFormFile)[] | null;
    [WorkflowFormBlockType.FileField]: FileFieldConfig;
} | {
    type: WorkflowFormBlockType.EmailField;
    value: string | null;
    [WorkflowFormBlockType.EmailField]: EmailFieldConfig;
} | {
    type: WorkflowFormBlockType.UrlField;
    value: string | null;
    [WorkflowFormBlockType.UrlField]: UrlFieldConfig;
} | {
    type: WorkflowFormBlockType.PhoneField;
    value: string | null;
    [WorkflowFormBlockType.PhoneField]: PhoneFieldConfig;
} | {
    type: WorkflowFormBlockType.HeadingOne;
    [WorkflowFormBlockType.HeadingOne]: WorkflowFormText[];
} | {
    type: WorkflowFormBlockType.HeadingTwo;
    [WorkflowFormBlockType.HeadingTwo]: WorkflowFormText[];
} | {
    type: WorkflowFormBlockType.HeadingThree;
    [WorkflowFormBlockType.HeadingThree]: WorkflowFormText[];
} | {
    type: WorkflowFormBlockType.Divider;
} | {
    type: WorkflowFormBlockType.Paragraph;
    [WorkflowFormBlockType.Paragraph]: WorkflowFormText[];
});
export type WorkflowFormFieldBlock = Extract<WorkflowFormBlock, {
    type: WorkflowFormFieldBlockTypes;
}>;
/**
 * Get the zod schema for a block
 * @param block - The block to get the schema for
 * @param allowNullish - Whether to allow nullish values. If true, the schema will be optional regardless of the block's configuration. If false, the schema will be only be optional if the block is optional.
 * @returns
 */
export default function getBlockSchema(block: WorkflowFormBlock, allowNullish?: boolean): zod.ZodSchema | null;

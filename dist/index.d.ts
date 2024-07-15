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
export interface WorkflowFormText {
    content: string;
    url: string | null;
    model: {
        id: number;
        name: string;
        attribute: string;
    } | null;
}
export type WorkflowFormBlock = {
    key: string;
} & ({
    type: WorkflowFormBlockType.CheckboxField;
    value: boolean | null;
    [WorkflowFormBlockType.CheckboxField]: {
        label: string;
        description: string | null;
        optional: boolean;
        required: boolean;
    };
} | {
    type: WorkflowFormBlockType.SingleSelectField;
    value: string | null;
    [WorkflowFormBlockType.SingleSelectField]: {
        options: {
            label: string;
            value: string;
        }[];
        label: string;
        description: string | null;
        optional: boolean;
    };
} | {
    type: WorkflowFormBlockType.TextField;
    value: string | null;
    [WorkflowFormBlockType.TextField]: {
        minLength: number | null;
        maxLength: number | null;
        pattern: {
            value: string;
            message: string;
        } | null;
        label: string;
        description: string | null;
        optional: boolean;
    };
} | {
    type: WorkflowFormBlockType.FileField;
    value: string[] | null;
    [WorkflowFormBlockType.FileField]: {
        maxSize: number | null;
        allowedTypes: string[] | null;
        multiple: boolean;
        label: string;
        description: string | null;
        optional: boolean;
    };
} | {
    type: WorkflowFormBlockType.EmailField;
    value: string | null;
    [WorkflowFormBlockType.EmailField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedDomains: {
            domain: string;
            exact: boolean;
        }[] | null;
    };
} | {
    type: WorkflowFormBlockType.UrlField;
    value: string | null;
    [WorkflowFormBlockType.UrlField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedDomains: {
            domain: string;
            exact: boolean;
        }[] | null;
    };
} | {
    type: WorkflowFormBlockType.PhoneField;
    value: string | null;
    [WorkflowFormBlockType.PhoneField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedCountries: string[] | null;
    };
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
 *
 * @param block - The block to get the schema for
 * @param allowNullish - Whether to allow nullish values.
 * If true, the schema will be optional regardless of the block's configuration.
 * If false, the schema will be only be optional if the block is optional.
 * @returns
 */
export default function getBlockSchema(block: WorkflowFormBlock, allowNullish?: boolean): zod.ZodType<any, zod.ZodTypeDef, any> | null;

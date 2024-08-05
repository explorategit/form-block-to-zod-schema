"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowFormFieldBlockTypes = exports.WorkflowFormBlockType = void 0;
exports.default = getBlockSchema;
const libphonenumber_js_1 = require("libphonenumber-js");
const zod_1 = __importDefault(require("zod"));
var WorkflowFormBlockType;
(function (WorkflowFormBlockType) {
    WorkflowFormBlockType["SingleSelectField"] = "single_select_field";
    WorkflowFormBlockType["TextField"] = "text_field";
    WorkflowFormBlockType["FileField"] = "file_field";
    WorkflowFormBlockType["CheckboxField"] = "checkbox_field";
    WorkflowFormBlockType["EmailField"] = "email_field";
    WorkflowFormBlockType["UrlField"] = "url_field";
    WorkflowFormBlockType["PhoneField"] = "phone_field";
    WorkflowFormBlockType["HeadingOne"] = "heading_one";
    WorkflowFormBlockType["HeadingTwo"] = "heading_two";
    WorkflowFormBlockType["HeadingThree"] = "heading_three";
    WorkflowFormBlockType["Divider"] = "divider";
    WorkflowFormBlockType["Paragraph"] = "paragraph";
})(WorkflowFormBlockType || (exports.WorkflowFormBlockType = WorkflowFormBlockType = {}));
exports.workflowFormFieldBlockTypes = [
    WorkflowFormBlockType.CheckboxField,
    WorkflowFormBlockType.SingleSelectField,
    WorkflowFormBlockType.TextField,
    WorkflowFormBlockType.FileField,
    WorkflowFormBlockType.EmailField,
    WorkflowFormBlockType.UrlField,
    WorkflowFormBlockType.PhoneField,
];
function getOptionalStringSchema(schema) {
    return zod_1.default
        .union([zod_1.default.literal(""), schema])
        .optional()
        .transform((val) => (val?.trim() === "" ? undefined : val));
}
/**
 * Get the zod schema for a block
 * @param block - The block to get the schema for
 * @param allowNullish - Whether to allow nullish values. If true, the schema will be optional regardless of the block's configuration. If false, the schema will be only be optional if the block is optional.
 * @returns
 */
function getBlockSchema(block, allowNullish = false) {
    switch (block.type) {
        case WorkflowFormBlockType.FileField: {
            const fileField = block[WorkflowFormBlockType.FileField];
            let typeSchema = zod_1.default.string();
            if (fileField.allowedTypes) {
                const formatter = new Intl.ListFormat("en-AU", {
                    style: "long",
                    type: "disjunction",
                });
                typeSchema = typeSchema.refine((value) => fileField.allowedTypes.includes(value), {
                    message: `File must be of type ${formatter.format(fileField.allowedTypes.map((type) => `"${type}"`))}`,
                });
            }
            let sizeSchema = zod_1.default.number();
            if (fileField.maxSize !== null) {
                sizeSchema = sizeSchema.max(fileField.maxSize);
            }
            const remoteFileSchema = zod_1.default.intersection(zod_1.default.object({
                type: typeSchema,
                size: sizeSchema,
            }), zod_1.default.record(zod_1.default.string(), zod_1.default.union([zod_1.default.string(), zod_1.default.number()])));
            let schema = zod_1.default.array(remoteFileSchema);
            if ("File" in globalThis) {
                const fileSchema = zod_1.default.instanceof(File).superRefine((value, ctx) => {
                    [
                        [sizeSchema, "size"],
                        [typeSchema, "type"],
                    ].forEach(([schema, key], index) => {
                        schema
                            .safeParse(value[key], { path: [index] })
                            .error?.issues.forEach((issue) => {
                            ctx.addIssue(issue);
                        });
                    });
                });
                schema = zod_1.default.array(zod_1.default.union([fileSchema, remoteFileSchema]));
            }
            if (!fileField.multiple) {
                schema = schema.max(1, "Only one file is allowed");
            }
            if (allowNullish || fileField.optional) {
                return schema.optional();
            }
            return schema.min(1, "At least one file is required");
        }
        case WorkflowFormBlockType.CheckboxField: {
            const checkboxField = block[WorkflowFormBlockType.CheckboxField];
            let schema = zod_1.default.boolean();
            if (allowNullish || checkboxField.optional) {
                return schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.SingleSelectField: {
            const singleSelectField = block[WorkflowFormBlockType.SingleSelectField];
            const values = singleSelectField.options.map((option) => option.value);
            const formatter = new Intl.ListFormat("en-AU", {
                style: "long",
                type: "disjunction",
            });
            let schema = zod_1.default.string().refine((value) => values.includes(value), {
                message: `Must be one of ${formatter.format(singleSelectField.options.map(({ label }) => `\`${label}\``))}.`,
            });
            if (allowNullish || singleSelectField.optional) {
                return schema.nullish();
            }
            return schema;
        }
        case WorkflowFormBlockType.TextField: {
            const textField = block[WorkflowFormBlockType.TextField];
            let schema = zod_1.default.string();
            if (textField.pattern) {
                schema = schema.regex(new RegExp(textField.pattern.value), textField.pattern.message);
            }
            if (textField.minLength) {
                schema = schema.min(textField.minLength);
            }
            if (textField.maxLength) {
                schema = schema.max(textField.maxLength);
            }
            if (allowNullish || textField.optional) {
                return getOptionalStringSchema(schema);
            }
            return schema;
        }
        case WorkflowFormBlockType.EmailField: {
            const emailField = block[WorkflowFormBlockType.EmailField];
            let schema = zod_1.default.string().email();
            if (emailField.allowedDomains) {
                const formatter = new Intl.ListFormat("en-AU", {
                    style: "long",
                    type: "disjunction",
                });
                schema = schema.refine((value) => {
                    const hostname = value.split("@")[1];
                    return emailField.allowedDomains.some(({ domain, exact }) => exact ? hostname === domain : hostname?.endsWith(domain));
                }, {
                    message: `Domain must be ${formatter.format(emailField.allowedDomains.map(({ domain }) => `"${domain}"`))}`,
                });
            }
            if (allowNullish || emailField.optional) {
                return getOptionalStringSchema(schema);
            }
            return schema;
        }
        case WorkflowFormBlockType.UrlField: {
            const urlField = block[WorkflowFormBlockType.UrlField];
            let schema = zod_1.default.string().url();
            if (urlField.allowedDomains) {
                const formatter = new Intl.ListFormat("en-AU", {
                    style: "long",
                    type: "disjunction",
                });
                schema = schema.refine((value) => {
                    if ((allowNullish || urlField.optional) && !value) {
                        return false;
                    }
                    try {
                        const url = new URL(value);
                        return urlField.allowedDomains.some(({ domain, exact }) => exact ? url.hostname === domain : url.hostname.endsWith(domain));
                    }
                    catch {
                        return false;
                    }
                }, {
                    message: `Domain must be ${formatter.format(urlField.allowedDomains.map(({ domain }) => `"${domain}"`))}`,
                });
            }
            if (allowNullish || urlField.optional) {
                return getOptionalStringSchema(schema);
            }
            return schema;
        }
        case WorkflowFormBlockType.PhoneField: {
            const phoneField = block[WorkflowFormBlockType.PhoneField];
            let defaultCountry;
            if (typeof navigator !== "undefined") {
                defaultCountry = navigator.language.split("-")[1];
            }
            if (defaultCountry !== undefined && !(0, libphonenumber_js_1.isSupportedCountry)(defaultCountry)) {
                defaultCountry = undefined;
            }
            const schema = zod_1.default
                .string()
                .superRefine((val, ctx) => {
                try {
                    const phoneNumber = (0, libphonenumber_js_1.parsePhoneNumber)(val, {
                        defaultCountry,
                    });
                    if (phoneField.allowedCountries) {
                        const formatter = new Intl.ListFormat("en-AU", {
                            style: "long",
                            type: "disjunction",
                        });
                        if ((!phoneNumber.country && !defaultCountry) ||
                            !phoneField.allowedCountries.includes((phoneNumber.country ?? defaultCountry))) {
                            ctx.addIssue({
                                code: zod_1.default.ZodIssueCode.custom,
                                message: `Phone number must be from ${formatter.format(phoneField.allowedCountries.map((countryCode) => `${countryCode} (+${(0, libphonenumber_js_1.getCountryCallingCode)(countryCode)})`))}`,
                                fatal: true,
                            });
                        }
                    }
                    return zod_1.default.NEVER;
                }
                catch (e) {
                    ctx.addIssue({
                        code: zod_1.default.ZodIssueCode.custom,
                        message: "Invalid phone number",
                        fatal: true,
                    });
                    return zod_1.default.NEVER;
                }
            })
                .transform((val) => {
                const phoneNumber = (0, libphonenumber_js_1.parsePhoneNumber)(val, {
                    defaultCountry,
                });
                return phoneNumber.format("E.164");
            });
            if (allowNullish || phoneField.optional) {
                return getOptionalStringSchema(schema);
            }
            return schema;
        }
        default:
            return null;
    }
}

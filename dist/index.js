"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFormBlockType = void 0;
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
function getBlockSchema(block) {
    switch (block.type) {
        case WorkflowFormBlockType.FileField: {
            const fileField = block[WorkflowFormBlockType.FileField];
            let schema = zod_1.default.array(zod_1.default.string());
            if (!fileField.optional) {
                schema = schema.min(1);
            }
            if (!fileField.multiple) {
                schema = schema.max(1);
            }
            return schema;
        }
        case WorkflowFormBlockType.CheckboxField: {
            const checkboxField = block[WorkflowFormBlockType.CheckboxField];
            let schema = zod_1.default.boolean();
            if (checkboxField.required) {
                schema = schema.refine((bool) => bool === true, {
                    message: "This field is required",
                });
            }
            if (checkboxField.optional) {
                schema = schema.optional();
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
            let schema = zod_1.default
                .string()
                .refine((value) => (singleSelectField.optional && !value) || values.includes(value), {
                message: `Must be one of ${formatter.format(values.map((value) => `\`${value}\``))}.`,
            });
            if (singleSelectField.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.TextField: {
            const textField = block[WorkflowFormBlockType.TextField];
            let schema = zod_1.default.string();
            if (textField.pattern) {
                schema = schema.regex(new RegExp(textField.pattern.value), textField.pattern.message);
            }
            if (textField.maxLength) {
                schema = schema.max(textField.maxLength);
            }
            if (textField.minLength) {
                schema = schema.min(textField.minLength);
            }
            else if (!textField.optional) {
                schema = schema.min(1);
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
                    if (emailField.optional && !value)
                        return false;
                    const hostname = value.split("@")[1];
                    return emailField.allowedDomains.some(({ domain, exact }) => exact ? hostname === domain : hostname?.endsWith(domain));
                }, {
                    message: `Domain must be ${formatter.format(emailField.allowedDomains.map(({ domain }) => `"${domain}"`))}`,
                });
            }
            if (emailField.optional) {
                schema = schema.optional();
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
                    if (urlField.optional && !value) {
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
            if (urlField.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.PhoneField: {
            const phoneField = block[WorkflowFormBlockType.PhoneField];
            let schema = zod_1.default.string().superRefine((val, ctx) => {
                try {
                    if (phoneField.optional && !val)
                        return zod_1.default.NEVER;
                    let defaultCountry = undefined;
                    if (typeof navigator !== "undefined") {
                        defaultCountry = navigator.language.split("-")[1];
                    }
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
            });
            if (phoneField.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        default:
            return null;
    }
}

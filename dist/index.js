"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFormBlockType = void 0;
exports.default = getBlockSchema;
var libphonenumber_js_1 = require("libphonenumber-js");
var zod_1 = __importDefault(require("zod"));
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
function joinList(list, booleanOperator) {
    if (booleanOperator === void 0) { booleanOperator = "or"; }
    return "".concat(list.slice(0, -1).join(", "), " ").concat(booleanOperator, " ").concat(list.slice(-1)[0]);
}
function getDefaultCountry() {
    if (typeof navigator === "undefined")
        return undefined;
    return navigator.language.split("-")[1];
}
function getBlockSchema(block) {
    switch (block.type) {
        case WorkflowFormBlockType.FileField: {
            var fileField = block[WorkflowFormBlockType.FileField];
            var schema = zod_1.default.array(zod_1.default.string());
            if (!fileField.optional) {
                schema = schema.min(1);
            }
            if (!fileField.multiple) {
                schema = schema.max(1);
            }
            return schema;
        }
        case WorkflowFormBlockType.CheckboxField: {
            var checkboxField = block[WorkflowFormBlockType.CheckboxField];
            var schema = zod_1.default.boolean();
            if (!checkboxField.optional) {
                schema = schema.refine(function (bool) { return bool === true; }, {
                    message: "This field is required",
                });
            }
            return schema;
        }
        case WorkflowFormBlockType.SingleSelectField: {
            var singleSelectField = block[WorkflowFormBlockType.SingleSelectField];
            var schema = zod_1.default.string();
            if (singleSelectField.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.TextField: {
            var textField = block[WorkflowFormBlockType.TextField];
            var schema = zod_1.default.string();
            if (textField.pattern) {
                schema = schema.regex(new RegExp(textField.pattern.value), textField.pattern.message);
            }
            if (textField.maxLength) {
                schema = schema.max(textField.maxLength);
            }
            if (textField.minLength) {
                schema = schema.min(textField.minLength);
            }
            if (!textField.optional) {
                schema = schema.min(1);
            }
            return schema;
        }
        case WorkflowFormBlockType.EmailField: {
            var emailField_1 = block[WorkflowFormBlockType.EmailField];
            var schema = zod_1.default.string().email();
            if (emailField_1.allowedDomains) {
                schema = schema.refine(function (email) {
                    if (!(typeof email === "string"))
                        return false;
                    var domain = email.split("@")[1];
                    return emailField_1.allowedDomains.includes(domain);
                }, {
                    message: "Domain must be ".concat(joinList(emailField_1.allowedDomains.map(function (domain) { return "\"".concat(domain, "\""); }))),
                });
            }
            if (emailField_1.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.UrlField: {
            var urlField = block[WorkflowFormBlockType.UrlField];
            var schema = zod_1.default.string().url();
            if (urlField.optional) {
                schema = schema.optional();
            }
            return schema;
        }
        case WorkflowFormBlockType.PhoneField: {
            var phoneField_1 = block[WorkflowFormBlockType.PhoneField];
            var schema = zod_1.default.string().superRefine(function (val, ctx) {
                var _a;
                try {
                    if (phoneField_1.optional && !val)
                        return zod_1.default.NEVER;
                    var defaultCountry = getDefaultCountry();
                    var phoneNumber = (0, libphonenumber_js_1.parsePhoneNumber)(val, {
                        defaultCountry: defaultCountry,
                    });
                    if (phoneField_1.allowedCountries) {
                        if ((!phoneNumber.country && !defaultCountry) ||
                            !phoneField_1.allowedCountries.includes(((_a = phoneNumber.country) !== null && _a !== void 0 ? _a : defaultCountry))) {
                            ctx.addIssue({
                                code: zod_1.default.ZodIssueCode.custom,
                                message: "Phone number must be from ".concat(joinList(phoneField_1.allowedCountries.map(function (countryCode) {
                                    return "".concat(countryCode, " (+").concat((0, libphonenumber_js_1.getCountryCallingCode)(countryCode), ")");
                                }))),
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
            return schema;
        }
        default:
            return null;
    }
}

import {
  CountryCode,
  getCountryCallingCode,
  parsePhoneNumber,
} from "libphonenumber-js";
import zod from "zod";

export enum WorkflowFormBlockType {
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
  Paragraph = "paragraph",
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

export type WorkflowFormBlock = {
  id: number;
} & (
  | {
      type: WorkflowFormBlockType.CheckboxField;
      value: boolean;
      [WorkflowFormBlockType.CheckboxField]: {
        label: string;
        description: string | null;
        optional: boolean;
      };
    }
  | {
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
    }
  | {
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
    }
  | {
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
    }
  | {
      type: WorkflowFormBlockType.EmailField;
      value: string | null;
      [WorkflowFormBlockType.EmailField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedDomains: string[] | null;
      };
    }
  | {
      type: WorkflowFormBlockType.UrlField;
      value: string | null;
      [WorkflowFormBlockType.UrlField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedDomains: string[] | null;
      };
    }
  | {
      type: WorkflowFormBlockType.PhoneField;
      value: string | null;
      [WorkflowFormBlockType.PhoneField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedCountries: string[] | null;
      };
    }
  | {
      type: WorkflowFormBlockType.HeadingOne;
      [WorkflowFormBlockType.HeadingOne]: WorkflowFormText[];
    }
  | {
      type: WorkflowFormBlockType.HeadingTwo;
      [WorkflowFormBlockType.HeadingTwo]: WorkflowFormText[];
    }
  | {
      type: WorkflowFormBlockType.HeadingThree;
      [WorkflowFormBlockType.HeadingThree]: WorkflowFormText[];
    }
  | {
      type: WorkflowFormBlockType.Divider;
    }
  | {
      type: WorkflowFormBlockType.Paragraph;
      [WorkflowFormBlockType.Paragraph]: WorkflowFormText[];
    }
);

export const WorkflowFormFieldBlockTypes = [
  WorkflowFormBlockType.CheckboxField,
  WorkflowFormBlockType.SingleSelectField,
  WorkflowFormBlockType.TextField,
  WorkflowFormBlockType.FileField,
  WorkflowFormBlockType.EmailField,
  WorkflowFormBlockType.UrlField,
  WorkflowFormBlockType.PhoneField,
] as const;

export type WorkflowFormFieldBlock = Extract<
  WorkflowFormBlock,
  { type: (typeof WorkflowFormFieldBlockTypes)[number] }
>;

function joinList(list: string[], separator: "or" | "and" = "or") {
  return `${list.slice(0, -1).join(", ")} ${separator} ${list.slice(-1)[0]}`;
}

function getDefaultCountry() {
  if (typeof navigator === "undefined") return undefined;
  return navigator.language.split("-")[1];
}

export default function getBlockSchema(block: WorkflowFormBlock) {
  switch (block.type) {
    case WorkflowFormBlockType.FileField: {
      const fileField = block[WorkflowFormBlockType.FileField];
      let schema = zod.array(zod.string());
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
      let schema: zod.ZodSchema = zod.boolean();
      if (!checkboxField.optional) {
        schema = schema.refine((bool) => bool === true, {
          message: "This field is required",
        });
      }
      return schema;
    }
    case WorkflowFormBlockType.SingleSelectField: {
      const singleSelectField = block[WorkflowFormBlockType.SingleSelectField];
      let schema: zod.ZodSchema = zod.string();
      if (singleSelectField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.TextField: {
      const textField = block[WorkflowFormBlockType.TextField];
      let schema: zod.ZodOptional<zod.ZodString> | zod.ZodString = zod.string();
      if (textField.pattern) {
        schema = schema.regex(
          new RegExp(textField.pattern.value),
          textField.pattern.message
        );
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
      const emailField = block[WorkflowFormBlockType.EmailField];
      let schema: zod.ZodSchema = zod.string().email();
      if (emailField.allowedDomains) {
        schema = schema.refine(
          (email) => {
            if (!(typeof email === "string")) return false;
            const domain = email.split("@")[1];
            return emailField.allowedDomains!.includes(domain);
          },
          {
            message: `Domain must be ${joinList(
              emailField.allowedDomains.map((domain) => `"${domain}"`)
            )}`,
          }
        );
      }
      if (emailField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.UrlField: {
      const urlField = block[WorkflowFormBlockType.UrlField];
      let schema: zod.ZodSchema = zod.string().url();
      if (urlField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.PhoneField: {
      const phoneField = block[WorkflowFormBlockType.PhoneField];
      let schema: zod.ZodSchema = zod.string().superRefine((val, ctx) => {
        try {
          const defaultCountry = getDefaultCountry() as CountryCode | undefined;
          const phoneNumber = parsePhoneNumber(val, {
            defaultCountry,
          });

          if (phoneField.allowedCountries) {
            if (
              (!phoneNumber.country && !defaultCountry) ||
              !phoneField.allowedCountries.includes(
                (phoneNumber.country ?? defaultCountry)!
              )
            ) {
              ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: `Phone number must be from ${joinList(
                  phoneField.allowedCountries.map(
                    (countryCode) =>
                      `${countryCode} (+${getCountryCallingCode(
                        countryCode as CountryCode
                      )})`
                  )
                )}`,
                fatal: true,
              });
            }
          }
          return zod.NEVER;
        } catch (e) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: "Invalid phone number",
            fatal: true,
          });
          return zod.NEVER;
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

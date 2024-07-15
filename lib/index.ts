import {
  getCountryCallingCode,
  parsePhoneNumber,
  type CountryCode,
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

export const workflowFormFieldBlockTypes = [
  WorkflowFormBlockType.CheckboxField,
  WorkflowFormBlockType.SingleSelectField,
  WorkflowFormBlockType.TextField,
  WorkflowFormBlockType.FileField,
  WorkflowFormBlockType.EmailField,
  WorkflowFormBlockType.UrlField,
  WorkflowFormBlockType.PhoneField,
] as const;

export type WorkflowFormFieldBlockTypes =
  (typeof workflowFormFieldBlockTypes)[number];

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
} & (
  | {
      type: WorkflowFormBlockType.CheckboxField;
      value: boolean | null;
      [WorkflowFormBlockType.CheckboxField]: {
        label: string;
        description: string | null;
        optional: boolean;
        required: boolean;
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
        allowedDomains:
          | {
              domain: string;
              exact: boolean;
            }[]
          | null;
      };
    }
  | {
      type: WorkflowFormBlockType.UrlField;
      value: string | null;
      [WorkflowFormBlockType.UrlField]: {
        label: string;
        description: string | null;
        optional: boolean;
        allowedDomains:
          | {
              domain: string;
              exact: boolean;
            }[]
          | null;
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

export type WorkflowFormFieldBlock = Extract<
  WorkflowFormBlock,
  { type: WorkflowFormFieldBlockTypes }
>;

export default function getBlockSchema(
  block: WorkflowFormBlock,
  allowNullish: boolean = false
) {
  switch (block.type) {
    case WorkflowFormBlockType.FileField: {
      const fileField = block[WorkflowFormBlockType.FileField];
      let schema = zod.array(zod.string());
      if (!allowNullish && !fileField.optional) {
        schema = schema.min(1, "At least one file is required");
      }
      if (!fileField.multiple) {
        schema = schema.max(1, "Only one file is allowed");
      }
      return schema;
    }
    case WorkflowFormBlockType.CheckboxField: {
      const checkboxField = block[WorkflowFormBlockType.CheckboxField];
      let schema: zod.ZodSchema = zod.boolean();
      if (checkboxField.required) {
        schema = schema.refine((bool) => bool === true, {
          message: "This field is required",
        });
      }
      if (allowNullish || checkboxField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.SingleSelectField: {
      const singleSelectField = block[WorkflowFormBlockType.SingleSelectField];
      const values = singleSelectField.options.map(
        (option) => option.value
      ) as readonly string[];
      const formatter = new Intl.ListFormat("en-AU", {
        style: "long",
        type: "disjunction",
      });
      let schema: zod.ZodSchema = zod
        .string()
        .refine(
          (value) =>
            ((allowNullish || singleSelectField.optional) && !value) ||
            values.includes(value),
          {
            message: `Must be one of ${formatter.format(
              values.map((value) => `\`${value}\``)
            )}.`,
          }
        );
      if (allowNullish || singleSelectField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.TextField: {
      const textField = block[WorkflowFormBlockType.TextField];
      let schema: zod.ZodString | zod.ZodOptional<zod.ZodString> = zod.string();
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
      if (allowNullish || textField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.EmailField: {
      const emailField = block[WorkflowFormBlockType.EmailField];
      let schema: zod.ZodSchema = zod.string().email();
      if (emailField.allowedDomains) {
        const formatter = new Intl.ListFormat("en-AU", {
          style: "long",
          type: "disjunction",
        });
        schema = schema.refine(
          (value) => {
            if (emailField.optional && !value) return false;
            const hostname = value.split("@")[1];
            return emailField.allowedDomains!.some(({ domain, exact }) =>
              exact ? hostname === domain : hostname?.endsWith(domain)
            );
          },
          {
            message: `Domain must be ${formatter.format(
              emailField.allowedDomains.map(({ domain }) => `"${domain}"`)
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
      if (urlField.allowedDomains) {
        const formatter = new Intl.ListFormat("en-AU", {
          style: "long",
          type: "disjunction",
        });
        schema = schema.refine(
          (value) => {
            if ((allowNullish || urlField.optional) && !value) {
              return false;
            }
            try {
              const url = new URL(value);
              return urlField.allowedDomains!.some(({ domain, exact }) =>
                exact ? url.hostname === domain : url.hostname.endsWith(domain)
              );
            } catch {
              return false;
            }
          },
          {
            message: `Domain must be ${formatter.format(
              urlField.allowedDomains.map(({ domain }) => `"${domain}"`)
            )}`,
          }
        );
      }
      if (allowNullish || urlField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.PhoneField: {
      const phoneField = block[WorkflowFormBlockType.PhoneField];
      let schema: zod.ZodSchema = zod.string().superRefine((val, ctx) => {
        try {
          if ((allowNullish || phoneField.optional) && !val) return zod.NEVER;

          let defaultCountry: undefined | CountryCode = undefined;

          if (typeof navigator !== "undefined") {
            defaultCountry = navigator.language.split("-")[1] as CountryCode;
          }

          const phoneNumber = parsePhoneNumber(val, {
            defaultCountry,
          });

          if (phoneField.allowedCountries) {
            const formatter = new Intl.ListFormat("en-AU", {
              style: "long",
              type: "disjunction",
            });
            if (
              (!phoneNumber.country && !defaultCountry) ||
              !phoneField.allowedCountries.includes(
                (phoneNumber.country ?? defaultCountry)!
              )
            ) {
              ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: `Phone number must be from ${formatter.format(
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
      if (allowNullish || phoneField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    default:
      return null;
  }
}

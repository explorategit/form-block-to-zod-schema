import {
  getCountryCallingCode,
  isSupportedCountry,
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

function getOptionalStringSchema(schema: zod.ZodSchema<string>) {
  return zod
    .union([zod.literal(""), schema])
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val));
}

/**
 * Get the zod schema for a block
 * @param block - The block to get the schema for
 * @param allowNullish - Whether to allow nullish values. If true, the schema will be optional regardless of the block's configuration. If false, the schema will be only be optional if the block is optional.
 * @returns
 */
export default function getBlockSchema(
  block: WorkflowFormBlock,
  allowNullish: boolean = false
): zod.ZodSchema | null {
  switch (block.type) {
    case WorkflowFormBlockType.FileField: {
      const fileField = block[WorkflowFormBlockType.FileField];
      let schema = zod.array(zod.any());
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
      let schema = zod.boolean();
      if (allowNullish || checkboxField.optional) {
        return schema.optional();
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
      let schema = zod.string().refine((value) => values.includes(value), {
        message: `Must be one of ${formatter.format(
          singleSelectField.options.map(({ label }) => `\`${label}\``)
        )}.`,
      });
      if (allowNullish || singleSelectField.optional) {
        return schema.nullish();
      }
      return schema;
    }
    case WorkflowFormBlockType.TextField: {
      const textField = block[WorkflowFormBlockType.TextField];
      let schema = zod.string();
      if (textField.pattern) {
        schema = schema.regex(
          new RegExp(textField.pattern.value),
          textField.pattern.message
        );
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
      let schema: zod.ZodSchema<string> = zod.string().email();
      if (emailField.allowedDomains) {
        const formatter = new Intl.ListFormat("en-AU", {
          style: "long",
          type: "disjunction",
        });
        schema = schema.refine(
          (value) => {
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
      if (allowNullish || emailField.optional) {
        return getOptionalStringSchema(schema);
      }
      return schema;
    }
    case WorkflowFormBlockType.UrlField: {
      const urlField = block[WorkflowFormBlockType.UrlField];
      let schema: zod.ZodSchema<string> = zod.string().url();
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
        return getOptionalStringSchema(schema);
      }
      return schema;
    }
    case WorkflowFormBlockType.PhoneField: {
      const phoneField = block[WorkflowFormBlockType.PhoneField];
      const schema = zod
        .string()
        .superRefine((val, ctx) => {
          try {
            let defaultCountry: undefined | string = undefined;

            if (typeof navigator !== "undefined") {
              defaultCountry = navigator.language.split("-")[1] as string;
            }

            if (
              defaultCountry !== undefined &&
              !isSupportedCountry(defaultCountry)
            ) {
              defaultCountry = undefined;
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
        })
        .transform((val) => {
          const phoneNumber = parsePhoneNumber(val);
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

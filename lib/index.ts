import {
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import zod from "zod";

type JSONPrimitive = string | number | boolean | null;

type JSONObject = { [Key in string]: JSONValue } & {
  [Key in string]?: JSONValue;
};

type JSONArray = JSONValue[];

type JSONValue = JSONPrimitive | JSONObject | JSONArray;

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

export type WorkflowFormFile = {
  type: string;
  name: string;
  key: string;
  size: number;
  uploadedAt: string;
};

export type TextNode = {
  content: string;
  url: string | null;
};

export type TextConfig = {
  nodes: TextNode[];
};

export type CheckboxFieldConfig = {
  label: string;
  description: string | null;
  optional: boolean;
};

export type SingleSelectFieldConfig = {
  options: {
    label: string;
    value: string;
  }[];
  label: string;
  description: string | null;
  optional: boolean;
};

export type TextFieldConfig = {
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

export type FileFieldConfig = {
  maxSize: number | null;
  allowedTypes: string[] | null;
  multiple: boolean;
  label: string;
  description: string | null;
  optional: boolean;
};

export type EmailFieldConfig = {
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

export type PhoneFieldConfig = {
  label: string;
  description: string | null;
  optional: boolean;
  allowedCountries: string[] | null;
};

export type UrlFieldConfig = {
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

export type WorkflowFormBlock = {
  key: string;
} & (
  | {
      type: WorkflowFormBlockType.CheckboxField;
      [WorkflowFormBlockType.CheckboxField]: CheckboxFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.SingleSelectField;
      [WorkflowFormBlockType.SingleSelectField]: SingleSelectFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.TextField;
      [WorkflowFormBlockType.TextField]: TextFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.FileField;
      [WorkflowFormBlockType.FileField]: FileFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.EmailField;
      [WorkflowFormBlockType.EmailField]: EmailFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.UrlField;
      [WorkflowFormBlockType.UrlField]: UrlFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.PhoneField;
      [WorkflowFormBlockType.PhoneField]: PhoneFieldConfig;
    }
  | {
      type: WorkflowFormBlockType.HeadingOne;
      [WorkflowFormBlockType.HeadingOne]: TextConfig;
    }
  | {
      type: WorkflowFormBlockType.HeadingTwo;
      [WorkflowFormBlockType.HeadingTwo]: TextConfig;
    }
  | {
      type: WorkflowFormBlockType.HeadingThree;
      [WorkflowFormBlockType.HeadingThree]: TextConfig;
    }
  | {
      type: WorkflowFormBlockType.Divider;
    }
  | {
      type: WorkflowFormBlockType.Paragraph;
      [WorkflowFormBlockType.Paragraph]: TextConfig;
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
): zod.ZodSchema<JSONValue | undefined> | null {
  switch (block.type) {
    case WorkflowFormBlockType.FileField: {
      const fileField = block[WorkflowFormBlockType.FileField];

      let typeSchema: zod.ZodSchema = zod.string();

      if (fileField.allowedTypes) {
        const formatter = new Intl.ListFormat("en-AU", {
          style: "long",
          type: "disjunction",
        });
        typeSchema = typeSchema.refine(
          (value) => fileField.allowedTypes!.includes(value),
          {
            message: `File must be of type ${formatter.format(
              fileField.allowedTypes.map((type) => `"${type}"`)
            )}`,
          }
        );
      }

      let sizeSchema = zod.number();

      if (fileField.maxSize !== null) {
        sizeSchema = sizeSchema.max(fileField.maxSize);
      }

      const remoteFileSchema = zod.intersection(
        zod.object({
          type: typeSchema,
          size: sizeSchema,
        }),
        zod.record(zod.string(), zod.union([zod.string(), zod.number()]))
      );

      let schema: zod.ZodArray<any> = zod.array(remoteFileSchema);

      if ("File" in globalThis) {
        const fileSchema = zod.instanceof(File).superRefine((value, ctx) => {
          (
            [
              [sizeSchema, "size"],
              [typeSchema, "type"],
            ] as const
          ).forEach(([schema, key]) => {
            schema.safeParse(value[key]).error?.issues.forEach((issue) => {
              ctx.addIssue(issue);
            });
          });
        });
        schema = zod.array(zod.union([fileSchema, remoteFileSchema]));
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
      let defaultCountry: undefined | string;

      if (typeof navigator !== "undefined") {
        defaultCountry = navigator.language.split("-")[1] as string;
      }

      if (defaultCountry !== undefined && !isSupportedCountry(defaultCountry)) {
        defaultCountry = undefined;
      }

      const schema = zod
        .string()
        .superRefine((val, ctx) => {
          try {
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
          const phoneNumber = parsePhoneNumber(val, {
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

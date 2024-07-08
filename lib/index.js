import { getCountryCallingCode, parsePhoneNumber } from "libphonenumber-js";
import zod from "zod";
import { WorkflowFormBlockType } from ".";

/**
 * Joins a list of strings with a separator.
 * @param {string[]} list The list of strings to join.
 * @param {"or" | "and"} booleanOperator The boolean operator to use.
 */
function joinList(list, booleanOperator = "or") {
  return `${list.slice(0, -1).join(", ")} ${booleanOperator} ${
    list.slice(-1)[0]
  }`;
}

/**
 * Get the default country code from the browser.
 * @returns {string | undefined}
 */
function getDefaultCountry() {
  if (typeof navigator === "undefined") return undefined;
  return navigator.language.split("-")[1];
}

/**
 * Builds a zod schema for a given block.
 * @param {import(".").WorkflowFormBlock} block The block to build the schema for.
 * @returns {zod.ZodSchema}
 */
export default function getBlockSchema(block) {
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
      let schema = zod.boolean();
      if (!checkboxField.optional) {
        schema = schema.refine((bool) => bool === true, {
          message: "This field is required",
        });
      }
      return schema;
    }
    case WorkflowFormBlockType.SingleSelectField: {
      const singleSelectField = block[WorkflowFormBlockType.SingleSelectField];
      let schema = zod.string();
      if (singleSelectField.optional) {
        schema = schema.optional();
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
      let schema = zod.string().email();
      if (emailField.allowedDomains) {
        schema = schema.refine(
          (email) => {
            if (!(typeof email === "string")) return false;
            const domain = email.split("@")[1];
            return emailField.allowedDomains.includes(domain);
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
      let schema = zod.string().url();
      if (urlField.optional) {
        schema = schema.optional();
      }
      return schema;
    }
    case WorkflowFormBlockType.PhoneField: {
      const phoneField = block[WorkflowFormBlockType.PhoneField];
      let schema = zod.string().superRefine((val, ctx) => {
        try {
          const defaultCountry = getDefaultCountry();
          const phoneNumber = parsePhoneNumber(val, {
            defaultCountry,
          });

          if (phoneField.allowedCountries) {
            if (
              (!phoneNumber.country && !defaultCountry) ||
              !phoneField.allowedCountries.includes(
                phoneNumber.country ?? defaultCountry
              )
            ) {
              ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: `Phone number must be from ${joinList(
                  phoneField.allowedCountries.map(
                    (countryCode) =>
                      `${countryCode} (+${getCountryCallingCode(countryCode)})`
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

import getBlockSchema, { WorkflowFormBlock, WorkflowFormBlockType } from ".";

describe("getBlockSchema", () => {
  describe(`When block is of type "CheckboxField"`, () => {
    it('should return the schema for a "CheckboxField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.CheckboxField,
        [WorkflowFormBlockType.CheckboxField]: {
          label: "I agree to the terms and conditions",
          optional: false,
          description: null,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(true)).not.toThrow();
      expect(() => schema!.parse(false)).not.toThrow();
      expect(() => schema!.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "CheckboxField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.CheckboxField,
        [WorkflowFormBlockType.CheckboxField]: {
          label: "I agree to the terms and conditions",
          optional: true,
          description: null,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(true)).not.toThrow();
      expect(() => schema!.parse(false)).not.toThrow();
      expect(() => schema!.parse(undefined)).not.toThrow();
    });
  });
  describe('When block is of type "SelectField"', () => {
    it('should return the schema for a "SelectField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.SelectField,
        [WorkflowFormBlockType.SelectField]: {
          label: "Select a color",
          optional: false,
          description: null,
          multiple: false,
          options: [
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Blue", value: "blue" },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(["red"])).not.toThrow();
      expect(() => schema!.parse(["green"])).not.toThrow();
      expect(() => schema!.parse(["blue"])).not.toThrow();
      expect(() => schema!.parse(["yellow"])).toThrow();
      expect(() => schema!.parse(undefined)).toThrow();
      expect(() => schema!.parse([])).toThrow();
    });
    it('should return an optional schema for a "SelectField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.SelectField,
        [WorkflowFormBlockType.SelectField]: {
          label: "Select a color",
          optional: true,
          description: null,
          multiple: false,
          options: [
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Blue", value: "blue" },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(["red"])).not.toThrow();
      expect(() => schema!.parse(["green"])).not.toThrow();
      expect(() => schema!.parse(["blue"])).not.toThrow();
      expect(() => schema!.parse(["yellow"])).toThrow();
      expect(() => schema!.parse(undefined)).not.toThrow();
      expect(() => schema!.parse([])).not.toThrow();
    });
    it('should return the schema for a "SelectField" with multiple options', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.SelectField,
        [WorkflowFormBlockType.SelectField]: {
          label: "Select a color",
          optional: false,
          description: null,
          multiple: true,
          options: [
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Blue", value: "blue" },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(["red", "green", "blue"])).not.toThrow();
    });
  });
  describe('When block is of type "TextField"', () => {
    it('should return the schema for a "TextField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.TextField,
        [WorkflowFormBlockType.TextField]: {
          label: "Enter your name",
          optional: false,
          description: null,
          minLength: 3,
          maxLength: 10,
          pattern: null,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("John")).not.toThrow();
      expect(() => schema?.parse("Jane")).not.toThrow();
      expect(() => schema?.parse("J")).toThrow();
      expect(() => schema?.parse("Jonathan Doe")).toThrow();
      expect(() => schema?.parse("")).toThrow();
    });
    it('should return an optional schema for a "TextField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.TextField,
        [WorkflowFormBlockType.TextField]: {
          label: "Enter your name",
          optional: true,
          description: null,
          minLength: null,
          maxLength: 10,
          pattern: null,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("John")).not.toThrow();
      expect(() => schema?.parse("Jane")).not.toThrow();
      expect(() => schema?.parse("J")).not.toThrow();
      expect(() => schema?.parse("Jonathan Doe")).toThrow();
      expect(() => schema?.parse("")).not.toThrow();
      expect(schema?.parse("")).toBe(undefined);
    });
  });
  describe('When block is of type "FileField"', () => {
    it('should return the schema for a "FileField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.FileField,
        [WorkflowFormBlockType.FileField]: {
          label: "Upload your resume",
          optional: false,
          description: null,
          maxSize: 1024,
          allowedTypes: ["application/pdf"],
          multiple: false,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() =>
        schema?.parse([
          {
            type: "application/pdf",
            size: 1023,
          },
        ])
      ).not.toThrow();
      expect(() =>
        schema?.parse([new File([""], "", { type: "application/pdf" })])
      ).not.toThrow();
      expect(() =>
        schema?.parse([
          {
            type: "application/pdf",
            size: 1025,
          },
        ])
      ).toThrow();
      expect(() =>
        schema?.parse([
          {
            type: "application/json",
            size: 1023,
          },
        ])
      ).toThrow();
      expect(() =>
        schema?.parse([
          new File(["x".repeat(1025)], "", { type: "application/pdf" }),
        ])
      ).toThrow();
      expect(() => schema?.parse([])).toThrow();
      expect(() => schema?.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "FileField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.FileField,
        [WorkflowFormBlockType.FileField]: {
          label: "Upload your resume",
          optional: true,
          description: null,
          maxSize: 1024,
          allowedTypes: ["application/pdf"],
          multiple: false,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() =>
        schema?.parse([
          {
            type: "application/pdf",
            size: 1023,
          },
        ])
      ).not.toThrow();
      expect(() =>
        schema?.parse([
          {
            type: "application/pdf",
            size: 1025,
          },
          {
            type: "application/msword",
            size: 1024,
          },
        ])
      ).toThrow();
      expect(() => schema?.parse([])).not.toThrow();
    });
  });
  describe('When block is of type "EmailField"', () => {
    it('should return the schema for an "EmailField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.EmailField,
        [WorkflowFormBlockType.EmailField]: {
          label: "Enter your email",
          optional: false,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("mark@explorate.co")).not.toThrow();
      expect(() => schema?.parse("mark@gmail.com")).toThrow();
      expect(() => schema?.parse(undefined)).toThrow();
    });
    it('should return an optional schema for an "EmailField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.EmailField,
        [WorkflowFormBlockType.EmailField]: {
          label: "Enter your email",
          optional: true,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("mark@explorate.co")).not.toThrow();
      expect(() => schema?.parse("mark@gmail.com")).toThrow();
      expect(() => schema?.parse(undefined)).not.toThrow();
      expect(schema?.parse("")).toBe(undefined);
    });
    it('should return the schema for an "EmailField" with multiple allowed domains', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.EmailField,
        [WorkflowFormBlockType.EmailField]: {
          label: "Enter your email",
          optional: false,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
            {
              domain: "gmail.com",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("mark@explorate.co")).not.toThrow();
      expect(() => schema?.parse("mark@gmail.com")).not.toThrow();
      expect(() => schema?.parse("mark@outlook.com")).toThrow();
    });
  });
  describe('When block is of type "UrlField"', () => {
    it('should return the schema for a "UrlField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.UrlField,
        [WorkflowFormBlockType.UrlField]: {
          label: "Enter your website",
          optional: false,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("https://explorate.co")).not.toThrow();
      expect(() => schema?.parse("https://subdomain.explorate.co")).toThrow();
      expect(() => schema?.parse("https://google.com")).toThrow();
      expect(() => schema?.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "UrlField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.UrlField,
        [WorkflowFormBlockType.UrlField]: {
          label: "Enter your website",
          optional: true,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("https://explorate.co")).not.toThrow();
      expect(() => schema?.parse("https://subdomain.explorate.co")).toThrow();
      expect(() => schema?.parse("https://google.com")).toThrow();
      expect(() => schema?.parse(undefined)).not.toThrow();
      expect(schema?.parse("")).toBe(undefined);
    });
    it('should return the schema for a "UrlField" with multiple allowed domains', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.UrlField,
        [WorkflowFormBlockType.UrlField]: {
          label: "Enter your website",
          optional: false,
          description: null,
          allowedDomains: [
            {
              domain: "explorate.co",
              exact: true,
            },
            {
              domain: "google.com",
              exact: true,
            },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("https://explorate.co")).not.toThrow();
      expect(() => schema?.parse("https://google.com")).not.toThrow();
      expect(() => schema?.parse("https://subdomain.explorate.co")).toThrow();
      expect(() => schema?.parse("https://subdomain.google.com")).toThrow();
    });
  });
  describe('When block is of type "PhoneField"', () => {
    it('should return the schema for a "PhoneField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.PhoneField,
        [WorkflowFormBlockType.PhoneField]: {
          label: "Enter your phone number",
          optional: false,
          description: null,
          allowedCountries: ["AU"],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("+61404001111")).not.toThrow();
      expect(() => schema?.parse("+442071838750")).toThrow();
      expect(() => schema?.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "PhoneField"', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.PhoneField,
        [WorkflowFormBlockType.PhoneField]: {
          label: "Enter your phone number",
          optional: true,
          description: null,
          allowedCountries: ["AU"],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("+61404001111")).not.toThrow();
      expect(() => schema?.parse("+442071838750")).toThrow();
      expect(() => schema?.parse(undefined)).not.toThrow();
      expect(schema?.parse("")).toBe(undefined);
    });
    it('should return the schema for a "PhoneField" with multiple allowed countries', () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: WorkflowFormBlockType.PhoneField,
        [WorkflowFormBlockType.PhoneField]: {
          label: "Enter your phone number",
          optional: false,
          description: null,
          allowedCountries: ["AU", "GB"],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema?.parse("+61404001111")).not.toThrow();
      expect(() => schema?.parse("+442071838750")).not.toThrow();
      expect(() => schema?.parse("+12025550123")).toThrow();
      expect(() => schema?.parse(undefined)).toThrow();
    });
  });
  describe("When block is of an unknown type", () => {
    it("should return null", () => {
      const block: WorkflowFormBlock = {
        key: "",
        type: "UnknownType" as never,
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeNull();
    });
  });
});

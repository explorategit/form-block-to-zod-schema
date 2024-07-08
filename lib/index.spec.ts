import getBlockSchema, { WorkflowFormBlock, WorkflowFormBlockType } from ".";

describe("getBlockSchema", () => {
  describe(`When block is of type "CheckboxField"`, () => {
    it('should return the schema for a "CheckboxField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.CheckboxField,
        value: false,
        [WorkflowFormBlockType.CheckboxField]: {
          label: "I agree to the terms and conditions",
          optional: false,
          description: null,
          required: true,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(true)).not.toThrow();
      expect(() => schema!.parse(false)).toThrow();
      expect(() => schema!.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "CheckboxField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.CheckboxField,
        value: false,
        [WorkflowFormBlockType.CheckboxField]: {
          label: "I agree to the terms and conditions",
          optional: true,
          description: null,
          required: true,
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse(true)).not.toThrow();
      expect(() => schema!.parse(false)).toThrow();
      expect(() => schema!.parse(undefined)).not.toThrow();
    });
  });
  describe('When block is of type "SingleSelectField"', () => {
    it('should return the schema for a "SingleSelectField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.SingleSelectField,
        value: null,
        [WorkflowFormBlockType.SingleSelectField]: {
          label: "Select a color",
          optional: false,
          description: null,
          options: [
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Blue", value: "blue" },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse("red")).not.toThrow();
      expect(() => schema!.parse("green")).not.toThrow();
      expect(() => schema!.parse("blue")).not.toThrow();
      expect(() => schema!.parse("yellow")).toThrow();
      expect(() => schema!.parse(undefined)).toThrow();
    });
    it('should return an optional schema for a "SingleSelectField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.SingleSelectField,
        value: null,
        [WorkflowFormBlockType.SingleSelectField]: {
          label: "Select a color",
          optional: true,
          description: null,
          options: [
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Blue", value: "blue" },
          ],
        },
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeDefined();
      expect(() => schema!.parse("red")).not.toThrow();
      expect(() => schema!.parse("green")).not.toThrow();
      expect(() => schema!.parse("blue")).not.toThrow();
      expect(() => schema!.parse("yellow")).toThrow();
      expect(() => schema!.parse(undefined)).not.toThrow();
    });
  });
  describe('When block is of type "TextField"', () => {
    it('should return the schema for a "TextField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.TextField,
        value: null,
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
        id: 0,
        type: WorkflowFormBlockType.TextField,
        value: null,
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
    });
  });
  describe('When block is of type "FileField"', () => {
    it('should return the schema for a "FileField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.FileField,
        value: [],
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
      expect(() => schema?.parse(["resume.pdf"])).not.toThrow();
      expect(() => schema?.parse(["resume.pdf", "resume.doc"])).toThrow();
      expect(() => schema?.parse([])).toThrow();
    });
    it('should return an optional schema for a "FileField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.FileField,
        value: null,
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
      expect(() => schema?.parse(["resume.pdf"])).not.toThrow();
      expect(() => schema?.parse(["resume.pdf", "resume.doc"])).toThrow();
      expect(() => schema?.parse([])).not.toThrow();
    });
  });
  describe('When block is of type "EmailField"', () => {
    it('should return the schema for an "EmailField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.EmailField,
        value: null,
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
        id: 0,
        type: WorkflowFormBlockType.EmailField,
        value: null,
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
      expect(() => schema?.parse("mark@explorate.co").not.toThrow());
      expect(() => schema?.parse("mark@gmail.com")).toThrow();
      expect(() => schema?.parse(undefined)).not.toThrow();
    });
  });
  describe('When block is of type "UrlField"', () => {
    it('should return the schema for a "UrlField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.UrlField,
        value: null,
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
        id: 0,
        type: WorkflowFormBlockType.UrlField,
        value: null,
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
    });
  });
  describe('When block is of type "PhoneField"', () => {
    it('should return the schema for a "PhoneField"', () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: WorkflowFormBlockType.PhoneField,
        value: null,
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
        id: 0,
        type: WorkflowFormBlockType.PhoneField,
        value: null,
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
    });
  });
  describe("When block is of an unknown type", () => {
    it("should return null", () => {
      const block: WorkflowFormBlock = {
        id: 0,
        type: "UnknownType" as never,
        value: null,
      };
      const schema = getBlockSchema(block);

      expect(schema).toBeNull();
    });
  });
});

import { z } from "zod";

const contextValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const ruleBaseSchema = z.object({
  attribute: z.string().trim().min(1),
});

export const equalsRuleSchema = ruleBaseSchema.extend({
  operator: z.literal("equals"),
  value: contextValueSchema,
});

export const inRuleSchema = ruleBaseSchema.extend({
  operator: z.literal("in"),
  values: z.array(contextValueSchema).min(1),
});

export const ruleSchema = z.discriminatedUnion("operator", [
  equalsRuleSchema,
  inRuleSchema,
]);

export const rolloutSchema = z
  .object({
    percentage: z.number().int().min(0).max(100),
    attribute: z.string().trim().min(1),
  })
  .strict();

export const flagKeySchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-zA-Z0-9._-]+$/);

export const createFlagSchema = z
  .object({
    key: flagKeySchema,
    enabled: z.boolean(),
    description: z.string().trim().min(1).optional(),
    rules: z.array(ruleSchema).default([]),
    rollout: rolloutSchema.optional(),
  })
  .strict();

export const updateFlagSchema = z
  .object({
    enabled: z.boolean().optional(),
    description: z.string().trim().min(1).optional(),
    rules: z.array(ruleSchema).optional(),
    rollout: rolloutSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const evaluationRequestSchema = z
  .object({
    context: z.record(z.string().trim().min(1), contextValueSchema).default({}),
  })
  .strict();

export type CreateFlagPayload = z.infer<typeof createFlagSchema>;
export type UpdateFlagPayload = z.infer<typeof updateFlagSchema>;
export type EvaluationRequestPayload = z.infer<typeof evaluationRequestSchema>;

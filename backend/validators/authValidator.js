const { z } = require("zod");

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  niche: z.string().optional(),
  tone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

module.exports = { signupSchema, loginSchema };

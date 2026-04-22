const { z } = require("zod");

const scheduleSchema = z.object({
  frequency: z.enum(["daily"]).default("daily"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time must be HH:mm")
});

module.exports = { scheduleSchema };

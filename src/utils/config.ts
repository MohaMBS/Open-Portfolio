// src/utils/config.ts
import { config as rawConfig } from '../../portfolio.config';
import { configSchema } from '../schemas/config';
import { fromZodError } from 'zod-validation-error';

// Validate config upon import
const parsed = configSchema.safeParse(rawConfig);

if (!parsed.success) {
  const validationError = fromZodError(parsed.error, {
    prefix: "❌ Critical Error in portfolio.config.ts",
  });
  console.error(validationError.toString());
  // Stop build if configuration is insecure or invalid
  throw new Error("Invalid configuration. Check logs.");
}

// Export VALIDATED and secure configuration
export const config = parsed.data;
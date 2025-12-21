// scripts/validate-cv.ts
import { cvSchema } from '../src/schemas/cv';
import cvData from '../src/content/cv/me.json'; // Direct import only for the script
import { z, type ZodIssue } from 'zod';

console.log("\n🚀 Starting CV Validation Protocol...\n");

try {
    // 1. Validate Structure
    cvSchema.parse(cvData);
    console.log("✅ STRUCTURAL INTEGRITY: 100%");

    // 2. Validate additional business rules (e.g., Languages)
    // Here you could import your config and validate what we did before
    // that languages in config exist in the JSON.

    console.log("\n✨ CV is clean and ready for deployment.\n");
    process.exit(0); // Success

} catch (error) {
    if (error instanceof z.ZodError) {
        console.error("❌ VALIDATION FAILED:");
        error.issues.forEach((err: ZodIssue) => {
            console.error(`   - [${err.path.join(' > ')}]: ${err.message}`);
        });
    } else {
        console.error("❌ UNKNOWN ERROR:", error);
    }
    process.exit(1); // Error (breaks CI)
}
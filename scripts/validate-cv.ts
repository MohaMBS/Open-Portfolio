import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { cvSchema } from '../src/schemas/cv';
import { config } from '../portfolio.config';

// --- 🎨 UTILS: STYLING (Zero Dependencies) ---
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bgRed: "\x1b[41m",
};

const symbols = {
    check: `${colors.green}✔${colors.reset}`,
    cross: `${colors.red}✖${colors.reset}`,
    arrow: `${colors.cyan}➜${colors.reset}`,
    line: `${colors.dim}────────────────────────────────────────${colors.reset}`,
};

const log = {
    header: (text: string) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${text.toUpperCase()}${colors.reset}\n${symbols.line}`),
    success: (text: string) => console.log(` ${symbols.check} ${colors.green}${text}${colors.reset}`),
    error: (text: string) => console.log(` ${symbols.cross} ${colors.red}${text}${colors.reset}`),
    info: (text: string) => console.log(` ${colors.dim}•${colors.reset} ${text}`),
    sub: (text: string) => console.log(`    ${text}`),
};

// --- 🧠 CORE: LOGIC CHECKS ---
function validateDates(cv: any) {
    const issues: string[] = [];

    const checkPeriods = (items: any[], section: string) => {
        if (!items || !Array.isArray(items)) return;
        items.forEach((item, index) => {
            if (item.startDate && item.endDate) {
                const start = new Date(item.startDate);
                const end = new Date(item.endDate);
                if (end < start) {
                    issues.push(`[${section} > index ${index}]: End date (${item.endDate}) cannot be before start date (${item.startDate})`);
                }
            }
        });
    };

    checkPeriods(cv.work, 'Work');
    checkPeriods(cv.education, 'Education');

    return issues;
}

// --- 🚀 MAIN EXECUTION ---
async function runValidation() {
    const fileName = config.data.cvFile || 'demo';
    const filePath = join(process.cwd(), 'src/content/cv', `${fileName}.json`);

    log.header(`Open Portfolio • Integrity Check`);
    log.info(`Loading Config: ${colors.cyan}portfolio.config.ts${colors.reset}`);
    log.info(`Target CV File: ${colors.yellow}${fileName}.json${colors.reset}`);

    // 1. File Existence Check
    if (!existsSync(filePath)) {
        console.log(`\n${colors.bgRed} CRITICAL ERROR ${colors.reset}`);
        log.error(`File not found at: ${filePath}`);
        process.exit(1);
    }

    try {
        const rawData = readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        // 2. Schema Validation (Zod)
        console.log(`\n${colors.bright}Phase 1: Structural Validation${colors.reset}`);
        const parsedData = cvSchema.parse(jsonData);
        log.success("Schema structure is valid (Zod)");

        // 3. Business Logic Validation
        console.log(`\n${colors.bright}Phase 2: Logic & Consistency${colors.reset}`);
        const logicErrors = validateDates(parsedData);

        if (logicErrors.length > 0) {
            log.error("Found logical inconsistencies:");
            logicErrors.forEach(err => log.sub(`${colors.yellow}⚠${colors.reset} ${err}`));
            process.exit(1);
        }
        log.success("Date logic (Start vs End) is valid");

        // 4. Summary
        console.log(`\n${symbols.line}`);
        console.log(`${colors.green}${colors.bright}✨ VALIDATION SUCCESSFUL${colors.reset}`);
        console.log(`${colors.dim}   Ready for build. Good luck!${colors.reset}\n`);
        process.exit(0);

    } catch (error) {
        console.log(`\n${symbols.line}`);
        console.log(`${colors.bgRed} ${colors.bright} VALIDATION FAILED ${colors.reset}`);

        if (error instanceof z.ZodError) {
            console.log(`\n${colors.red}Found ${error.issues.length} structural issues:${colors.reset}\n`);

            // 👇 AQUÍ ESTÁ EL CAMBIO: Quitamos el tipo explícito ': ZodIssue'
            // TypeScript infiere automáticamente que 'err' es un issue de Zod.
            error.issues.forEach((err) => {
                const path = err.path.join(` ${colors.dim}>${colors.reset} `);
                console.log(` ${colors.red}✖${colors.reset} ${colors.bright}${path}${colors.reset}`);
                console.log(`   ${colors.dim}Error:${colors.reset} ${err.message}`);

                // @ts-ignore - 'received' existe en ciertos tipos de error de Zod
                if (err.received) console.log(`   ${colors.dim}Received:${colors.reset} ${err.received}`);
                console.log('');
            });
        } else if (error instanceof SyntaxError) {
            log.error("Invalid JSON syntax. Please check for missing commas or brackets.");
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

runValidation();
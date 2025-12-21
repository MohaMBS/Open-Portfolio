import prompts from 'prompts';
import ora from 'ora';
import chalk from 'chalk';
import tiged from 'tiged';
import fs from 'node:fs';
import path from 'node:path';

// 1. THEME REGISTRY (Mockup)
// In the future, this could come from a remote URL (fetch('https://api.open-portfolio.com/themes'))
const THEME_REGISTRY = {
    'minimal': {
        description: 'A clean and typographic design. Perfect for backend devs.',
        repo: 'your-user/open-portfolio-themes/minimal', // <--- CHANGE THIS to your real repo
        // If themes are in the SAME main repo in a subfolder, use:
        // repo: 'your-user/open-portfolio/src/themes/minimal' 
    },
    'black-mesa': {
        description: 'Scientific/military style inspired by Half-Life.',
        repo: 'your-user/open-portfolio/src/themes/black-mesa'
    },
    'cyberpunk': {
        description: 'Neon, Glitch and high contrast. (Coming Soon)',
        repo: 'your-user/open-portfolio/src/themes/cyberpunk'
    }
};

async function main() {
    console.log(chalk.bold.blue('\n🎨 Open Portfolio Theme Manager\n'));

    // 2. ACTION SELECTION
    const { action } = await prompts({
        type: 'select',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            { title: 'Install a new theme', value: 'install' },
            { title: 'List installed themes', value: 'list' },
            { title: 'Exit', value: 'exit' }
        ]
    });

    if (action === 'exit' || !action) process.exit(0);

    if (action === 'list') {
        const themesDir = path.join(process.cwd(), 'src/themes');
        if (!fs.existsSync(themesDir)) {
            console.log(chalk.yellow('No themes folder created.'));
            return;
        }
        const installed = fs.readdirSync(themesDir).filter(f => fs.statSync(path.join(themesDir, f)).isDirectory());
        console.log(chalk.green('\nLocally installed themes:'));
        installed.forEach(t => console.log(` - ${chalk.bold(t)}`));
        return;
    }

    // 3. INSTALLATION LOGIC
    if (action === 'install') {
        // Select theme from registry
        const { themeName } = await prompts({
            type: 'select',
            name: 'themeName',
            message: 'Select a theme to download:',
            choices: Object.entries(THEME_REGISTRY).map(([key, info]) => ({
                title: key,
                description: info.description,
                value: key
            }))
        });

        if (!themeName) process.exit(0);

        const targetDir = path.join(process.cwd(), 'src/themes', themeName);

        // Check if already exists
        if (fs.existsSync(targetDir)) {
            const { overwrite } = await prompts({
                type: 'confirm',
                name: 'overwrite',
                message: `Theme '${themeName}' already exists. Overwrite? (Local changes will be lost)`,
                initial: false
            });

            if (!overwrite) {
                console.log(chalk.yellow('Operation cancelled.'));
                process.exit(0);
            }
        }

        // Download with Tiged
        const spinner = ora(`Downloading ${themeName}...`).start();
        const repoUrl = THEME_REGISTRY[themeName as keyof typeof THEME_REGISTRY].repo;

        try {
            const emitter = tiged(repoUrl, {
                disableCache: true,
                force: true,
                verbose: false,
            });

            await emitter.clone(targetDir);

            spinner.succeed(chalk.green(`Theme '${themeName}' installed successfully at src/themes/${themeName}`));

            console.log(chalk.dim('\nNext steps:'));
            console.log(`1. Go to ${chalk.cyan('portfolio.config.ts')}`);
            console.log(`2. Change theme.name to: "${chalk.bold(themeName)}"`);
            console.log(`3. Run ${chalk.cyan('bun dev')}\n`);

        } catch (error) {
            spinner.fail(chalk.red('Error downloading theme.'));
            console.error(chalk.red((error as Error).message));
            console.log(chalk.yellow('Make sure the repository exists and is public.'));
        }
    }
}

main().catch(console.error);
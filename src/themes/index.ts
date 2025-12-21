const components = import.meta.glob('./*/index.astro', { eager: true });
const manifests = import.meta.glob('./*/manifest.ts', { eager: true });

export const themes: Record<string, any> = {};

Object.keys(components).forEach((path) => {
    const folderName = path.split('/')[1];
    const componentModule = components[path] as any;
    const manifestPath = `./${folderName}/manifest.ts`;
    const manifestModule = manifests[manifestPath] as any;

    themes[folderName] = {
        component: componentModule.default,
        manifest: manifestModule?.manifest || {
            name: folderName,
            fonts: {
                googleFontsUrl: null,
                body: 'sans-serif',
                heading: 'sans-serif',
                mono: 'monospace'
            }
        }
    };
});
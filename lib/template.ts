import fs from 'fs/promises';
import path from 'path';
import Mustache from 'mustache';

export async function renderTemplate(
    templateType: 'resume' | 'cover-letter', 
    templateName: string, 
    data: any,
    fontConfig?: { family: string; importUrl: string }
): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', templateType, `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Merge font config into data so templates can access {{fontFamily}} and {{fontImportUrl}}
    const renderData = {
        ...data,
        fontFamily: fontConfig?.family || "'IBM Plex Mono', monospace",
        fontImportUrl: fontConfig?.importUrl || "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Playfair+Display:wght@900&display=swap"
    };

    return Mustache.render(templateContent, renderData);
}

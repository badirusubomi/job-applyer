import fs from 'fs/promises';
import path from 'path';
import Mustache from 'mustache';

export async function renderTemplate(templateType: 'resume' | 'cover-letter', templateName: string, data: any): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', templateType, `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    return Mustache.render(templateContent, data);
}

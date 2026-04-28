const fs = require('fs');

// Fix profile editor contrast
const profileEditorPath = 'app/profile-editor/page.tsx';
let editorHtml = fs.readFileSync(profileEditorPath, 'utf8');

// Replace standard input/textarea classes with high-contrast versions
editorHtml = editorHtml.replace(/className="(.*?border-2 border-black.*?)"/g, (match, p1) => {
    if (!p1.includes('bg-white')) {
        return `className="${p1} bg-white text-black placeholder:text-black/40"`;
    }
    return match;
});
fs.writeFileSync(profileEditorPath, editorHtml);

// Fix font inheritance in resume template
const resumeTemplatePath = 'templates/resume/modern.html';
let resumeHtml = fs.readFileSync(resumeTemplatePath, 'utf8');

if (!resumeHtml.includes('font-family: inherit;')) {
    resumeHtml = resumeHtml.replace('.skill-tag {', '.skill-tag {\n            font-family: inherit;');
    resumeHtml = resumeHtml.replace('.skills-list {', '.skills-list {\n            font-family: inherit;');
}
fs.writeFileSync(resumeTemplatePath, resumeHtml);

console.log('Fixed profile editor contrast and resume font inheritance.');

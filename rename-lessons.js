import fs from 'fs';
import path from 'path';

const contentDir = './content/lessons/axi';

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
const replacements = {}; // oldId -> newId

// Identify files to rename
files.forEach(file => {
    const match = file.match(/^(\d{2})_(.*)\.md$/);
    if (match) {
        let num = parseInt(match[1], 10);
        if (num >= 31) {
            let newNum = num - 1;
            let newPrefix = newNum.toString().padStart(2, '0');
            let newName = `${newPrefix}_${match[2]}.md`;
            let oldId = file.replace('.md', '');
            let newId = newName.replace('.md', '');
            replacements[oldId] = newId;
            
            // Rename file
            fs.renameSync(path.join(contentDir, file), path.join(contentDir, newName));
            
            // Update its frontmatter (id, order)
            let content = fs.readFileSync(path.join(contentDir, newName), 'utf-8');
            content = content.replace(`id: "${oldId}"`, `id: "${newId}"`);
            content = content.replace(`order: ${num}`, `order: ${newNum}`);
            fs.writeFileSync(path.join(contentDir, newName), content);
            console.log(`Renamed ${file} to ${newName}`);
        }
    }
});

console.log("Renamed files and updated their IDs/order.");

// Update references in all files (axi, ahb, foundations)
const allDirs = ['./content/lessons/axi', './content/lessons/ahb', './content/lessons/foundations'];

allDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    allFiles.forEach(file => {
        let filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        
        Object.keys(replacements).forEach(oldId => {
            const newId = replacements[oldId];
            const regex = new RegExp(`"${oldId}"`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `"${newId}"`);
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated references in ${file}`);
        }
    });
});

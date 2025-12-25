/**
 * Inline Style Extractor & Consolidator v2
 *
 * This script:
 * 1. Reads your HTML file
 * 2. Finds all inline style="" attributes
 * 3. Creates CSS classes for unique styles
 * 4. Replaces inline styles with class names (merging with existing classes)
 * 5. Outputs a clean HTML and consolidated CSS
 */

const fs = require('fs');
const crypto = require('crypto');

// Configuration
const INPUT_FILE = 'about.html';
const OUTPUT_HTML = 'about-clean.html';
const OUTPUT_CSS = 'about-extracted.css';

// Read the HTML file
console.log(`Reading ${INPUT_FILE}...`);
let html = fs.readFileSync(INPUT_FILE, 'utf8');

// Track unique styles and their class names
const styleMap = new Map(); // normalized style -> class name

// Function to generate a short hash for class name
function generateClassName(style) {
    const hash = crypto.createHash('md5').update(style).digest('hex').substring(0, 6);
    return `ex-${hash}`;
}

// Function to normalize CSS (remove extra whitespace, sort properties)
function normalizeStyle(style) {
    return style
        .replace(/\s+/g, ' ')  // collapse whitespace
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .sort()
        .join('; ') + ';';
}

// First pass: collect all unique styles
console.log('Analyzing inline styles...');

// Match style attributes (handles multiline)
const styleAttrRegex = /style\s*=\s*"((?:[^"\\]|\\.)*)"/gi;

let match;
const uniqueStyles = new Set();

while ((match = styleAttrRegex.exec(html)) !== null) {
    const styleContent = match[1].trim();
    if (styleContent) {
        const normalized = normalizeStyle(styleContent);
        uniqueStyles.add(normalized);
        if (!styleMap.has(normalized)) {
            styleMap.set(normalized, generateClassName(normalized));
        }
    }
}

console.log(`Found ${uniqueStyles.size} unique style patterns`);

// Generate CSS file content
let cssContent = `/* =============================================
   EXTRACTED INLINE STYLES
   Generated on: ${new Date().toISOString()}
   Total unique patterns: ${styleMap.size}
   ============================================= */

`;

// Group similar styles for better organization
const cssGroups = {
    layout: [],
    spacing: [],
    typography: [],
    visual: [],
    other: []
};

for (const [style, className] of styleMap) {
    const lowerStyle = style.toLowerCase();

    let group = 'other';
    if (lowerStyle.includes('display') || lowerStyle.includes('flex') ||
        lowerStyle.includes('grid') || lowerStyle.includes('position') ||
        lowerStyle.includes('align') || lowerStyle.includes('justify')) {
        group = 'layout';
    } else if (lowerStyle.includes('margin') || lowerStyle.includes('padding') ||
               lowerStyle.includes('gap') || lowerStyle.includes('width') ||
               lowerStyle.includes('height')) {
        group = 'spacing';
    } else if (lowerStyle.includes('font') || lowerStyle.includes('text') ||
               lowerStyle.match(/color\s*:/) || lowerStyle.includes('line-height') ||
               lowerStyle.includes('letter-spacing')) {
        group = 'typography';
    } else if (lowerStyle.includes('background') || lowerStyle.includes('border') ||
               lowerStyle.includes('shadow') || lowerStyle.includes('opacity') ||
               lowerStyle.includes('transform') || lowerStyle.includes('animation')) {
        group = 'visual';
    }

    cssGroups[group].push({ className, style });
}

// Write CSS grouped
for (const [groupName, styles] of Object.entries(cssGroups)) {
    if (styles.length > 0) {
        cssContent += `/* --- ${groupName.toUpperCase()} STYLES (${styles.length}) --- */\n`;
        for (const { className, style } of styles) {
            const properties = style.split(';').filter(s => s.trim());
            if (properties.length === 1) {
                cssContent += `.${className} { ${style} }\n`;
            } else {
                cssContent += `.${className} {\n`;
                for (const prop of properties) {
                    if (prop.trim()) {
                        cssContent += `    ${prop.trim()};\n`;
                    }
                }
                cssContent += `}\n`;
            }
        }
        cssContent += '\n';
    }
}

// Second pass: replace inline styles with classes
console.log('Replacing inline styles with classes...');

let replacements = 0;

// Process the HTML by finding each tag with style attribute
const newHtml = html.replace(/<([a-zA-Z][a-zA-Z0-9]*)\s+([^>]*?)style\s*=\s*"((?:[^"\\]|\\.)*)"\s*([^>]*)>/gi,
    (fullMatch, tagName, beforeStyle, styleContent, afterStyle) => {
        if (!styleContent.trim()) {
            return fullMatch; // Empty style, skip
        }

        const normalized = normalizeStyle(styleContent);
        const newClassName = styleMap.get(normalized);

        if (!newClassName) {
            return fullMatch; // No mapping found
        }

        replacements++;

        // Combine beforeStyle and afterStyle
        let attributes = (beforeStyle + ' ' + afterStyle).trim();

        // Check if there's already a class attribute
        const classMatch = attributes.match(/class\s*=\s*"([^"]*)"/i);

        if (classMatch) {
            // Append to existing class
            const existingClasses = classMatch[1];
            attributes = attributes.replace(
                /class\s*=\s*"([^"]*)"/i,
                `class="${existingClasses} ${newClassName}"`
            );
        } else {
            // Add new class attribute
            attributes = `class="${newClassName}" ${attributes}`;
        }

        // Clean up extra spaces
        attributes = attributes.replace(/\s+/g, ' ').trim();

        return `<${tagName} ${attributes}>`;
    }
);

// Write output files
console.log(`Writing ${OUTPUT_CSS}...`);
fs.writeFileSync(OUTPUT_CSS, cssContent, 'utf8');

console.log(`Writing ${OUTPUT_HTML}...`);
fs.writeFileSync(OUTPUT_HTML, newHtml, 'utf8');

// Verify no duplicate class attributes
const duplicateClassCheck = newHtml.match(/class\s*=\s*"[^"]*"\s*class\s*=\s*"/gi);
if (duplicateClassCheck) {
    console.log(`\n⚠️  Warning: Found ${duplicateClassCheck.length} potential duplicate class attributes`);
}

// Count remaining inline styles
const remainingStyles = (newHtml.match(/style\s*=\s*"/gi) || []).length;

// Summary
console.log('\n========== SUMMARY ==========');
console.log(`Input file: ${INPUT_FILE}`);
console.log(`Unique style patterns: ${styleMap.size}`);
console.log(`Replacements made: ${replacements}`);
console.log(`Remaining inline styles: ${remainingStyles}`);
console.log(`\nOutput files created:`);
console.log(`  - ${OUTPUT_CSS} (${(cssContent.length / 1024).toFixed(1)} KB)`);
console.log(`  - ${OUTPUT_HTML}`);
console.log('\n📋 Next steps:');
console.log('1. Review about-extracted.css for the generated classes');
console.log('2. Review about-clean.html to verify the replacements');
console.log('3. Add: <link rel="stylesheet" href="about-extracted.css">');
console.log('4. Test the page thoroughly');
console.log('5. If satisfied, backup about.html and rename about-clean.html');

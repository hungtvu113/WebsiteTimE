#!/usr/bin/env node

/**
 * Script to automatically fix common ESLint issues
 * Run with: node fix-eslint.js
 */

const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/modules/ai/ai.service.ts',
  'src/modules/ai/ai.controller.ts',
  'src/common/decorators/get-user.decorator.ts',
  'src/app.module.ts'
];

// Common fixes
const fixes = [
  {
    // Fix unused imports
    pattern: /import.*ChatMessageDto.*from/g,
    replacement: (match, file) => {
      if (file.includes('ai.service.ts')) {
        return match.replace(', ChatMessageDto', '');
      }
      return match;
    }
  },
  {
    // Fix unused Param import
    pattern: /import.*Param.*from/g,
    replacement: (match, file) => {
      if (file.includes('ai.controller.ts')) {
        return match.replace(', Param', '').replace(',  }', ' }');
      }
      return match;
    }
  }
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Apply fixes
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, (match) => {
      const replacement = fix.replacement(match, filePath);
      if (replacement !== match) {
        modified = true;
        console.log(`🔧 Fixed in ${filePath}: ${match} -> ${replacement}`);
      }
      return replacement;
    });
    content = newContent;
  });

  // Write back if modified
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`✓ No changes needed: ${filePath}`);
  }
}

// Main execution
console.log('🔧 Starting ESLint fixes...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ ESLint fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: pnpm lint');
console.log('2. Check for remaining issues');
console.log('3. Commit changes if all looks good');

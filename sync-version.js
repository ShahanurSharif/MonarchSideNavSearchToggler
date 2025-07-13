const fs = require('fs');
const path = require('path');

// Version to sync across all files
const VERSION = '2.1.3';

// Files to update with their version patterns
const filesToUpdate = [
  {
    path: 'package.json',
    patterns: [
      { regex: /"version":\s*"[^"]*"/, replacement: `"version": "${VERSION}"` }
    ]
  },
  {
    path: 'config/package-solution.json',
    patterns: [
      { regex: /"version":\s*"[^"]*"/, replacement: `"version": "${VERSION}"` }
    ]
  },
  {
    path: 'src/extensions/monarchSidenavSearchToggler/MonarchSidenavSearchTogglerApplicationCustomizer.manifest.json',
    patterns: [
      { regex: /"version":\s*"[^"]*"/, replacement: `"version": "${VERSION}"` }
    ]
  }
];

function updateFile(filePath, patterns) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log(`🔄 Syncing version to ${VERSION}...\n`);
  
  let updatedCount = 0;
  
  filesToUpdate.forEach(file => {
    if (updateFile(file.path, file.patterns)) {
      updatedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Version: ${VERSION}`);
  console.log(`   Files updated: ${updatedCount}/${filesToUpdate.length}`);
  
  if (updatedCount === filesToUpdate.length) {
    console.log(`\n✅ Version sync completed successfully!`);
  } else {
    console.log(`\n⚠️  Some files could not be updated. Please check the output above.`);
  }
}

// Run the script
main(); 
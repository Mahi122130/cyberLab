const fs = require('fs');

function fix(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = dir + '/' + file.name;
    if (file.isDirectory()) {
      fix(fullPath);
    } else if (file.name === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix early returns that still have <main
      content = content.replace(/<main /g, '<div ');
      content = content.replace(/<\/main>/g, '</div>');
      
      // Replace <> with <div> and </> with </div>
      // But only if they are literally <> or </>
      content = content.replace(/<>/g, '<div className="w-full h-full">');
      content = content.replace(/<\/>/g, '</div>');
      
      fs.writeFileSync(fullPath, content);
      console.log("Fixed", fullPath);
    }
  }
}
fix('app/(app)');

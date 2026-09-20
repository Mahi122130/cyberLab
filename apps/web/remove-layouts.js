const fs = require('fs');
const path = require('path');

function stripLayout(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find <main ...> and replace it and everything until <section or <div className="mx-auto... with just <>
  // Because each page varies slightly, it's safer to use regex that handles:
  // <main ...> ... <section ...>  -> <> <section ...>
  // <main ...> ... </aside> ... <section ...> -> <> <section ...>
  
  // This regex finds `<main...` up to `<section...` (which we capture)
  // Or it finds `<main...` up to `</aside>` and captures `<section...` after it.
  
  // Since JS regex doesn't have great dotall multiline sometimes, let's just do a string replacement.
  const mainStart = content.indexOf('<main className="min-h-screen');
  if (mainStart === -1) {
     const mainStart2 = content.indexOf('<main className="relative min-h-screen');
     if (mainStart2 === -1) return;
  }
  
  // Actually, let's just find the first <section> or <div className="mx-auto flex max-w-[1600px]">
  let sectionIndex = content.indexOf('<section');
  if (sectionIndex === -1) {
    // some pages might just use a div
    sectionIndex = content.indexOf('<div className="mx-auto flex max-w-[1600px]">');
    if (sectionIndex !== -1) {
        // we might need to skip past the sidebar inside this div
        const asideEnd = content.indexOf('</aside>', sectionIndex);
        if (asideEnd !== -1) {
            sectionIndex = content.indexOf('<section', asideEnd);
        }
    }
  }
  
  const returnIndex = content.lastIndexOf('return (', sectionIndex);
  
  if (returnIndex !== -1 && sectionIndex !== -1) {
    // replace from return ( ... up to <section with return ( <> <section
    const toReplace = content.substring(returnIndex + 8, sectionIndex);
    content = content.replace(toReplace, '\n    <>\n      ');
    
    // Now replace the end.
    // Usually it's </section></div></main> or </section></main>
    content = content.replace(/<\/section>[\s\n]*<\/div>[\s\n]*<\/main>/g, '</section>\n    </>');
    content = content.replace(/<\/section>[\s\n]*<\/main>/g, '</section>\n    </>');
    content = content.replace(/<\/div>[\s\n]*<\/main>/g, '</div>\n    </>');
    content = content.replace(/<\/main>/g, '</>');
    
    fs.writeFileSync(filePath, content);
    console.log("Stripped layout from", filePath);
  }
}

stripLayout('app/(app)/progress/page.tsx');
stripLayout('app/(app)/leaderboard/page.tsx');
stripLayout('app/(app)/profile/page.tsx');
stripLayout('app/(app)/settings/page.tsx');
stripLayout('app/(app)/labs/page.tsx');

// Some pages like labs/[id]/page.tsx might also have it
stripLayout('app/(app)/labs/[id]/page.tsx');
stripLayout('app/(app)/labs/[id]/challenge/page.tsx');
stripLayout('app/(app)/labs/[id]/challenge/[challengeId]/page.tsx');

console.log("Done.");

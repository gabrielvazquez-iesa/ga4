const fs = require('fs');
const path = require('path');

const dirs = [
  'c:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components',
  'c:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages'
];

const patterns = [
  // Backgrounds
  { regex: /bg-slate-950\/50/g, repl: 'bg-slate-50 dark:bg-slate-950/50' },
  { regex: /bg-slate-950/g, repl: 'bg-white dark:bg-slate-950' },
  { regex: /bg-slate-900\/50/g, repl: 'bg-white/80 dark:bg-slate-900/50' },
  { regex: /bg-slate-900\/80/g, repl: 'bg-white/95 dark:bg-slate-900/80' },
  // Wait, I should avoid matching bg-slate-950/50 again. So run most specific first.
  { regex: /bg-slate-900\b/g, repl: 'bg-white dark:bg-slate-900' },
  { regex: /bg-\[\#0a0f1c\]/g, repl: 'bg-slate-50 dark:bg-[#0a0f1c]' },
  
  // Borders
  { regex: /border-white\/10/g, repl: 'border-slate-200 dark:border-white/10' },
  { regex: /border-white\/5/g, repl: 'border-slate-200 dark:border-white/5' },
  { regex: /border-slate-700/g, repl: 'border-slate-300 dark:border-slate-700' },

  // Text Colors
  { regex: /text-white/g, repl: 'text-slate-900 dark:text-white' },
  { regex: /text-slate-300/g, repl: 'text-slate-600 dark:text-slate-300' },
  { regex: /text-slate-400/g, repl: 'text-slate-500 dark:text-slate-400' },
  
  // Hovers
  { regex: /hover:bg-white\/5/g, repl: 'hover:bg-slate-100 dark:hover:bg-white/5' },
  { regex: /hover:bg-white\/10/g, repl: 'hover:bg-slate-200 dark:hover:bg-white/10' },
  { regex: /hover:text-white/g, repl: 'hover:text-slate-900 dark:hover:text-white' },
  
  // Divider
  { regex: /divide-white\/5/g, repl: 'divide-slate-200 dark:divide-white/5' }
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.astro') || f.endsWith('.ts'));
  
  files.forEach(f => {
    // Skip ThemeToggle to avoid messing it up
    if (f === 'ThemeToggle.tsx') return;
    
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // Only apply if the file does not have 'dark:' extensively already
    // but some do, like ThemeToggle and Topbar. Topbar has dark: so skip it to be safe.
    if (f === 'Topbar.tsx' || f === 'DashboardLayout.astro') return;
    
    patterns.forEach(pat => {
      content = content.replace(pat.regex, (match) => {
        // If it's already dark prefixed, leave it
        return pat.repl;
      });
    });
    
    // Safety generic fix: 'dark:text-slate-900 dark:text-white' -> 'text-slate-900 dark:text-white'
    content = content.replace(/bg-white dark:bg-white/g, 'bg-white');
    content = content.replace(/dark:text-slate-\d+ dark:(text-\w+(-\d+)?)/g, 'dark:$1');
    content = content.replace(/dark:bg-slate-\d+ dark:(bg-\w+(-\d+)?)/g, 'dark:$1');
    
    fs.writeFileSync(p, content);
  });
});

console.log('Theme injected successfully.');

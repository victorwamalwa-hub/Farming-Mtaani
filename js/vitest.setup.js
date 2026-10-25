import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, 'index.html'), 'utf8');

// Minimal extraction of <body> so jsdom has your actual markup
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  document.body.innerHTML = bodyMatch[1];
}
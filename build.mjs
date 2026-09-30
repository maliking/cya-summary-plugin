import {readFileSync, writeFileSync} from 'node:fs';

const source = readFileSync(new URL('./plugin-source.html', import.meta.url), 'utf8');
const styles = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const plugin = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!styles || !plugin) throw new Error('Expected one style and one script in plugin-source.html');

const output = `/* Creative Youth Awards Summary Block plugin. Generated from plugin-source.html. */
(function () {
  if (typeof document === 'undefined' || document.getElementById('cya-summary-plugin-styles')) return;
  const style = document.createElement('style');
  style.id = 'cya-summary-plugin-styles';
  style.textContent = ${JSON.stringify(styles)};
  document.head.append(style);
})();
${plugin}
`;

writeFileSync(new URL('./cya-summary-plugin.js', import.meta.url), output);
console.log('Built cya-summary-plugin.js');

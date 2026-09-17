import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const output = new URL('../.email-preview/', import.meta.url)
const bundle = await build({
  entryPoints: [
    fileURLToPath(new URL('./email-preview/render.ts', import.meta.url)),
  ],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { previews } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)
await mkdir(output, { recursive: true })
await Promise.all(
  previews.flatMap((preview) => [
    writeFile(new URL(`${preview.id}.html`, output), preview.html),
    writeFile(new URL(`${preview.id}.txt`, output), preview.text),
  ]),
)
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )
const first = previews[0]
const metadata = previews.map(({ id, label, subject, text }) => ({
  id,
  label,
  subject,
  text,
}))
await writeFile(
  new URL('index.html', output),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Paddock Pilot — Email previews</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#e7e8d8;color:#263f30;font:15px/1.6 Arial,Helvetica,sans-serif}a{color:inherit;text-underline-offset:4px}button,select{font:inherit;color:inherit}button,a{touch-action:manipulation}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid #aa563e;outline-offset:4px}::selection{background:#d8be96;color:#263f30}
header{padding:24px 32px;border-bottom:1px solid #c8caba;background:#f7f1e5}h1{font:normal 30px/1.2 Georgia,serif;margin:0 0 8px}header p{margin:0;color:#4e5547}main{display:grid;grid-template-columns:260px minmax(0,1fr);max-width:1440px;margin:auto}nav{padding:24px 20px}nav a{display:block;padding:9px 12px;margin-bottom:4px;text-decoration:none;border-radius:4px}nav a[aria-current=true]{background:#263f30;color:#f7f1e5}nav a:hover{ text-decoration:underline }section{min-width:0;padding:24px 32px;border-left:1px solid #c8caba}.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px}button{cursor:pointer;min-height:44px;padding:8px 16px;border:1px solid #263f30;border-radius:4px;background:transparent}button[aria-pressed=true]{background:#263f30;color:#f7f1e5}.downloads{display:flex;gap:16px;margin-left:auto}.subject{margin:0 0 20px;font-size:16px;overflow-wrap:anywhere}.canvas{margin:0 auto;width:100%;max-width:680px}.canvas.mobile{max-width:375px}iframe{display:block;width:100%;height:920px;border:1px solid #c8caba;background:#f7f1e5}details{margin:24px auto 0;max-width:680px}summary{cursor:pointer;padding:10px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 Arial,Helvetica,sans-serif;background:#f7f1e5;padding:24px;margin:8px 0}footer{padding:24px 32px;color:#4e5547;font-size:13px;border-top:1px solid #c8caba}@media(max-width:760px){header{padding:24px}main{display:block}nav{display:flex;overflow-x:auto;padding:16px;gap:8px}nav a{white-space:nowrap;margin:0}section{padding:20px 16px;border-left:0;border-top:1px solid #c8caba}.downloads{margin-left:0}h1{font-size:26px}}
</style></head><body>
<!-- THESIS: Useful stable correspondence, presented as a quiet field-journal letter.
OWN-WORLD: Paper #f7f1e5, evergreen #263f30, serif titles, thin rules, 4px actions.
STORY: Identify the change, read its context, take one relevant action.
FIRST VIEWPORT: Gallery navigation beside a 560px email; wordmark, 38px title, body, CTA.
FORM: Approved narrow extension of the landing identity; code-led HTML, no new visual world.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->
<header><h1>Paddock Pilot. Email previews</h1><p>Fictional examples, rendered by the app’s actual email templates. Nothing is sent.</p></header>
<main><nav aria-label="Email templates">${previews.map((preview, index) => `<a href="${preview.id}.html" target="email-preview" data-id="${preview.id}"${index === 0 ? ' aria-current="true"' : ''}>${escape(preview.label)}</a>`).join('')}</nav>
<section aria-label="Selected email"><div class="toolbar"><div role="group" aria-label="Preview width"><button type="button" id="desktop" aria-pressed="true">Desktop</button> <button type="button" id="mobile" aria-pressed="false">Mobile · 375px</button></div><div class="downloads"><a id="html-link" href="${first.id}.html" target="_blank" rel="noopener">Open HTML</a><a id="text-link" href="${first.id}.txt" download>Download text</a></div></div>
<p class="subject" aria-live="polite"><strong>Subject:</strong> <span id="subject">${escape(first.subject)}</span></p>
<div class="canvas" id="canvas"><iframe title="${escape(first.label)} email preview" name="email-preview" src="${first.id}.html" sandbox></iframe></div>
<details><summary>Plain-text alternative</summary><pre id="plain-text">${escape(first.text)}</pre></details></section></main>
<footer>Links use paddock.example and cannot accept real invitations. Browser previews are not inbox tests; review fresh test emails in Gmail and Outlook before rollout.</footer>
<script>
const previews = ${JSON.stringify(metadata).replace(/</g, '\u003c')};
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => {
 const preview = previews.find(item => item.id === link.dataset.id);
 document.querySelectorAll('nav a').forEach(item => item.removeAttribute('aria-current'));
 link.setAttribute('aria-current', 'true');
 document.getElementById('subject').textContent = preview.subject;
 document.getElementById('plain-text').textContent = preview.text;
 document.getElementById('html-link').href = preview.id + '.html';
 document.getElementById('text-link').href = preview.id + '.txt';
 document.querySelector('iframe').title = preview.label + ' email preview';
}));
['desktop', 'mobile'].forEach(size => document.getElementById(size).addEventListener('click', () => {
 document.getElementById('canvas').classList.toggle('mobile', size === 'mobile');
 ['desktop', 'mobile'].forEach(item => document.getElementById(item).setAttribute('aria-pressed', String(item === size)));
}));
</script></body></html>`,
)
console.log(
  `Generated ${previews.length} email previews: ${fileURLToPath(new URL('index.html', output))}`,
)

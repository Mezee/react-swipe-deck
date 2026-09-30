import '@fontsource-variable/manrope';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/source-sans-3';
import './typography-preview.css';
import { ideas } from './content';
const directions = [
  {
    id: 'studio',
    name: '01 · Refined studio',
    title: 'Manrope',
    body: 'Manrope',
    note: 'Open-source interpretation of the Lausanne direction.',
    reference: 'https://exoape.com',
    label: 'Exo Ape',
    weight: '600',
  },
  {
    id: 'editorial',
    name: '02 · Editorial character',
    title: 'Fraunces',
    body: 'Manrope',
    note: 'Open-source interpretation of the Noe Text + Neue Haas direction.',
    reference: 'https://houseofhoney.com',
    label: 'House of Honey',
    weight: '500',
  },
  {
    id: 'research',
    name: '03 · Research publication',
    title: 'Source Serif 4',
    body: 'Source Sans 3',
    note: 'The actual font pairing identified by Inspo.',
    reference: 'https://gwern.net',
    label: 'Gwern',
    weight: '600',
  },
];
let mode = 'card';
let index = 0;
const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
function render() {
  const idea = ideas[index];
  document.querySelector('#preview')!.innerHTML = `
<header><div><h1>Three typography directions</h1><p>Same content and layout. Different type character.</p></div><a href="/">Return to deck ↗</a></header>
<nav aria-label="Preview controls"><div class="segmented"><button data-mode="card" aria-pressed="${mode === 'card'}">Card</button><button data-mode="report" aria-pressed="${mode === 'report'}">Report</button></div><label>Video title <select>${ideas.map((v, i) => `<option value="${i}" ${index === i ? 'selected' : ''}>${escape(v.title)}</option>`).join('')}</select></label></nav>
<div class="directions">${directions
    .map(
      (
        d,
      ) => `<section class="direction ${d.id}"><div class="direction-label"><h2>${d.name}</h2><p>${d.title} ${d.title === d.body ? '' : `+ ${d.body}`}</p><small>${d.note} <a href="${d.reference}" target="_blank" rel="noreferrer">Reference ↗</a></small></div>
<article class="sample ${mode}"><div class="thumbnail"><img src="/thumbnail.jpg" alt="Pixelated owl thumbnail"></div><div class="content"><div class="sample-heading"><h3>${escape(idea.title)}</h3><p class="summary">${escape(idea.signal)}</p><div class="badge">Demand Score <strong>${idea.score}</strong><span>★</span></div></div>${
        mode === 'report'
          ? `<div class="report-sections">${[
              ['Signal', idea.demand],
              ['Edge', idea.edge],
              ['Alignment', idea.alignment],
              ['To succeed', idea.success],
            ]
              .map(
                ([label, text]) =>
                  `<section><h4>${label}</h4><p>${escape(text)}</p></section>`,
              )
              .join('')}</div>`
          : ''
      }</div></article><p class="spec">Title 32 / 36px · ${d.weight} weight<br>Summary 17 / 26px · Report 18 / 28px</p></section>`,
    )
    .join('')}</div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.mode!;
        render();
      }),
  );
  document.querySelector('select')!.onchange = (e) => {
    index = Number((e.target as HTMLSelectElement).value);
    render();
  };
}
render();

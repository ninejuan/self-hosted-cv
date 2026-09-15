export const EXPORT_FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com" />',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Roboto+Mono&display=swap" rel="stylesheet" />',
].join('\n    ');

export const EXPORT_BASE_CSS = `:root {
    --font-primary: "Inter", ui-sans-serif, system-ui, sans-serif;
    --font-mono: "Roboto Mono", ui-monospace, monospace;
    --color-bg: #ffffff;
    --color-text-primary: #111111;
    --color-text-secondary: #555555;
    --color-text-muted: #6d6d6d;
    --color-accent: #a8e765;
    --color-tag-bg: #f6f6f6;
    --color-border: #e5e5e5;
    --color-border-light: #f2f2f2;
}

.dark {
    --color-bg: #1a1a1a;
    --color-text-primary: #e0e0e0;
    --color-text-secondary: #aaaaaa;
    --color-text-muted: #888888;
    --color-accent: #a8e765;
    --color-tag-bg: #2a2a2a;
    --color-border: #333333;
    --color-border-light: #2a2a2a;
}

* { box-sizing: border-box; }

html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html, body {
    margin: 0;
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    font-family: var(--font-primary);
}

.cv-page {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 55px;
    max-width: 375px;
    margin: 0 auto;
    padding: 70px 22px 24px;
}

@media (min-width: 730px) {
    .cv-page { max-width: 724px; padding: 82px 62px; }
}

.cv-toolbar {
    position: fixed;
    top: 16px;
    right: 22px;
    display: flex;
    gap: 4px;
    z-index: 10;
}

@media (min-width: 730px) {
    .cv-toolbar { right: 62px; }
}

.cv-toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.15s, background-color 0.15s;
}

.cv-toolbar-btn:hover {
    color: var(--color-text-primary);
    background: var(--color-tag-bg);
}

.cv-header {
    width: 100%;
    max-width: 600px;
    position: relative;
    display: block;
    height: 93px;
}

.cv-header-photo {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 92px;
    height: 93px;
    aspect-ratio: 92 / 93;
    border-radius: 100px;
    object-fit: cover;
    object-position: 50% 50%;
}

.cv-header-text {
    position: absolute;
    left: 108px;
    top: 0;
    display: flex;
    flex-direction: column;
}

.cv-header-name {
    font-family: var(--font-primary);
    font-size: 20px;
    font-weight: 400;
    line-height: 26px;
    color: var(--color-text-primary);
    white-space: nowrap;
    margin: 0;
    padding-top: 6px;
}

.cv-header-subtitle {
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
    color: var(--color-text-secondary);
    white-space: pre-wrap;
    margin: 0;
}

.cv-header-tag {
    position: absolute;
    left: 108px;
    top: 65px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    padding: 4px 10px 5px;
    background-color: var(--color-tag-bg);
    font-family: var(--font-primary);
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
    color: var(--color-text-muted);
    text-decoration: none;
}

.cv-header-tag:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}

.cv-header-no-photo .cv-header-text { left: 0; }
.cv-header-no-photo .cv-header-tag { left: 0; }

.cv-main {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 58px;
}

.cv-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.cv-section-about { gap: 3.98px; padding-bottom: 0.685px; }
.cv-section-items-wrapper { gap: 24.7px; }

.cv-section-title {
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
    color: var(--color-text-primary);
    margin: 0;
}

.cv-section-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24.7px;
    margin-top: 4px;
}

.cv-item-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

.cv-date-column {
    flex-shrink: 0;
    width: 130px;
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
    color: var(--color-text-secondary);
    white-space: pre-wrap;
}

.cv-content-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.cv-item-title {
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
    color: var(--color-text-primary);
}

.cv-item-subtitle {
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
    color: var(--color-text-secondary);
    width: 100%;
}

.cv-item-link {
    display: inline-flex;
    align-items: flex-start;
    gap: 2px;
    color: var(--color-text-primary);
    text-decoration: none;
    cursor: pointer;
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
}

.cv-item-link:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}

.cv-link-arrow {
    width: 18px;
    height: 25px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.cv-link-arrow svg { width: 16px; height: 16px; color: var(--color-text-primary); }

.cv-item-images {
    width: 100%;
    box-sizing: border-box;
    padding-left: 0;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 10px;
    margin-top: 14px;
}

.cv-item-image-wrapper {
    flex: 1 1 0;
    min-width: 0;
    height: 120px;
    position: relative;
    display: block;
    border-radius: 8px;
    overflow: hidden;
}

.cv-item-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 50%;
    border-radius: 8px;
}

.cv-item-image-wrapper::after {
    content: "";
    position: absolute;
    inset: 0;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    pointer-events: none;
}

.cv-about-text {
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.8;
    color: var(--color-text-secondary);
    white-space: pre-wrap;
    width: 100%;
}

.cv-writing-card {
    position: relative;
    border-radius: 8px;
    flex-shrink: 0;
    background-color: var(--color-bg);
    width: 100%;
    min-height: 70px;
    margin-top: 8px;
}

.cv-writing-card-inner {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
    border-radius: inherit;
    overflow: clip;
    border: 1px solid var(--color-border);
}

.cv-writing-card-image {
    width: 152px;
    height: 89px;
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: clip;
}

.cv-writing-card-image img { width: 100%; height: 100%; object-fit: cover; }

.cv-writing-card-body {
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    min-height: 70px;
}

.cv-writing-card-body .cv-item-subtitle { color: var(--color-text-primary); }

.cv-writing-card-body .cv-item-subtitle:last-child {
    color: var(--color-text-secondary);
    font-size: 12px;
    margin-top: 2px;
}

@media (min-width: 730px) {
    .cv-header { width: 600px; }
    .cv-template-readcv .cv-item-images {
        margin-left: -130px;
        width: calc(100% + 130px);
    }
}

@media print {
    :root, .dark {
        --color-bg: #ffffff;
        --color-text-primary: #111111;
        --color-text-secondary: #555555;
        --color-text-muted: #6d6d6d;
        --color-accent: #a8e765;
        --color-tag-bg: #f6f6f6;
        --color-border: #e5e5e5;
        --color-border-light: #f2f2f2;
    }
    *, *::before, *::after {
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    html, body { background: #fff !important; color: #111 !important; font-size: 10pt; line-height: 1.5; }
    .cv-page { max-width: none; padding: 0; margin: 15mm 20mm; }
    .cv-toolbar { display: none !important; }
    .cv-section { break-inside: avoid; }
    .cv-item-row { break-inside: avoid; }
    a[href]::after { content: ""; }
    img { max-width: 100% !important; page-break-inside: avoid; }
    h1, h2, h3 { page-break-after: avoid; }
}`;

export const EXPORT_THEME_SCRIPT = `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`;

export const EXPORT_TOOLBAR_SCRIPT = `(function(){var CYCLE=['light','dark','system'];function apply(t){var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);localStorage.setItem('theme',t);}var tb=document.getElementById('theme-toggle');if(tb){tb.addEventListener('click',function(){var cur=localStorage.getItem('theme')||'system';var next=CYCLE[(CYCLE.indexOf(cur)+1)%CYCLE.length];apply(next);});}var pb=document.getElementById('print-button');if(pb){pb.addEventListener('click',function(){window.print();});}})();`;

export const EXPORT_ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

export const EXPORT_SUN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

export const EXPORT_PRINTER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';

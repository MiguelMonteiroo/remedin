import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const policy = JSON.parse(await readFile(path.join(root, "src/legal/privacy.json"), "utf8"));
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const section = ({ title, body }) => `<section><h2>${escape(title)}</h2><p>${escape(body)}</p></section>`;
const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Política de privacidade do Remedin: dados locais, permissões e contato.">
  <title>Remedin | Política de privacidade</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #faf7f6; color: #40282a; font: 18px/1.65 system-ui, sans-serif; }
    main { max-width: 800px; margin: auto; padding: 40px 24px 64px; }
    h1 { font-size: 32px; line-height: 1.25; } h2 { font-size: 23px; line-height: 1.35; margin: 0 0 12px; }
    section { margin-top: 32px; } p { margin: 0 0 16px; }
    .brand, a { color: #6f3435; } a { overflow-wrap: anywhere; text-underline-offset: 4px; }
    .notice { padding: 24px; background: #ffe1dc; border-radius: 8px; }
    .date { color: #695354; font-size: 16px; }
    a:focus-visible { outline: 3px solid #a44945; outline-offset: 4px; }
    @media (prefers-color-scheme: dark) { body { background: #291c1c; color: #f1eceb; } .brand, a { color: #ffdad4; } .notice { background: #633c39; } .date { color: #d8c5c2; } }
  </style>
</head>
<body><main>
  <p class="brand"><strong>Remedin</strong></p>
  <h1>Política de privacidade</h1>
  <p class="date">Atualizada em ${escape(policy.updatedAt)}</p>
  <section class="notice"><h2>${escape(policy.medicalTitle)}</h2><p>${escape(policy.medicalDisclaimer)}</p><p>${escape(policy.alarmNotice)}</p></section>
  ${policy.sections.map(section).join("\n  ")}
  <section><h2>Contato sobre privacidade</h2><p>${escape(policy.controller)}<br><a href="mailto:${escape(policy.contactEmail)}">${escape(policy.contactEmail)}</a></p></section>
  <section><h2>Privacidade da hospedagem</h2><p>Esta página é hospedada no GitHub Pages, sem analytics ou cookies adicionados pelo Remedin. Consulte a <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement">declaração de privacidade do GitHub</a> para informações sobre dados técnicos da visita.</p></section>
</main></body></html>
`;
await mkdir(path.join(root, "privacy-site"), { recursive: true });
await writeFile(path.join(root, "privacy-site/index.html"), html, "utf8");
console.log("Privacy site generated from src/legal/privacy.json");

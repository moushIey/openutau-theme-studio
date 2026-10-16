(function () {
  "use strict";

  const GROUPS = [
    { title: "Surfaces", note: "windows, menus, panels", fields: [
      ["BackgroundColor", "#FFFFFF", "Window, panel and menu backgrounds."],
      ["BackgroundColorPointerOver", "#F0F0F0", "Hovered menu items; buttons and dropdowns at rest."],
      ["BackgroundColorPressed", "#E0E0E0", "Dropdowns while hovered."],
      ["BackgroundColorDisabled", "#D0D0D0", "Disabled buttons, menu items and text boxes."],
    ]},
    { title: "Text", note: "labels and lyrics fields", fields: [
      ["ForegroundColor", "#000000", "Main text everywhere."],
      ["ForegroundColorPointerOver", "#000000", "Text on hovered items; toggle knob on hover."],
      ["ForegroundColorPressed", "#202020", "Tint laid over hovered buttons at 25% opacity."],
      ["ForegroundColorDisabled", "#808080", "Disabled text and status bar."],
    ]},
    { title: "Borders", note: "outlines", fields: [
      ["BorderColor", "#707070", "Text boxes, dropdowns, checkboxes, menu edges, dividers."],
      ["BorderColorPointerOver", "#B0B0B0", "Hovered borders; switch knob when off."],
    ]},
    { title: "System accent", note: "checked & selected controls", fields: [
      ["SystemAccentColor", "#4EA6EA", "Active tool, toggles, checkboxes, sliders, focused text box."],
      ["SystemAccentColorLight1", "#90CAF9", "Accent controls on hover."],
      ["SystemAccentColorDark1", "#1E88E5", "Accent controls while pressed."],
    ]},
    { title: "Notes & accents", note: "piano roll and parts", fields: [
      ["NeutralAccentColor", "#ADA1B3", "List and track selections (at 25–50%), notes with errors."],
      ["NeutralAccentColorPointerOver", "#948A99", "Hovered selected list rows."],
      ["AccentColor1", "#4EA6EA", "Notes, parts, expression bars, phonemes."],
      ["AccentColor2", "#FF679D", "Selected notes, parts and their expressions."],
      ["AccentColor3", "#E62E6E", "Errors and snapped pitch points."],
    ]},
    { title: "Grid", note: "timeline and pitch", fields: [
      ["TickLineColor", "#AFA3B5", "Bar lines (beat lines at 50%)."],
      ["BarNumberColor", "#AFA3B5", "Bar numbers, tempo and time signature."],
      ["FinalPitchColor", "#C0C0C0", "Rendered pitch line."],
      ["TrackBackgroundAltColor", "#F0F0F0", "Black-key rows and alternating tracks."],
    ]},
    { title: "Piano keys", note: "left → right gradients", fields: [
      ["WhiteKeyColorLeft", "Transparent", "White key gradient, left edge."],
      ["WhiteKeyColorRight", "Transparent", "White key gradient, right edge."],
      ["WhiteKeyNameColor", "#FF347C", "White key labels."],
      ["CenterKeyColorLeft", "#FFDDE6", "C4 key gradient, left edge."],
      ["CenterKeyColorRight", "#FFCEDC", "C4 key gradient, right edge."],
      ["CenterKeyNameColor", "#FF347C", "C4 label."],
      ["BlackKeyColorLeft", "#FF71A3", "Black key gradient, left edge."],
      ["BlackKeyColorRight", "#FF347C", "Black key gradient, right edge."],
      ["BlackKeyNameColor", "#FFFFFF", "Black key labels."],
    ]},
  ];
  const FIELDS = GROUPS.flatMap(g => g.fields);
  const KEYS = FIELDS.map(f => f[0]);
  const CLASS_DEFAULTS = Object.fromEntries(FIELDS.map(f => [f[0], f[1]]));

  const snake = k => k.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  const SNAKE_TO_KEY = Object.fromEntries(KEYS.map(k => [snake(k), k]));

  const PRESETS = {
    "Light": { name: "Light", dark: false, c: Object.assign({}, CLASS_DEFAULTS, { BorderColor: "#C4C4C4" }) },
    "Dark": { name: "Dark", dark: true, c: {
      BackgroundColor: "#26232C", BackgroundColorPointerOver: "#36313F", BackgroundColorPressed: "#484255", BackgroundColorDisabled: "#2C2933",
      ForegroundColor: "#CDCAD4", ForegroundColorPointerOver: "#E9E6F0", ForegroundColorPressed: "#FFFFFF", ForegroundColorDisabled: "#7E778C",
      BorderColor: "#544E60", BorderColorPointerOver: "#878096",
      SystemAccentColor: "#4EA6EA", SystemAccentColorLight1: "#90CAF9", SystemAccentColorDark1: "#1E88E5",
      NeutralAccentColor: "#878096", NeutralAccentColorPointerOver: "#B0ABBC", AccentColor1: "#4EA6EA", AccentColor2: "#FF679D", AccentColor3: "#E62E6E",
      TickLineColor: "#615B73", BarNumberColor: "#B0ABBC", FinalPitchColor: "#C0BACD", TrackBackgroundAltColor: "#302C38",
      WhiteKeyColorLeft: "#CC527C", WhiteKeyColorRight: "#FF4D8B", WhiteKeyNameColor: "#FFFFFF",
      CenterKeyColorLeft: "#CCA5B0", CenterKeyColorRight: "#FFCEDC", CenterKeyNameColor: "#FF4D8B",
      BlackKeyColorLeft: "Transparent", BlackKeyColorRight: "Transparent", BlackKeyNameColor: "#CDCAD4" } },
    "Sakura (example)": { name: "Sakura", dark: false, c: {
      BackgroundColor: "#FFF6F9", BackgroundColorPointerOver: "#FFE6EF", BackgroundColorPressed: "#FFD3E2", BackgroundColorDisabled: "#F3E4EA",
      ForegroundColor: "#4A2338", ForegroundColorPointerOver: "#2E1022", ForegroundColorPressed: "#C2185B", ForegroundColorDisabled: "#B494A4",
      BorderColor: "#F0B8CC", BorderColorPointerOver: "#E57FA6",
      SystemAccentColor: "#EC5C93", SystemAccentColorLight1: "#F78DB5", SystemAccentColorDark1: "#C2185B",
      NeutralAccentColor: "#D9A6BC", NeutralAccentColorPointerOver: "#C98AA6", AccentColor1: "#F27BA8", AccentColor2: "#8E6CEF", AccentColor3: "#E0335E",
      TickLineColor: "#F2C4D4", BarNumberColor: "#C9809E", FinalPitchColor: "#B48AA0", TrackBackgroundAltColor: "#FFEAF1",
      WhiteKeyColorLeft: "Transparent", WhiteKeyColorRight: "Transparent", WhiteKeyNameColor: "#E2588F",
      CenterKeyColorLeft: "#FFE0EC", CenterKeyColorRight: "#FFC4DA", CenterKeyNameColor: "#C2185B",
      BlackKeyColorLeft: "#F9A8C8", BlackKeyColorRight: "#EC5C93", BlackKeyNameColor: "#FFFFFF" } },
  };

  const probe = document.createElement("span");
  function parseColor(str) {
    const s = String(str || "").trim();
    if (!s) return null;
    if (s[0] === "#") {
      let h = s.slice(1);
      if (!/^[0-9a-f]+$/i.test(h)) return null;
      if (h.length === 3) h = "FF" + h.replace(/./g, c => c + c);
      else if (h.length === 4) h = h.replace(/./g, c => c + c);
      else if (h.length === 6) h = "FF" + h;
      else if (h.length !== 8) return null;
      const n = i => parseInt(h.slice(i, i + 2), 16);
      return { a: n(0), r: n(2), g: n(4), b: n(6) };
    }
    if (/^transparent$/i.test(s)) return { a: 0, r: 255, g: 255, b: 255 };
    if (!/^[a-z]+$/i.test(s)) return null;
    probe.style.color = ""; probe.style.color = s;
    if (!probe.style.color) return null;
    document.body.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g);
    probe.remove();
    if (!m) return null;
    return { r: +m[0], g: +m[1], b: +m[2], a: m[3] !== undefined ? Math.round(+m[3] * 255) : 255 };
  }
  const hex2 = n => n.toString(16).padStart(2, "0").toUpperCase();
  const toCss = c => `rgba(${c.r}, ${c.g}, ${c.b}, ${(c.a / 255).toFixed(3)})`;
  const toAvalonia = c => c.a === 255 ? `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}` : `#${hex2(c.a)}${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
  const toRgbHex = c => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`.toLowerCase();

  const STORE = "outheme-draft-v1";
  let state = loadDraft() || clonePreset("Light");
  let lastPreset = state.preset || "Light";
  function clonePreset(n) { const p = PRESETS[n]; return { name: p.name === "Light" ? "My Theme" : p.name, dark: p.dark, c: Object.assign({}, CLASS_DEFAULTS, p.c), preset: n }; }
  function loadDraft() { try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.c) { s.c = Object.assign({}, CLASS_DEFAULTS, s.c); return s; } } catch (e) {} return null; }
  function saveDraft() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  const groupsEl = document.getElementById("groups");
  const rows = {};
  GROUPS.forEach(g => {
    const d = document.createElement("details");
    d.className = "card group"; d.open = true;
    d.innerHTML = `<summary><h2>${g.title}</h2><span>${g.note}</span></summary>`;
    g.fields.forEach(([key, , desc]) => {
      const id = "f-" + key;
      const row = document.createElement("div");
      row.className = "field"; row.dataset.key = key;
      row.innerHTML = `
        <label class="swatch" title="Pick a color"><i></i><input type="color" id="${id}-pick" aria-label="${key} color"></label>
        <div class="f-top"><span class="f-key" title="${snake(key)}">${snake(key)}</span><input class="f-val" id="${id}" spellcheck="false" autocomplete="off" aria-label="${key} value"></div>
        <div class="f-desc"><span>${desc}</span><input type="range" class="alpha" id="${id}-a" min="0" max="255" aria-label="${key} opacity"><span class="alpha-l"></span></div>`;
      d.appendChild(row);
      const r = { row, sw: row.querySelector(".swatch i"), pick: row.querySelector('input[type=color]'), val: row.querySelector(".f-val"), a: row.querySelector(".alpha"), al: row.querySelector(".alpha-l") };
      rows[key] = r;
      r.val.addEventListener("input", () => { state.c[key] = r.val.value.trim(); syncRow(key, false); render(); });
      r.pick.addEventListener("input", () => { const cur = parseColor(state.c[key]) || { a: 255 }; const n = parseColor(r.pick.value); n.a = cur.a === 0 ? 255 : cur.a; state.c[key] = toAvalonia(n); syncRow(key); render(); });
      r.a.addEventListener("input", () => { const cur = parseColor(state.c[key]) || { r: 0, g: 0, b: 0 }; cur.a = +r.a.value; state.c[key] = toAvalonia(cur); syncRow(key); render(); });
      row.addEventListener("mouseenter", () => spotlight(key));
      row.addEventListener("mouseleave", () => spotlight(null));
      row.addEventListener("focusin", () => spotlight(key));
      row.addEventListener("focusout", () => spotlight(null));
    });
    groupsEl.appendChild(d);
  });

  function syncRow(key, writeText = true) {
    const r = rows[key], v = state.c[key], c = parseColor(v);
    if (writeText && document.activeElement !== r.val) r.val.value = v;
    r.val.classList.toggle("bad", !c);
    r.val.title = c ? "" : "OpenUtau can't read this color and will log an error.";
    if (c) { r.sw.style.background = toCss(c); r.pick.value = toRgbHex(c); r.a.value = c.a; r.al.textContent = Math.round(c.a / 2.55) + "%"; }
  }

  const ou = document.getElementById("ou");
  function spotlight(key) {
    ou.querySelectorAll(".spot").forEach(e => e.classList.remove("spot"));
    if (!key) return;
    ou.querySelectorAll(`[data-k~="${key}"]`).forEach(e => { if (e.getClientRects().length) e.classList.add("spot"); });
  }

  function applyVars() {
    KEYS.forEach(k => { const c = parseColor(state.c[k]) || parseColor(CLASS_DEFAULTS[k]); ou.style.setProperty("--ou-" + k, toCss(c)); });
  }

  const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const TOP = 74, BOTTOM = 55; // D5 .. G3 (MIDI)
  const ROW = 17, BEAT = 46, BARS = 3;
  const NOTES = [
    { p: 67, s: 0, l: 3, t: "ra" },
    { p: 64, s: 3, l: 2, t: "n" },
    { p: 69, s: 5.5, l: 2.5, t: "la", sel: true },
    { p: 62, s: 8, l: 1.5, t: "ki", err: true },
    { p: 60, s: 9.5, l: 2.5, t: "ra" },
  ];
  function buildRoll() {
    const keys = document.getElementById("keys"), grid = document.getElementById("grid");
    keys.innerHTML = ""; grid.innerHTML = "";
    for (let m = TOP; m >= BOTTOM; m--) {
      const n = NAMES[m % 12], oct = Math.floor(m / 12) - 1, black = n.includes("#"), center = m === 60;
      const k = document.createElement("div");
      k.className = "key " + (center ? "c" : black ? "b" : "w");
      k.dataset.k = center ? "CenterKeyColorLeft CenterKeyColorRight CenterKeyNameColor" : black ? "BlackKeyColorLeft BlackKeyColorRight BlackKeyNameColor" : "WhiteKeyColorLeft WhiteKeyColorRight WhiteKeyNameColor";
      k.textContent = n + oct;
      keys.appendChild(k);
      const l = document.createElement("div");
      l.className = "lane" + (black ? " b" : "");
      if (black) l.dataset.k = "TrackBackgroundAltColor";
      grid.appendChild(l);
    }
    const W = BEAT * 4 * BARS + 40;
    for (let b = 0; b <= BARS * 4; b++) {
      const v = document.createElement("div");
      v.className = "vline" + (b % 4 ? " low" : "");
      v.style.left = b * BEAT + "px"; v.dataset.k = "TickLineColor";
      grid.appendChild(v);
    }
    const ruler = document.getElementById("ruler");
    ruler.innerHTML = "";
    for (let b = 0; b <= BARS * 4; b++) {
      const t = document.createElement("i"); t.style.left = b * BEAT + "px"; if (b % 4) t.style.height = "4px"; t.dataset.k = "TickLineColor"; ruler.appendChild(t);
      if (b % 4 === 0 && b < BARS * 4) { const s = document.createElement("span"); s.style.left = b * BEAT + "px"; s.textContent = b / 4 + 1; s.dataset.k = "BarNumberColor"; ruler.appendChild(s); }
    }
    const tempo = document.createElement("span"); tempo.className = "tempo"; tempo.textContent = "120.00"; tempo.dataset.k = "BarNumberColor"; ruler.appendChild(tempo);

    const y = p => (TOP - p) * ROW;
    const phon = document.getElementById("phon"), exp = document.getElementById("exp");
    phon.innerHTML = ""; exp.innerHTML = "";
    const pts = [];
    NOTES.forEach((n, i) => {
      const el = document.createElement("div");
      el.className = "note" + (n.sel ? " sel" : "") + (n.err ? " err" : "");
      el.style.left = n.s * BEAT + 1 + "px"; el.style.top = y(n.p) + 1 + "px"; el.style.width = n.l * BEAT - 2 + "px";
      el.textContent = n.t;
      el.dataset.k = n.err ? "NeutralAccentColor" : n.sel ? "AccentColor2" : "AccentColor1";
      grid.appendChild(el);
      const ph = document.createElement("b");
      ph.className = n.sel ? "sel" : ""; ph.style.left = n.s * BEAT + 1 + "px"; ph.style.width = n.l * BEAT - 3 + "px"; ph.textContent = n.t;
      ph.dataset.k = n.sel ? "AccentColor2" : "AccentColor1";
      phon.appendChild(ph);
      const h = [44, 30, 52, 36, 40][i];
      const bar = document.createElement("div"); bar.className = "bar" + (n.sel ? " sel" : ""); bar.style.left = n.s * BEAT + "px"; bar.style.height = h + "px"; bar.dataset.k = n.sel ? "AccentColor2" : "AccentColor1"; exp.appendChild(bar);
      const kn = document.createElement("div"); kn.className = "knob" + (n.sel ? " sel" : ""); kn.style.left = n.s * BEAT + "px"; kn.style.bottom = h - 4 + "px"; kn.dataset.k = n.sel ? "AccentColor2" : "AccentColor1"; exp.appendChild(kn);
      const x0 = n.s * BEAT, x1 = (n.s + n.l) * BEAT, cy = y(n.p) + 8;
      if (pts.length) { const prev = pts[pts.length - 1]; const mx = x0 + 10; pts.push([x0 - 8, prev[1]], [mx, cy + 2]); }
      for (let x = x0 + 14; x <= x1 - 6; x += 4) { const v = n.l >= 2.5 && x > x0 + n.l * BEAT * 0.45 ? Math.sin((x - x0) / 5) * 3 : 0; pts.push([x, cy + v]); }
    });
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg"); svg.setAttribute("class", "pitch"); svg.setAttribute("width", W); svg.setAttribute("height", (TOP - BOTTOM + 1) * ROW);
    const pl = document.createElementNS(svgNS, "polyline"); pl.setAttribute("points", pts.map(p => p.join(",")).join(" "));
    pl.setAttribute("fill", "none"); pl.setAttribute("stroke", "var(--ou-FinalPitchColor)"); pl.setAttribute("stroke-width", "1.6"); pl.setAttribute("stroke-linejoin", "round");
    svg.appendChild(pl); svg.dataset.k = "FinalPitchColor"; grid.appendChild(svg);
    const sn = NOTES[2]; const dot = document.createElement("div"); dot.className = "snap"; dot.style.left = sn.s * BEAT + 9 + "px"; dot.style.top = y(sn.p) + 9 + "px"; dot.dataset.k = "AccentColor3"; grid.appendChild(dot);
    const es = document.createElementNS(svgNS, "svg"); es.setAttribute("width", W); es.setAttribute("height", 70); es.dataset.k = "AccentColor1";
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `<linearGradient id="rc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ou-AccentColor1)" stop-opacity=".25"/><stop offset="1" stop-color="var(--ou-AccentColor1)" stop-opacity="0"/></linearGradient>`;
    es.appendChild(defs);
    let d = "M0,70", line = "";
    for (let x = 0; x <= W; x += 6) { const v = 34 + Math.sin(x / 31) * 12 + Math.sin(x / 9) * 3; d += ` L${x},${v.toFixed(1)}`; line += `${x},${v.toFixed(1)} `; }
    d += ` L${W},70 Z`;
    const area = document.createElementNS(svgNS, "path"); area.setAttribute("d", d); area.setAttribute("fill", "url(#rc)");
    const ln = document.createElementNS(svgNS, "polyline"); ln.setAttribute("points", line); ln.setAttribute("fill", "none"); ln.setAttribute("stroke", "var(--ou-AccentColor1)"); ln.setAttribute("stroke-opacity", ".25"); ln.setAttribute("stroke-width", "1.5");
    es.appendChild(area); es.appendChild(ln); exp.prepend(es);
    [phon, exp].forEach(el => { for (let b = 0; b <= BARS * 4; b += 4) { const v = document.createElement("div"); v.className = "vline low"; v.style.left = b * BEAT + "px"; el.appendChild(v); } });
  }

  function yamlText() {
    const q = s => `'${String(s).replace(/'/g, "''")}'`;
    const lines = [`name: ${q(state.name || "Custom YAML")}`, `is_dark_mode: ${state.dark ? "true" : "false"}`];
    GROUPS.forEach(g => { lines.push("", `# ${g.title}`); g.fields.forEach(([k]) => lines.push(`${snake(k)}: ${q(state.c[k])}`)); });
    return lines.join("\n") + "\n";
  }
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function renderYaml() {
    const t = yamlText();
    document.getElementById("yaml-out").innerHTML = t.split("\n").map(l => {
      if (l.startsWith("#")) return `<span class="c">${esc(l)}</span>`;
      const i = l.indexOf(":"); return i < 0 ? esc(l) : `<span class="k">${esc(l.slice(0, i))}</span>${esc(l.slice(i))}`;
    }).join("\n");
    const fname = (state.name || "theme").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "theme";
    document.getElementById("yaml-title").textContent = fname + ".yaml";
  }

  function parseYaml(text) {
    const out = { c: {}, unknown: [], bad: [] };
    text.split(/\r?\n/).forEach(raw => {
      const line = raw.replace(/^﻿/, "");
      if (/^\s*(#|$|%|---|\.\.\.)/.test(line)) return;
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (!m) return;
      let v = m[2].trim();
      if (v[0] === "'" ) { const e = v.indexOf("'", 1); v = v.slice(1, e < 0 ? undefined : e); }
      else if (v[0] === '"') { const e = v.indexOf('"', 1); v = v.slice(1, e < 0 ? undefined : e); }
      else v = v.replace(/\s+#.*$/, "").trim();
      const key = m[1];
      if (key === "name") out.name = v;
      else if (key === "is_dark_mode") out.dark = /^(true|yes|on)$/i.test(v);
      else if (SNAKE_TO_KEY[key]) { out.c[SNAKE_TO_KEY[key]] = v; if (!parseColor(v)) out.bad.push(key); }
      else out.unknown.push(key);
    });
    return out;
  }

  const nameEl = document.getElementById("theme-name"), darkEl = document.getElementById("is-dark");
  nameEl.addEventListener("input", () => { state.name = nameEl.value; render(); });
  darkEl.addEventListener("change", () => { state.dark = darkEl.checked; render(); });

  const presetsEl = document.getElementById("presets");
  Object.keys(PRESETS).forEach(n => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = n;
    b.addEventListener("click", () => { const nm = nameEl.value.trim(); state = clonePreset(n); if (nm && nm !== "My Theme" && !Object.values(PRESETS).some(p => p.name === nm)) state.name = nm; lastPreset = n; syncAll(); render(); toast(`Loaded ${n} colors`); });
    presetsEl.appendChild(b);
  });
  document.getElementById("btn-reset").addEventListener("click", () => { const nm = state.name; state = clonePreset(lastPreset); state.name = nm; syncAll(); render(); toast(`Reset to ${lastPreset}`); });

  function copy() {
    const t = yamlText();
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById("yaml-out")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected, press Ctrl+C to copy"); };
    try { navigator.clipboard.writeText(t).then(() => toast("YAML copied"), fallback); } catch (e) { fallback(); }
  }
  document.getElementById("btn-copy").addEventListener("click", copy);
  document.getElementById("btn-copy-top").addEventListener("click", copy);

  const imp = document.getElementById("import");
  document.getElementById("btn-import-toggle").addEventListener("click", () => { imp.hidden = !imp.hidden; if (!imp.hidden) { imp.scrollIntoView({ behavior: "smooth", block: "center" }); document.getElementById("import-text").focus(); } });
  document.getElementById("import-file").addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader(); fr.onload = () => { document.getElementById("import-text").value = fr.result; doImport(); }; fr.readAsText(f);
  });
  document.getElementById("btn-import").addEventListener("click", doImport);
  function doImport() {
    const msg = document.getElementById("import-msg");
    const p = parseYaml(document.getElementById("import-text").value);
    const found = Object.keys(p.c).length;
    if (!found && p.name === undefined) { msg.className = "msg warn"; msg.textContent = "No theme keys found. Paste the contents of a theme .yaml file (lines like background_color: '#FFFFFF')."; return; }
    state = { name: p.name || "Custom YAML", dark: !!p.dark, c: Object.assign({}, CLASS_DEFAULTS, p.c), preset: "Light" };
    syncAll(); render();
    const missing = KEYS.length - found;
    const parts = [`Loaded ${found} of ${KEYS.length} colors.`];
    if (missing) parts.push(`${missing} missing, filled with OpenUtau's built-in defaults (the same thing OpenUtau does).`);
    if (p.bad.length) parts.push(`Unreadable: ${p.bad.join(", ")}.`);
    if (p.unknown.length) parts.push(`Ignored unknown keys: ${p.unknown.join(", ")}.`);
    msg.className = "msg " + (p.bad.length ? "warn" : "ok"); msg.textContent = parts.join(" ");
  }

  const tabRoll = document.getElementById("tab-roll"), tabCtl = document.getElementById("tab-ctl");
  function showTab(which) {
    tabRoll.setAttribute("aria-selected", which === "roll"); tabCtl.setAttribute("aria-selected", which === "ctl");
    document.getElementById("view-roll").hidden = which !== "roll"; document.getElementById("view-ctl").hidden = which !== "ctl";
    document.getElementById("flyout").hidden = which !== "roll";
    document.getElementById("menu-edit").classList.toggle("open", which === "roll");
    try { localStorage.setItem("outheme-tab", which); } catch (e) {}
  }
  tabRoll.addEventListener("click", () => showTab("roll"));
  tabCtl.addEventListener("click", () => showTab("ctl"));
  document.getElementById("flyout").hidden = false;

  let tt;
  function toast(t) { const el = document.getElementById("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1600); }

  function syncAll() { nameEl.value = state.name; darkEl.checked = !!state.dark; KEYS.forEach(k => syncRow(k)); }
  function render() { applyVars(); renderYaml(); saveDraft(); }

  const rootEl = document.documentElement, siteBtn = document.getElementById("btn-site-theme");
  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  const siteTheme = () => rootEl.getAttribute("data-theme") || (darkMQ.matches ? "dark" : "light");
  const siteLabel = () => { siteBtn.textContent = siteTheme() === "dark" ? "☀ Light" : "☾ Dark"; };
  try { const t = localStorage.getItem("outheme-site"); if (t === "dark" || t === "light") rootEl.setAttribute("data-theme", t); } catch (e) {}
  siteBtn.addEventListener("click", () => {
    const next = siteTheme() === "dark" ? "light" : "dark";
    rootEl.setAttribute("data-theme", next);
    try { localStorage.setItem("outheme-site", next); } catch (e) {}
    siteLabel();
  });
  darkMQ.addEventListener("change", siteLabel);
  new MutationObserver(siteLabel).observe(rootEl, { attributes: true, attributeFilter: ["data-theme"] });
  siteLabel();

  buildRoll(); syncAll(); render();
  try { const t = localStorage.getItem("outheme-tab"); if (t === "ctl") showTab("ctl"); } catch (e) {}
})();

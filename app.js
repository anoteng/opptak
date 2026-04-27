import { COUNTRIES } from './data.js';

/* ── Norwegian grade scale ── */
const NO_GRADES = [
  { min: 4.5, letter: "A", desc: "Fremragende" },
  { min: 3.5, letter: "B", desc: "Meget god" },
  { min: 2.5, letter: "C", desc: "God" },
  { min: 1.5, letter: "D", desc: "Nokså god" },
  { min: 0.5, letter: "E", desc: "Tilstrekkelig" }
];

function toNorwegianGrade(numeric) {
  for (const g of NO_GRADES) {
    if (numeric >= g.min) return g;
  }
  return { letter: "F", desc: "Stryk" };
}

/* ── State ── */
let courses = [];
let nextId  = 0;
let linearConfig = { minPass: null, maxGrade: null };

/* ── DOM references ── */
const countrySelect   = document.getElementById('countrySelect');
const scaleGroup      = document.getElementById('scaleGroup');
const scaleSelect     = document.getElementById('scaleSelect');
const scaleBadge      = document.getElementById('scaleBadge');
const refTableWrap    = document.getElementById('refTableWrap');
const refTableBody    = document.getElementById('refTableBody');
const courseCard      = document.getElementById('courseCard');
const courseTableBody = document.getElementById('courseTableBody');
const addCourseBtn    = document.getElementById('addCourseBtn');
const resultSection   = document.getElementById('resultSection');
const resNumeric      = document.getElementById('resNumeric');
const resLetter       = document.getElementById('resLetter');
const resLetterDesc   = document.getElementById('resLetterDesc');
const resCredits      = document.getElementById('resCredits');
const resFailCredits  = document.getElementById('resFailCredits');
const linearWarnWrap   = document.getElementById('linearWarnWrap');
const linearConfigWrap = document.getElementById('linearConfigWrap');
const coreResultCard   = document.getElementById('coreResultCard');
const saveFormCard     = document.getElementById('saveFormCard');

/* ── Scale lookup helpers ── */
function getCountry() {
  return COUNTRIES.find(c => c.id === countrySelect.value) || null;
}
function getScale() {
  const c = getCountry();
  if (!c) return null;
  const idx = c.scales.length > 1 ? parseInt(scaleSelect.value, 10) : 0;
  return c.scales[idx] || c.scales[0];
}
function getGrades() {
  const s = getScale();
  return s ? s.grades : [];
}

/* ── Numeric-scale helpers ── */
function parseThreshold(label) {
  let s = label
    .replace(/\([^)]*\)/g, '')
    .replace(/,/g, '.')
    .replace(/%/g, '')
    .trim();
  let m;
  m = s.match(/^>=?\s*([\d.]+)/);
  if (m) return parseFloat(m[1]);
  if (/^[Uu]nder\s/i.test(s)) return -Infinity;
  m = s.match(/^(-?[\d.]+)\s*[-–]\s*([\d.]+)/);
  if (m) return Math.min(parseFloat(m[1]), parseFloat(m[2]));
  m = s.match(/^(-?[\d.]+)\s*[-–]/);
  if (m) return parseFloat(m[1]);
  m = s.match(/^(-?[\d.]+)\s*$/);
  if (m) return parseFloat(m[1]);
  return null;
}
function isNumericScale(grades) {
  return grades.filter(g => parseThreshold(g.label) !== null).length >= 2;
}
function parseInterval(label) {
  let s = label
    .replace(/\([^)]*\)/g, '')
    .replace(/,/g, '.')
    .replace(/%/g, '')
    .trim();
  const m = s.match(/^(-?[\d.]+)\s*[-–]\s*([\d.]+)/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    return { lo: Math.min(a, b), hi: Math.max(a, b) };
  }
  return null;
}

function findGradeIndexByNumeric(grades, val) {
  // First pass: exact interval match (handles inverted/bounded scales like German)
  for (let i = 0; i < grades.length; i++) {
    const iv = parseInterval(grades[i].label);
    if (iv && val >= iv.lo && val <= iv.hi) return i;
  }
  // Second pass: threshold-based (handles >=  style scales)
  for (let i = 0; i < grades.length; i++) {
    const t = parseThreshold(grades[i].label);
    if (t === null) continue;
    if (t === -Infinity || val >= t) return i;
  }
  return -1;
}

/* ── Linear-scale helpers ── */
function isLinearScale() {
  const s = getScale();
  return !!(s && s.type === 'linear');
}
function getLinearMinPass() {
  const s = getScale();
  if (!s || s.type !== 'linear') return null;
  return s.minPass !== null ? s.minPass : linearConfig.minPass;
}
function getLinearMaxGrade() {
  const s = getScale();
  if (!s || s.type !== 'linear') return null;
  return s.maxGrade !== null ? s.maxGrade : linearConfig.maxGrade;
}
function computeLinearValue(raw) {
  const minPass = getLinearMinPass(), maxGrade = getLinearMaxGrade();
  if (minPass === null || maxGrade === null || raw === null || raw === undefined) return undefined;
  if (raw < minPass) return null;
  if (maxGrade <= minPass) return 5;
  return Math.min(5, 1 + (raw - minPass) / (maxGrade - minPass) * 4);
}

/* ── Populate country dropdown ── */
COUNTRIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.name;
  countrySelect.appendChild(opt);
});

/* ── Update scale selector ── */
function updateScaleSelector() {
  const c = getCountry();
  scaleGroup.classList.toggle('hidden', !c || c.scales.length <= 1);
  if (c && c.scales.length > 1) {
    scaleSelect.innerHTML = '';
    c.scales.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = s.name;
      scaleSelect.appendChild(opt);
    });
  }
}

/* ── Scale badge + reference table ── */
function updateScaleInfo() {
  const scale = getScale();

  if (!scale) {
    scaleBadge.classList.add('hidden');
    refTableWrap.classList.add('hidden');
    linearWarnWrap.classList.add('hidden');
    linearConfigWrap.classList.add('hidden');
    return;
  }

  let srcHtml = '';
  if (scale.src) {
    srcHtml = scale.src.url
      ? ` &nbsp;&middot;&nbsp; Kilde: <a href="${scale.src.url}" target="_blank" rel="noopener">${scale.src.name}</a>`
      : ` &nbsp;&middot;&nbsp; Kilde: ${scale.src.name}`;
  }
  scaleBadge.innerHTML = scale.name + srcHtml;
  scaleBadge.classList.remove('hidden');

  if (scale.type === 'linear') {
    document.getElementById('linearWarnText').textContent = scale.warn || '';
    linearWarnWrap.classList.toggle('hidden', !scale.warn);
    linearConfigWrap.classList.toggle('hidden', scale.minPass !== null);
    refTableWrap.classList.add('hidden');
    return;
  }

  linearWarnWrap.classList.add('hidden');
  linearConfigWrap.classList.add('hidden');
  refTableBody.innerHTML = '';
  scale.grades.forEach(g => {
    const tr = document.createElement('tr');
    if (g.value === null) tr.classList.add('fail-row');
    const norskStr    = g.value !== null ? g.value.toString().replace('.', ',') : 'Stryk';
    const norskLetter = g.value !== null ? toNorwegianGrade(g.value).letter : 'F';
    tr.innerHTML = `<td>${g.label}</td><td>${norskStr}</td><td>${norskLetter}</td>`;
    refTableBody.appendChild(tr);
  });
  refTableWrap.classList.remove('hidden');
}

/* ── Course row ── */
function buildRow(course) {
  const grades = getGrades();
  const tr = document.createElement('tr');
  tr.dataset.id = course.id;

  // Name
  const tdName = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'f.eks. Matematikk 1';
  nameInput.value = course.name;
  nameInput.addEventListener('input', () => { course.name = nameInput.value; });
  tdName.appendChild(nameInput);

  // Grade
  const tdGrade = document.createElement('td');
  const scale = getScale();

  if (scale && scale.type === 'linear') {
    const li = document.createElement('input');
    li.type = 'text';
    li.inputMode = 'decimal';
    li.placeholder = scale.laudGrade ? `18–30 / 30L` : 'Karakter';
    li.style.cssText = 'width:110px;';
    function parseLinearInput(raw) {
      if (!raw) return null;
      const s = raw.trim();
      if (scale.laudGrade && /^\d+[lL]$/.test(s)) return scale.laudGrade;
      const v = parseFloat(s.replace(',', '.'));
      return isNaN(v) ? null : v;
    }
    if (course.gradeRaw !== null) {
      li.value = (scale.laudGrade && course.gradeRaw === scale.laudGrade)
        ? `${scale.laudGrade - 1}L`
        : String(course.gradeRaw).replace('.', ',');
    }
    li.addEventListener('input', () => {
      course.gradeRaw = parseLinearInput(li.value);
      updateNorskCell(tr, course);
      recalculate();
      maybeAutoAddRow();
    });
    tdGrade.appendChild(li);
  } else {
    const gradeSelect = document.createElement('select');
    const phOpt = document.createElement('option');
    phOpt.value = '';
    phOpt.textContent = '– Velg karakter –';
    gradeSelect.appendChild(phOpt);
    grades.forEach((g, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = g.label;
      gradeSelect.appendChild(opt);
    });
    if (course.gradeIdx !== null) gradeSelect.value = course.gradeIdx;
    gradeSelect.addEventListener('change', () => {
      course.gradeIdx = gradeSelect.value === '' ? null : parseInt(gradeSelect.value, 10);
      updateNorskCell(tr, course);
      recalculate();
      maybeAutoAddRow();
    });

    if (isNumericScale(grades)) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;gap:0.25rem;';
      const numInput = document.createElement('input');
      numInput.type = 'text';
      numInput.inputMode = 'decimal';
      numInput.placeholder = 'Skriv inn tallkarakter';
      numInput.className = 'num-grade-input';
      numInput.addEventListener('input', () => {
        const v = parseFloat(numInput.value.replace(',', '.'));
        if (!isNaN(v)) {
          const idx = findGradeIndexByNumeric(grades, v);
          if (idx >= 0) {
            gradeSelect.value = idx;
            course.gradeIdx = idx;
            updateNorskCell(tr, course);
            recalculate();
            maybeAutoAddRow();
          }
        }
      });
      wrapper.append(numInput, gradeSelect);
      tdGrade.appendChild(wrapper);
    } else {
      tdGrade.appendChild(gradeSelect);
    }
  }

  // Credits
  const tdCredits = document.createElement('td');
  const credInput = document.createElement('input');
  credInput.type = 'number';
  credInput.min = '0.5';
  credInput.step = '0.5';
  credInput.placeholder = 'sp';
  if (course.credits !== null) credInput.value = course.credits;
  credInput.addEventListener('input', () => {
    const v = parseFloat(credInput.value);
    course.credits = isNaN(v) || v <= 0 ? null : v;
    recalculate();
    maybeAutoAddRow();
  });
  tdCredits.appendChild(credInput);

  // Norsk value
  const tdNorsk = document.createElement('td');
  tdNorsk.id = `nv-${course.id}`;
  tdNorsk.textContent = '–';

  // Fagkrav checkbox
  const tdCore = document.createElement('td');
  tdCore.className = 'core-check';
  const coreChk = document.createElement('input');
  coreChk.type = 'checkbox';
  coreChk.checked = course.core;
  coreChk.title = 'Merk som fagkrav';
  coreChk.addEventListener('change', () => {
    course.core = coreChk.checked;
    recalculate();
  });
  tdCore.appendChild(coreChk);

  // Delete
  const tdDel = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-ghost';
  delBtn.title = 'Fjern emne';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', () => {
    courses = courses.filter(c => c.id !== course.id);
    tr.remove();
    recalculate();
    if (courses.length === 0) resultSection.classList.add('hidden');
  });
  tdDel.appendChild(delBtn);

  tr.append(tdName, tdGrade, tdCredits, tdNorsk, tdCore, tdDel);
  return tr;
}

function updateNorskCell(tr, course) {
  const td = tr.querySelector(`#nv-${course.id}`) || tr.cells[3];
  if (!td) return;
  if (isLinearScale()) {
    if (course.gradeRaw === null || course.gradeRaw === undefined) {
      td.textContent = '–'; td.className = ''; return;
    }
    const v = computeLinearValue(course.gradeRaw);
    if (v === undefined) { td.textContent = '–'; td.className = ''; return; }
    if (v === null) { td.textContent = 'Stryk'; td.className = 'val-fail'; }
    else { td.textContent = v.toFixed(2).replace('.', ','); td.className = 'val-pass'; }
    return;
  }
  if (course.gradeIdx === null || course.gradeIdx === undefined) {
    td.textContent = '–'; td.className = ''; return;
  }
  const grades = getGrades();
  const g = grades[course.gradeIdx];
  if (!g) { td.textContent = '–'; td.className = ''; return; }
  if (g.value === null) {
    td.textContent = 'Stryk'; td.className = 'val-fail';
  } else {
    td.textContent = g.value.toString().replace('.', ','); td.className = 'val-pass';
  }
}

function addCourse() {
  const course = { id: nextId++, name: '', gradeIdx: null, gradeRaw: null, credits: null, core: false };
  courses.push(course);
  courseTableBody.appendChild(buildRow(course));
}

function maybeAutoAddRow() {
  const last = courses[courses.length - 1];
  if (!last || last.credits === null) return;
  const hasGrade = isLinearScale() ? last.gradeRaw !== null : last.gradeIdx !== null;
  if (hasGrade) addCourse();
}

/* ── Recalculate result ── */
function calcStats(subset) {
  const linear = isLinearScale();
  const grades = linear ? [] : getGrades();
  let weightedSum = 0, passCredits = 0, failCredits = 0, anyEntry = false;
  subset.forEach(course => {
    if (course.credits === null) return;
    if (linear) {
      if (course.gradeRaw === null) return;
      const v = computeLinearValue(course.gradeRaw);
      if (v === undefined) return;
      anyEntry = true;
      if (v === null) failCredits += course.credits;
      else { weightedSum += v * course.credits; passCredits += course.credits; }
    } else {
      if (course.gradeIdx === null) return;
      const g = grades[course.gradeIdx];
      if (!g) return;
      anyEntry = true;
      if (g.value === null) failCredits += course.credits;
      else { weightedSum += g.value * course.credits; passCredits += course.credits; }
    }
  });
  return { weightedSum, passCredits, failCredits, anyEntry };
}

function renderStats(stats, els) {
  const { weightedSum, passCredits, failCredits, anyEntry } = stats;
  if (!anyEntry || (passCredits === 0 && failCredits === 0)) {
    els.numeric.textContent = '–'; els.letter.textContent = '–';
    els.letterDesc.textContent = ''; els.credits.textContent = '–';
    els.failCredits.textContent = '–';
    return false;
  }
  if (passCredits === 0) {
    els.numeric.textContent     = '–';
    els.letter.textContent      = 'F';
    els.letterDesc.textContent  = 'Stryk';
    els.credits.textContent     = '0 sp';
    els.failCredits.textContent = failCredits + ' sp';
    return true;
  }
  const avg = weightedSum / passCredits;
  const g   = toNorwegianGrade(avg);
  els.numeric.textContent     = avg.toFixed(2).replace('.', ',');
  els.letter.textContent      = g.letter;
  els.letterDesc.textContent  = g.desc;
  els.credits.textContent     = passCredits + ' sp';
  els.failCredits.textContent = failCredits > 0 ? failCredits + ' sp' : '0 sp';
  return true;
}

function recalculate() {
  const allStats    = calcStats(courses);
  const coreCourses = courses.filter(c => c.core);
  const hasCore     = coreCourses.length > 0 && coreCourses.some(c =>
    isLinearScale() ? c.gradeRaw !== null && c.credits !== null
                    : c.gradeIdx !== null && c.credits !== null);

  const visible = renderStats(allStats, {
    numeric: resNumeric, letter: resLetter, letterDesc: resLetterDesc,
    credits: resCredits, failCredits: resFailCredits
  });
  if (!visible) { resultSection.classList.add('hidden'); return; }

  document.getElementById('resHeading').textContent =
    hasCore ? 'Snitt – alle emner' : 'Beregnet norsk karaktersnitt';
  resultSection.classList.remove('hidden');

  if (hasCore) {
    renderStats(calcStats(coreCourses), {
      numeric:     document.getElementById('coreResNumeric'),
      letter:      document.getElementById('coreResLetter'),
      letterDesc:  document.getElementById('coreResLetterDesc'),
      credits:     document.getElementById('coreResCredits'),
      failCredits: document.getElementById('coreResFailCredits')
    });
    coreResultCard.classList.remove('hidden');
  } else {
    coreResultCard.classList.add('hidden');
  }
}

/* ── Reset courses ── */
function resetCourses() {
  courses = [];
  courseTableBody.innerHTML = '';
  resultSection.classList.add('hidden');
}

/* ── Country / scale event listeners ── */
countrySelect.addEventListener('change', () => {
  updateScaleSelector();
  updateScaleInfo();
  resetCourses();
  if (countrySelect.value) {
    courseCard.classList.remove('hidden');
    addCourse();
  } else {
    courseCard.classList.add('hidden');
  }
});

scaleSelect.addEventListener('change', () => {
  updateScaleInfo();
  resetCourses();
  addCourse();
});

addCourseBtn.addEventListener('click', addCourse);

/* ── Linear config inputs ── */
function onLinearConfigChange() {
  const mp = parseFloat(document.getElementById('linearMinPass').value.replace(',', '.'));
  const mx = parseFloat(document.getElementById('linearMaxGrade').value.replace(',', '.'));
  linearConfig.minPass  = isNaN(mp) ? null : mp;
  linearConfig.maxGrade = isNaN(mx) ? null : mx;
  courses.forEach(course => {
    const tr = courseTableBody.querySelector(`tr[data-id="${course.id}"]`);
    if (tr) updateNorskCell(tr, course);
  });
  recalculate();
}
document.getElementById('linearMinPass').addEventListener('input', onLinearConfigChange);
document.getElementById('linearMaxGrade').addEventListener('input', onLinearConfigChange);

/* ── Clear form ── */
document.getElementById('clearAllBtn').addEventListener('click', () => {
  countrySelect.value = '';
  scaleGroup.classList.add('hidden');
  scaleBadge.classList.add('hidden');
  refTableWrap.classList.add('hidden');
  linearWarnWrap.classList.add('hidden');
  linearConfigWrap.classList.add('hidden');
  linearConfig = { minPass: null, maxGrade: null };
  courseCard.classList.add('hidden');
  saveFormCard.classList.add('hidden');
  resetCourses();
});

/* ── Local storage ── */
const LS_KEY = 'karakteromregner_v1';

function getSaves() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function setSaves(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function saveCalc(sokernummer) {
  const country = getCountry();
  const scale   = getScale();
  if (!country || !scale) return;

  const linear   = scale.type === 'linear';
  const grades   = linear ? [] : getGrades();
  const scaleIdx = country.scales.length > 1 ? parseInt(scaleSelect.value, 10) || 0 : 0;
  const savedCourses = courses
    .filter(c => linear ? c.gradeRaw !== null && c.credits !== null
                        : c.gradeIdx !== null && c.credits !== null)
    .map(c => linear
      ? { name: c.name, gradeRaw: c.gradeRaw, credits: c.credits, core: c.core }
      : { name: c.name, gradeLabel: grades[c.gradeIdx]?.label ?? '',
          gradeValue: grades[c.gradeIdx]?.value ?? null, credits: c.credits, core: c.core }
    );
  const savedLinearConfig = (linear && scale.minPass === null) ? { ...linearConfig } : null;

  const avg = parseFloat(resNumeric.textContent.replace(',', '.'));
  const arr = getSaves();
  arr.unshift({
    id:           Date.now(),
    sokernummer,
    countryId:    country.id,
    countryName:  country.name,
    scaleIdx,
    scaleName:    scale.name,
    courses:      savedCourses,
    linearConfig: savedLinearConfig,
    avg:          isNaN(avg) ? null : avg,
    letter:       resLetter.textContent,
    passCredits:  parseFloat(resCredits.textContent)     || 0,
    failCredits:  parseFloat(resFailCredits.textContent) || 0,
    savedAt:      new Date().toISOString()
  });
  setSaves(arr);
  renderSaves();
}

function deleteSave(id) {
  setSaves(getSaves().filter(s => s.id !== id));
  renderSaves();
}

function loadSave(save) {
  countrySelect.value = save.countryId;
  updateScaleSelector();
  const country = getCountry();
  if (country && country.scales.length > 1) scaleSelect.value = save.scaleIdx;

  const scale  = getScale();
  const linear = scale && scale.type === 'linear';
  if (linear && save.linearConfig) {
    linearConfig = { ...save.linearConfig };
    const mpIn = document.getElementById('linearMinPass');
    const mxIn = document.getElementById('linearMaxGrade');
    if (mpIn) mpIn.value = linearConfig.minPass ?? '';
    if (mxIn) mxIn.value = linearConfig.maxGrade ?? '';
  }

  updateScaleInfo();
  resetCourses();
  courseCard.classList.remove('hidden');

  const grades = linear ? [] : getGrades();
  save.courses.forEach(sc => {
    const gIdx = linear ? -1 : grades.findIndex(g => g.label === sc.gradeLabel);
    const course = {
      id:       nextId++,
      name:     sc.name || '',
      gradeIdx: gIdx >= 0 ? gIdx : null,
      gradeRaw: sc.gradeRaw ?? null,
      credits:  sc.credits,
      core:     sc.core ?? false
    };
    courses.push(course);
    const tr = courseTableBody.appendChild(buildRow(course));
    updateNorskCell(tr, course);
  });

  recalculate();
  courseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSaves() {
  const arr       = getSaves();
  const savedCard = document.getElementById('savedCard');
  const tbody     = document.getElementById('savedTableBody');

  if (arr.length === 0) { savedCard.classList.add('hidden'); return; }
  savedCard.classList.remove('hidden');
  tbody.innerHTML = '';

  arr.forEach(s => {
    const tr  = document.createElement('tr');
    const dt  = new Date(s.savedAt);
    const dts = dt.toLocaleString('no-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const avgStr = s.avg !== null ? s.avg.toFixed(2).replace('.', ',') : '–';

    const nameTd = document.createElement('td');
    nameTd.innerHTML = `<strong>${s.sokernummer}</strong>`;

    const ctryTd = document.createElement('td');
    ctryTd.innerHTML = `${s.countryName}<br><span class="saved-country">${s.scaleName}</span>`;

    const avgTd    = document.createElement('td'); avgTd.textContent    = avgStr;
    const letterTd = document.createElement('td'); letterTd.textContent = s.letter;
    const dateTd   = document.createElement('td');
    dateTd.style.fontSize = '0.8rem';
    dateTd.style.whiteSpace = 'nowrap';
    dateTd.textContent = dts;

    const actionTd = document.createElement('td');
    actionTd.className = 'saved-actions';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn-primary';
    loadBtn.style.cssText = 'font-size:0.78rem;padding:0.25rem 0.6rem;';
    loadBtn.textContent = 'Last inn';
    loadBtn.addEventListener('click', () => loadSave(s));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-ghost';
    delBtn.textContent = '✕';
    delBtn.title = 'Slett';
    delBtn.addEventListener('click', () => {
      if (confirm(`Slette lagret utregning for søkernummer «${s.sokernummer}»?`)) deleteSave(s.id);
    });

    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn';
    shareBtn.style.cssText = 'font-size:0.78rem;padding:0.25rem 0.6rem;border:1.5px solid var(--border);color:var(--text-muted);';
    shareBtn.textContent = 'Del';
    shareBtn.addEventListener('click', () => copyShareUrl(s, shareBtn));

    actionTd.append(loadBtn, shareBtn, delBtn);
    tr.append(nameTd, ctryTd, avgTd, letterTd, dateTd, actionTd);
    tbody.appendChild(tr);
  });
}

/* ── Save form ── */
const showSaveFormBtn = document.getElementById('showSaveFormBtn');
const sokerInput      = document.getElementById('sokerInput');
const confirmSaveBtn  = document.getElementById('confirmSaveBtn');
const cancelSaveBtn   = document.getElementById('cancelSaveBtn');

showSaveFormBtn.addEventListener('click', () => {
  saveFormCard.classList.remove('hidden');
  sokerInput.value = '';
  sokerInput.focus();
});
cancelSaveBtn.addEventListener('click', () => {
  saveFormCard.classList.add('hidden');
});
confirmSaveBtn.addEventListener('click', () => {
  const val = sokerInput.value.trim();
  if (!val) { sokerInput.focus(); return; }
  saveCalc(val);
  saveFormCard.classList.add('hidden');
});
sokerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  confirmSaveBtn.click();
  if (e.key === 'Escape') cancelSaveBtn.click();
});

/* ── Share link ── */
function objToB64(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  return btoa(Array.from(bytes, b => String.fromCodePoint(b)).join(''));
}
function b64ToObj(b64) {
  const bytes = Uint8Array.from(atob(b64), c => c.codePointAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function generateShareUrl(save) {
  const payload = {
    countryId:    save.countryId,
    countryName:  save.countryName,
    scaleIdx:     save.scaleIdx,
    scaleName:    save.scaleName,
    courses:      save.courses,
    linearConfig: save.linearConfig ?? null,
    avg:          save.avg,
    letter:       save.letter,
    passCredits:  save.passCredits,
    failCredits:  save.failCredits,
    savedAt:      save.savedAt
  };
  return `${location.origin}${location.pathname}#share=${objToB64(payload)}`;
}

async function copyShareUrl(save, btn) {
  const url = generateShareUrl(save);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    prompt('Kopier delingslenken:', url);
    return;
  }
  const orig = btn.textContent;
  btn.textContent = 'Kopiert ✓';
  setTimeout(() => { btn.textContent = orig; }, 2000);
}

function loadShareFromUrl() {
  if (!location.hash.startsWith('#share=')) return;
  try {
    const save = b64ToObj(location.hash.slice(7));
    history.replaceState(null, '', location.pathname);
    loadSave(save);
    const banner = document.createElement('div');
    banner.className = 'notice';
    banner.style.marginBottom = '1rem';
    banner.textContent = 'Delt resultat — ikke lagret lokalt. Bruk «Lagre utregning» om du vil beholde det.';
    document.querySelector('main').prepend(banner);
    setTimeout(() => banner.remove(), 10000);
  } catch {
    /* ugyldig lenke – ignorer */
  }
}

/* ── Init ── */
renderSaves();
loadShareFromUrl();

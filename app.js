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

/* ── Global state ── */
let sections      = [];
let nextSectionId = 0;
let nextCourseId  = 0;

/* ── Static DOM refs ── */
const sectionsContainer = document.getElementById('sectionsContainer');
const addSectionBtn     = document.getElementById('addSectionBtn');
const resultSection     = document.getElementById('resultSection');
const resNumeric        = document.getElementById('resNumeric');
const resLetter         = document.getElementById('resLetter');
const resLetterDesc     = document.getElementById('resLetterDesc');
const resCredits        = document.getElementById('resCredits');
const resFailCredits    = document.getElementById('resFailCredits');
const coreResultCard    = document.getElementById('coreResultCard');
const saveFormCard      = document.getElementById('saveFormCard');

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
  // First pass: exact interval match
  for (let i = 0; i < grades.length; i++) {
    const iv = parseInterval(grades[i].label);
    if (iv && val >= iv.lo && val <= iv.hi) return i;
  }
  // Second pass: threshold-based
  for (let i = 0; i < grades.length; i++) {
    const t = parseThreshold(grades[i].label);
    if (t === null) continue;
    if (t === -Infinity || val >= t) return i;
  }
  return -1;
}

/* ── Per-section scale helpers (all take ctx) ── */
function getCountry(ctx) {
  return COUNTRIES.find(c => c.id === ctx.countrySelect.value) || null;
}
function getScale(ctx) {
  const c = getCountry(ctx);
  if (!c) return null;
  const idx = c.scales.length > 1 ? parseInt(ctx.scaleSelect.value, 10) : 0;
  return c.scales[idx] || c.scales[0];
}
function getGrades(ctx) {
  const s = getScale(ctx);
  return s ? (s.grades || []) : [];
}
function isLinearScale(ctx) {
  const s = getScale(ctx);
  return !!(s && (s.type === 'linear' || s.type === 'linear_inv'));
}
function isLinearInvScale(ctx) {
  const s = getScale(ctx);
  return !!(s && s.type === 'linear_inv');
}
function computeLinearValue(raw, ctx) {
  const s = getScale(ctx);
  if (!s || s.type !== 'linear') return undefined;
  const minPass  = s.minPass  !== null ? s.minPass  : ctx.linearConfig.minPass;
  const maxGrade = s.maxGrade !== null ? s.maxGrade : ctx.linearConfig.maxGrade;
  if (minPass === null || maxGrade === null || raw === null || raw === undefined) return undefined;
  if (raw < minPass) return null;
  if (maxGrade <= minPass) return 5;
  return Math.min(5, 1 + (raw - minPass) / (maxGrade - minPass) * 4);
}
function computeLinearInvValue(raw, ctx) {
  const s = getScale(ctx);
  if (!s || s.type !== 'linear_inv') return undefined;
  const bestGrade = s.bestGrade != null ? s.bestGrade : ctx.linearConfig.minPass;
  const maxPass   = s.maxPass   != null ? s.maxPass   : ctx.linearConfig.maxGrade;
  if (bestGrade === null || maxPass === null || raw === null || raw === undefined) return undefined;
  if (raw > maxPass) return null;
  if (maxPass <= bestGrade) return 5;
  return Math.min(5, 1 + (maxPass - raw) / (maxPass - bestGrade) * 4);
}
function computeCurrentLinearValue(raw, ctx) {
  return isLinearInvScale(ctx) ? computeLinearInvValue(raw, ctx) : computeLinearValue(raw, ctx);
}

/* ── Section factory ── */
function createSection() {
  const sId = nextSectionId++;
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.dataset.sectionId = sId;

  // Title
  const titleRow = document.createElement('div');
  titleRow.className = 'card-title';
  titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
  const titleSpan = document.createElement('span');
  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-ghost';
  delBtn.style.cssText = 'font-size:0.78rem;padding:0.2rem 0.6rem;border-color:var(--border);color:var(--text-muted);';
  delBtn.textContent = 'Fjern seksjon';
  delBtn.hidden = true;
  titleRow.append(titleSpan, delBtn);
  wrap.appendChild(titleRow);

  // Country + scale
  const formRow = document.createElement('div');
  formRow.className = 'form-row';

  const countryGroup = document.createElement('div');
  countryGroup.className = 'form-group';
  const countryLabel = document.createElement('label');
  countryLabel.textContent = 'Land';
  const countrySelect = document.createElement('select');
  const phOpt = document.createElement('option');
  phOpt.value = '';
  phOpt.textContent = '– Velg land –';
  countrySelect.appendChild(phOpt);
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    countrySelect.appendChild(opt);
  });
  countryGroup.append(countryLabel, countrySelect);

  const scaleGroup = document.createElement('div');
  scaleGroup.className = 'form-group hidden';
  const scaleLabel = document.createElement('label');
  scaleLabel.textContent = 'Karakterskala';
  const scaleSelect = document.createElement('select');
  scaleGroup.append(scaleLabel, scaleSelect);

  formRow.append(countryGroup, scaleGroup);
  wrap.appendChild(formRow);

  // Scale badge
  const scaleBadge = document.createElement('div');
  scaleBadge.className = 'scale-badge hidden';
  wrap.appendChild(scaleBadge);

  // Linear warn
  const linearWarnWrap = document.createElement('div');
  linearWarnWrap.className = 'hidden';
  linearWarnWrap.style.marginTop = '0.75rem';
  const linearWarnText = document.createElement('div');
  linearWarnText.className = 'notice';
  linearWarnWrap.appendChild(linearWarnText);
  wrap.appendChild(linearWarnWrap);

  // Linear config
  const linearConfigWrap = document.createElement('div');
  linearConfigWrap.className = 'hidden';
  linearConfigWrap.style.marginTop = '0.75rem';
  const linearConfigRow = document.createElement('div');
  linearConfigRow.className = 'form-row';

  const minPassGroup = document.createElement('div');
  minPassGroup.className = 'form-group';
  const linearMinPassLabel = document.createElement('label');
  linearMinPassLabel.textContent = 'Laveste bestått';
  const linearMinPassInput = document.createElement('input');
  linearMinPassInput.type = 'number';
  linearMinPassInput.step = 'any';
  linearMinPassInput.placeholder = 'f.eks. 10';
  minPassGroup.append(linearMinPassLabel, linearMinPassInput);

  const maxGradeGroup = document.createElement('div');
  maxGradeGroup.className = 'form-group';
  const linearMaxGradeLabel = document.createElement('label');
  linearMaxGradeLabel.textContent = 'Høyeste karakter';
  const linearMaxGradeInput = document.createElement('input');
  linearMaxGradeInput.type = 'number';
  linearMaxGradeInput.step = 'any';
  linearMaxGradeInput.placeholder = 'f.eks. 100';
  maxGradeGroup.append(linearMaxGradeLabel, linearMaxGradeInput);

  linearConfigRow.append(minPassGroup, maxGradeGroup);
  linearConfigWrap.appendChild(linearConfigRow);
  wrap.appendChild(linearConfigWrap);

  // Ref table
  const refTableWrap = document.createElement('div');
  refTableWrap.className = 'hidden';
  refTableWrap.style.marginTop = '1rem';
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Vis omregningstabellen for valgt skala';
  const refTableEl = document.createElement('table');
  refTableEl.className = 'ref-table';
  refTableEl.innerHTML = '<thead><tr><th>Utenlandsk karakter</th><th>Norsk verdi</th><th>Norsk bokstav</th></tr></thead>';
  const refTableBody = document.createElement('tbody');
  refTableEl.appendChild(refTableBody);
  details.append(summary, refTableEl);
  refTableWrap.appendChild(details);
  wrap.appendChild(refTableWrap);

  // Course section (hidden until country chosen)
  const courseSection = document.createElement('div');
  courseSection.className = 'hidden';

  const hr = document.createElement('hr');
  hr.style.cssText = 'border:none;border-top:1px solid var(--border);margin:1.25rem 0 1rem;';
  courseSection.appendChild(hr);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';
  const courseTable = document.createElement('table');
  courseTable.id = `courseTable-${sId}`;
  courseTable.innerHTML = `<thead><tr>
    <th>Emne (valgfritt)</th>
    <th>Karakter</th>
    <th>Studiepoeng (ECTS)</th>
    <th>Norsk verdi</th>
    <th title="Merk fagkrav for separat snittberegning">Fagkrav</th>
    <th></th>
  </tr></thead>`;
  const courseTableBody = document.createElement('tbody');
  courseTable.appendChild(courseTableBody);
  tableWrap.appendChild(courseTable);
  courseSection.appendChild(tableWrap);

  const addRow = document.createElement('div');
  addRow.className = 'add-row';
  const addCourseBtn = document.createElement('button');
  addCourseBtn.className = 'btn btn-primary';
  addCourseBtn.textContent = '+ Legg til emne';
  addRow.appendChild(addCourseBtn);
  courseSection.appendChild(addRow);

  const notice = document.createElement('div');
  notice.className = 'notice';
  notice.innerHTML = `Omregningstabellene er veiledende. Studier med uvanlige karakterskalaer vurderes individuelt.
    Kilder: <a href="https://www.uis.no/nb/studier/omregning-av-karaktersystem" target="_blank" rel="noopener">UiS</a>,
    <a href="https://www.oslomet.no/studier/soknad-og-opptak/poengberegning-rangeringsregler/omregning-av-karakterer" target="_blank" rel="noopener">OsloMet</a>
    og NMBU/Opptakskontoret. Kilde per skala vises i skalabadgen over.`;
  courseSection.appendChild(notice);
  wrap.appendChild(courseSection);

  // Context object
  const ctx = {
    id: sId,
    wrap,
    titleSpan,
    countrySelect,
    scaleSelect,
    scaleGroup,
    scaleBadge,
    linearWarnWrap,
    linearWarnText,
    linearConfigWrap,
    linearMinPassLabel,
    linearMaxGradeLabel,
    linearMinPassInput,
    linearMaxGradeInput,
    refTableWrap,
    refTableBody,
    courseSection,
    courseTableBody,
    addCourseBtn,
    sectionDelBtn: delBtn,
    courses: [],
    linearConfig: { minPass: null, maxGrade: null }
  };

  // Events
  countrySelect.addEventListener('change', () => {
    updateScaleSelector(ctx);
    updateScaleInfo(ctx);
    resetCourses(ctx);
    if (countrySelect.value) {
      courseSection.classList.remove('hidden');
      addCourse(ctx);
    } else {
      courseSection.classList.add('hidden');
    }
  });
  scaleSelect.addEventListener('change', () => {
    updateScaleInfo(ctx);
    resetCourses(ctx);
    addCourse(ctx);
  });
  addCourseBtn.addEventListener('click', () => addCourse(ctx));
  linearMinPassInput.addEventListener('input', () => onLinearConfigChange(ctx));
  linearMaxGradeInput.addEventListener('input', () => onLinearConfigChange(ctx));
  delBtn.addEventListener('click', () => {
    sections = sections.filter(s => s.id !== ctx.id);
    ctx.wrap.remove();
    updateSectionUI();
    recalculate();
  });

  sections.push(ctx);
  sectionsContainer.appendChild(wrap);
  updateSectionUI();
  return ctx;
}

function updateSectionUI() {
  const multi = sections.length > 1;
  sections.forEach((ctx, i) => {
    ctx.sectionDelBtn.hidden = !multi;
    ctx.titleSpan.textContent = multi
      ? `Land og karakterskala (${i + 1})`
      : 'Land og karakterskala';
  });
}

/* ── Scale selector ── */
function updateScaleSelector(ctx) {
  const c = getCountry(ctx);
  ctx.scaleGroup.classList.toggle('hidden', !c || c.scales.length <= 1);
  if (c && c.scales.length > 1) {
    ctx.scaleSelect.innerHTML = '';
    c.scales.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = s.name;
      ctx.scaleSelect.appendChild(opt);
    });
  }
}

/* ── Scale badge + reference table ── */
function updateScaleInfo(ctx) {
  const scale = getScale(ctx);
  if (!scale) {
    ctx.scaleBadge.classList.add('hidden');
    ctx.refTableWrap.classList.add('hidden');
    ctx.linearWarnWrap.classList.add('hidden');
    ctx.linearConfigWrap.classList.add('hidden');
    return;
  }

  let srcHtml = '';
  if (scale.src) {
    srcHtml = scale.src.url
      ? ` &nbsp;&middot;&nbsp; Kilde: <a href="${scale.src.url}" target="_blank" rel="noopener">${scale.src.name}</a>`
      : ` &nbsp;&middot;&nbsp; Kilde: ${scale.src.name}`;
  }
  ctx.scaleBadge.innerHTML = scale.name + srcHtml;
  ctx.scaleBadge.classList.remove('hidden');

  if (scale.type === 'linear' || scale.type === 'linear_inv') {
    if (scale.type === 'linear_inv') {
      ctx.linearMinPassLabel.textContent = 'Beste karakter (laveste tall)';
      ctx.linearMaxGradeLabel.textContent = 'Høyeste bestått';
    } else {
      ctx.linearMinPassLabel.textContent = 'Laveste bestått';
      ctx.linearMaxGradeLabel.textContent = 'Høyeste karakter';
    }
    ctx.linearWarnText.textContent = scale.warn || '';
    ctx.linearWarnWrap.classList.toggle('hidden', !scale.warn);
    const hasFixed = scale.type === 'linear' ? scale.minPass !== null : scale.bestGrade != null;
    ctx.linearConfigWrap.classList.toggle('hidden', hasFixed);
    ctx.refTableWrap.classList.add('hidden');
    return;
  }

  ctx.linearWarnWrap.classList.add('hidden');
  ctx.linearConfigWrap.classList.add('hidden');
  ctx.refTableBody.innerHTML = '';
  scale.grades.forEach(g => {
    const tr = document.createElement('tr');
    if (g.value === null) tr.classList.add('fail-row');
    const norskStr    = g.value !== null ? g.value.toString().replace('.', ',') : 'Stryk';
    const norskLetter = g.value !== null ? toNorwegianGrade(g.value).letter : 'F';
    tr.innerHTML = `<td>${g.label}</td><td>${norskStr}</td><td>${norskLetter}</td>`;
    ctx.refTableBody.appendChild(tr);
  });
  ctx.refTableWrap.classList.remove('hidden');
}

/* ── Linear config ── */
function onLinearConfigChange(ctx) {
  const mp = parseFloat(ctx.linearMinPassInput.value.replace(',', '.'));
  const mx = parseFloat(ctx.linearMaxGradeInput.value.replace(',', '.'));
  ctx.linearConfig.minPass  = isNaN(mp) ? null : mp;
  ctx.linearConfig.maxGrade = isNaN(mx) ? null : mx;
  ctx.courses.forEach(course => {
    const tr = ctx.courseTableBody.querySelector(`tr[data-id="${course.id}"]`);
    if (tr) updateNorskCell(tr, course, ctx);
  });
  recalculate();
}

/* ── Course row ── */
function buildRow(course, ctx) {
  const grades = getGrades(ctx);
  const tr = document.createElement('tr');
  tr.dataset.id = course.id;

  // Tab order: grade → credits per row; names after all rows
  const localIdx    = ctx.courses.indexOf(course);
  const sBase       = (ctx.id + 1) * 10000;
  const gradeTabIdx = sBase + localIdx * 2 + 1;
  const credTabIdx  = sBase + localIdx * 2 + 2;
  const nameTabIdx  = sBase + 5000 + localIdx;

  // Name
  const tdName = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'f.eks. Matematikk 1';
  nameInput.value = course.name;
  nameInput.tabIndex = nameTabIdx;
  nameInput.addEventListener('input', () => { course.name = nameInput.value; });
  tdName.appendChild(nameInput);

  // Grade
  const tdGrade = document.createElement('td');
  const scale = getScale(ctx);

  if (scale && (scale.type === 'linear' || scale.type === 'linear_inv')) {
    const li = document.createElement('input');
    li.type = 'text';
    li.inputMode = 'decimal';
    li.placeholder = scale.laudGrade ? `18–30 / 30L` : 'Karakter';
    li.style.cssText = 'width:110px;';
    li.tabIndex = gradeTabIdx;
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
      updateNorskCell(tr, course, ctx);
      recalculate();
      maybeAutoAddRow(ctx);
    });
    tdGrade.appendChild(li);
  } else {
    const gradeSelect = document.createElement('select');
    gradeSelect.tabIndex = gradeTabIdx;
    const phOpt2 = document.createElement('option');
    phOpt2.value = '';
    phOpt2.textContent = '– Velg karakter –';
    gradeSelect.appendChild(phOpt2);
    grades.forEach((g, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = g.label;
      gradeSelect.appendChild(opt);
    });
    if (course.gradeIdx !== null) gradeSelect.value = course.gradeIdx;
    gradeSelect.addEventListener('change', () => {
      course.gradeIdx = gradeSelect.value === '' ? null : parseInt(gradeSelect.value, 10);
      updateNorskCell(tr, course, ctx);
      recalculate();
      maybeAutoAddRow(ctx);
    });

    if (isNumericScale(grades)) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;gap:0.25rem;';
      const numInput = document.createElement('input');
      numInput.type = 'text';
      numInput.inputMode = 'decimal';
      numInput.placeholder = 'Skriv inn tallkarakter';
      numInput.className = 'num-grade-input';
      numInput.tabIndex = gradeTabIdx;
      gradeSelect.tabIndex = -1; // driven by numInput
      numInput.addEventListener('input', () => {
        const v = parseFloat(numInput.value.replace(',', '.'));
        if (!isNaN(v)) {
          const idx = findGradeIndexByNumeric(grades, v);
          if (idx >= 0) {
            gradeSelect.value = idx;
            course.gradeIdx = idx;
            updateNorskCell(tr, course, ctx);
            recalculate();
            maybeAutoAddRow(ctx);
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
  credInput.tabIndex = credTabIdx;
  if (course.credits !== null) credInput.value = course.credits;
  credInput.addEventListener('input', () => {
    const v = parseFloat(credInput.value);
    course.credits = isNaN(v) || v <= 0 ? null : v;
    recalculate();
    maybeAutoAddRow(ctx);
  });
  tdCredits.appendChild(credInput);

  // Norsk value
  const tdNorsk = document.createElement('td');
  tdNorsk.id = `nv-${course.id}`;
  tdNorsk.textContent = '–';

  // Fagkrav
  const tdCore = document.createElement('td');
  tdCore.className = 'core-check';
  const coreChk = document.createElement('input');
  coreChk.type = 'checkbox';
  coreChk.checked = course.core;
  coreChk.tabIndex = -1;
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
  delBtn.tabIndex = -1;
  delBtn.addEventListener('click', () => {
    ctx.courses = ctx.courses.filter(c => c.id !== course.id);
    tr.remove();
    recalculate();
    const anyEntry = sections.some(s => s.courses.some(c =>
      isLinearScale(s) ? c.gradeRaw !== null && c.credits !== null
                       : c.gradeIdx !== null && c.credits !== null));
    if (!anyEntry) resultSection.classList.add('hidden');
  });
  tdDel.appendChild(delBtn);

  tr.append(tdName, tdGrade, tdCredits, tdNorsk, tdCore, tdDel);
  return tr;
}

function updateNorskCell(tr, course, ctx) {
  const td = tr.querySelector(`#nv-${course.id}`) || tr.cells[3];
  if (!td) return;
  if (isLinearScale(ctx)) {
    if (course.gradeRaw === null || course.gradeRaw === undefined) {
      td.textContent = '–'; td.className = ''; return;
    }
    const v = computeCurrentLinearValue(course.gradeRaw, ctx);
    if (v === undefined) { td.textContent = '–'; td.className = ''; return; }
    if (v === null) { td.textContent = 'Stryk'; td.className = 'val-fail'; }
    else { td.textContent = v.toFixed(2).replace('.', ','); td.className = 'val-pass'; }
    return;
  }
  if (course.gradeIdx === null || course.gradeIdx === undefined) {
    td.textContent = '–'; td.className = ''; return;
  }
  const grades = getGrades(ctx);
  const g = grades[course.gradeIdx];
  if (!g) { td.textContent = '–'; td.className = ''; return; }
  if (g.value === null) {
    td.textContent = 'Stryk'; td.className = 'val-fail';
  } else {
    td.textContent = g.value.toString().replace('.', ','); td.className = 'val-pass';
  }
}

function addCourse(ctx) {
  const course = { id: nextCourseId++, name: '', gradeIdx: null, gradeRaw: null, credits: null, core: false };
  ctx.courses.push(course);
  ctx.courseTableBody.appendChild(buildRow(course, ctx));
}

function maybeAutoAddRow(ctx) {
  const last = ctx.courses[ctx.courses.length - 1];
  if (!last || last.credits === null) return;
  const hasGrade = isLinearScale(ctx) ? last.gradeRaw !== null : last.gradeIdx !== null;
  if (hasGrade) addCourse(ctx);
}

/* ── Recalculate (combined across all sections) ── */
function sectionToItems(ctx) {
  const linear = isLinearScale(ctx);
  const grades = linear ? [] : getGrades(ctx);
  const items = [], coreItems = [];
  ctx.courses.forEach(course => {
    if (course.credits === null) return;
    let value, isFail;
    if (linear) {
      if (course.gradeRaw === null) return;
      const v = computeCurrentLinearValue(course.gradeRaw, ctx);
      if (v === undefined) return;
      isFail = (v === null);
      value = isFail ? 0 : v;
    } else {
      if (course.gradeIdx === null) return;
      const g = grades[course.gradeIdx];
      if (!g) return;
      isFail = (g.value === null);
      value = isFail ? 0 : g.value;
    }
    const item = { value, credits: course.credits, isFail, core: course.core };
    items.push(item);
    if (course.core) coreItems.push(item);
  });
  return { items, coreItems };
}

function calcStats(items) {
  let weightedSum = 0, passCredits = 0, failCredits = 0, anyEntry = false;
  items.forEach(({ value, credits, isFail }) => {
    anyEntry = true;
    if (isFail) failCredits += credits;
    else { weightedSum += value * credits; passCredits += credits; }
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
  let allItems = [], coreItems = [];
  sections.forEach(ctx => {
    const { items, coreItems: ci } = sectionToItems(ctx);
    allItems = allItems.concat(items);
    coreItems = coreItems.concat(ci);
  });

  const hasCore = coreItems.length > 0;
  const visible = renderStats(calcStats(allItems), {
    numeric: resNumeric, letter: resLetter, letterDesc: resLetterDesc,
    credits: resCredits, failCredits: resFailCredits
  });
  if (!visible) { resultSection.classList.add('hidden'); return; }

  document.getElementById('resHeading').textContent =
    hasCore ? 'Snitt – alle emner' : 'Beregnet norsk karaktersnitt';
  resultSection.classList.remove('hidden');

  if (hasCore) {
    renderStats(calcStats(coreItems), {
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

function resetCourses(ctx) {
  ctx.courses = [];
  ctx.courseTableBody.innerHTML = '';
  recalculate();
}

/* ── Local storage ── */
const LS_KEY = 'karakteromregner_v1';

function getSaves() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function setSaves(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function normalizeSave(save) {
  if (save.sections) return save;
  // Backward compat: old single-section format
  return {
    ...save,
    sections: [{
      countryId:    save.countryId,
      countryName:  save.countryName,
      scaleIdx:     save.scaleIdx    ?? 0,
      scaleName:    save.scaleName   ?? '',
      courses:      save.courses     ?? [],
      linearConfig: save.linearConfig ?? null
    }]
  };
}

function saveCalc(sokernummer) {
  const savedSections = sections.map(ctx => {
    const country = getCountry(ctx);
    const scale   = getScale(ctx);
    if (!country || !scale) return null;
    const linear   = scale.type === 'linear' || scale.type === 'linear_inv';
    const grades   = linear ? [] : getGrades(ctx);
    const scaleIdx = country.scales.length > 1 ? parseInt(ctx.scaleSelect.value, 10) || 0 : 0;
    const savedCourses = ctx.courses
      .filter(c => linear ? c.gradeRaw !== null && c.credits !== null
                          : c.gradeIdx !== null && c.credits !== null)
      .map(c => linear
        ? { name: c.name, gradeRaw: c.gradeRaw, credits: c.credits, core: c.core }
        : { name: c.name, gradeLabel: grades[c.gradeIdx]?.label ?? '',
            gradeValue: grades[c.gradeIdx]?.value ?? null, credits: c.credits, core: c.core }
      );
    const needsConfig = linear && (
      (scale.type === 'linear'     && scale.minPass   === null) ||
      (scale.type === 'linear_inv' && scale.bestGrade == null)
    );
    return {
      countryId:    country.id,
      countryName:  country.name,
      scaleIdx,
      scaleName:    scale.name,
      courses:      savedCourses,
      linearConfig: needsConfig ? { ...ctx.linearConfig } : null
    };
  }).filter(Boolean);

  if (savedSections.length === 0) return;

  const avg = parseFloat(resNumeric.textContent.replace(',', '.'));
  const arr = getSaves();
  arr.unshift({
    id:           Date.now(),
    sokernummer,
    sections:     savedSections,
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
  const normalized = normalizeSave(save);

  // Remove existing sections
  sections.forEach(ctx => ctx.wrap.remove());
  sections = [];

  normalized.sections.forEach(sec => {
    const ctx = createSection();
    ctx.countrySelect.value = sec.countryId;
    updateScaleSelector(ctx);
    const country = getCountry(ctx);
    if (country && country.scales.length > 1) ctx.scaleSelect.value = sec.scaleIdx;

    const scale  = getScale(ctx);
    const linear = scale && (scale.type === 'linear' || scale.type === 'linear_inv');
    if (linear && sec.linearConfig) {
      ctx.linearConfig = { ...sec.linearConfig };
      ctx.linearMinPassInput.value  = ctx.linearConfig.minPass  ?? '';
      ctx.linearMaxGradeInput.value = ctx.linearConfig.maxGrade ?? '';
    }

    updateScaleInfo(ctx);
    resetCourses(ctx);
    ctx.courseSection.classList.remove('hidden');

    const grades = linear ? [] : getGrades(ctx);
    sec.courses.forEach(sc => {
      const gIdx = linear ? -1 : grades.findIndex(g => g.label === sc.gradeLabel);
      const course = {
        id:       nextCourseId++,
        name:     sc.name || '',
        gradeIdx: gIdx >= 0 ? gIdx : null,
        gradeRaw: sc.gradeRaw ?? null,
        credits:  sc.credits,
        core:     sc.core ?? false
      };
      ctx.courses.push(course);
      const tr = ctx.courseTableBody.appendChild(buildRow(course, ctx));
      updateNorskCell(tr, course, ctx);
    });
  });

  recalculate();
  sectionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSaves() {
  const arr       = getSaves();
  const savedCard = document.getElementById('savedCard');
  const tbody     = document.getElementById('savedTableBody');

  if (arr.length === 0) { savedCard.classList.add('hidden'); return; }
  savedCard.classList.remove('hidden');
  tbody.innerHTML = '';

  arr.forEach(s => {
    const normalized = normalizeSave(s);
    const tr  = document.createElement('tr');
    const dt  = new Date(s.savedAt);
    const dts = dt.toLocaleString('no-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const avgStr = s.avg !== null ? s.avg.toFixed(2).replace('.', ',') : '–';

    const countryStr = normalized.sections.map(sec => sec.countryName).join(', ');
    const scaleStr   = normalized.sections.map(sec => sec.scaleName).join(' / ');

    const nameTd = document.createElement('td');
    nameTd.innerHTML = `<strong>${s.sokernummer}</strong>`;

    const ctryTd = document.createElement('td');
    ctryTd.innerHTML = `${countryStr}<br><span class="saved-country">${scaleStr}</span>`;

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
cancelSaveBtn.addEventListener('click', () => saveFormCard.classList.add('hidden'));
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

/* ── Clear form ── */
document.getElementById('clearAllBtn').addEventListener('click', () => {
  sections.forEach(ctx => ctx.wrap.remove());
  sections = [];
  createSection();
  saveFormCard.classList.add('hidden');
  resultSection.classList.add('hidden');
});

/* ── Add section ── */
addSectionBtn.addEventListener('click', () => createSection());

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
  const normalized = normalizeSave(save);
  const payload = {
    sections:    normalized.sections,
    avg:         save.avg,
    letter:      save.letter,
    passCredits: save.passCredits,
    failCredits: save.failCredits,
    savedAt:     save.savedAt
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
    const payload = b64ToObj(location.hash.slice(7));
    history.replaceState(null, '', location.pathname);
    loadSave(payload);
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
createSection();
renderSaves();
loadShareFromUrl();

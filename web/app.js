/* ---------- slides ---------- */
const TOTAL = 8;
let cur = 0;
const slideEl = document.getElementById('slide');
const countEl = document.getElementById('count');
const stageEl = document.getElementById('stage');

function showSlide(n) {
  cur = Math.max(0, Math.min(TOTAL - 1, n));
  slideEl.src = `slides/slide${cur + 1}.png`;
  countEl.textContent = `${cur + 1} / ${TOTAL}`;
}
document.getElementById('prev').onclick = () => showSlide(cur - 1);
document.getElementById('next').onclick = () => showSlide(cur + 1);

function toggleFull() {
  if (!document.fullscreenElement) {
    document.body.classList.add('is-full');
    stageEl.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}
document.getElementById('full').onclick = toggleFull;
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) document.body.classList.remove('is-full');
});

document.addEventListener('keydown', (e) => {
  if (document.getElementById('view-slides').classList.contains('is-on')) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(cur - 1); }
    if (e.key === 'Home') showSlide(0);
    if (e.key === 'End') showSlide(TOTAL - 1);
    if (e.key === 'f' || e.key === 'F') toggleFull();
  }
});

/* ---------- tabs ---------- */
function activate(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.view === name;
    t.classList.toggle('is-on', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('is-on'));
  document.getElementById('view-' + name).classList.add('is-on');
  if (name === 'shell') document.getElementById('input').focus();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.onclick = () => {
    activate(tab.dataset.view);
    history.replaceState(null, '', '#' + tab.dataset.view);
  };
});

/* ---------- terminal state ---------- */
const termEl = document.getElementById('term');
const inputEl = document.getElementById('input');
const ps1El = document.getElementById('ps1');
const formEl = document.getElementById('entry');
const suggestEl = document.getElementById('suggest');

let demoRunning = false;
let history = [];
let hIndex = 0;
let S;

const seedGear = () => ([
  { id: 101, kind: 'Microscope',   name: 'Olympus CX23',   brand: 'Olympus',   spec: 'mag=1000x',    available: true, count: 0 },
  { id: 102, kind: 'Centrifuge',   name: 'Eppendorf 5424', brand: 'Eppendorf', spec: 'max=15000rpm', available: true, count: 0 },
  { id: 103, kind: 'Spectrometer', name: 'UV-1800',        brand: 'Shimadzu',  spec: 'range=1100nm', available: true, count: 0 },
]);

const seedUsers = () => ([
  { id: 1, name: 'Priyanshu',  role: 'Student',  year: 1, max: 2,  loan: 7,  fine: 10 },
  { id: 2, name: 'Arjun-Y2',   role: 'Student',  year: 2, max: 3,  loan: 7,  fine: 10 },
  { id: 3, name: 'Lakshit-Y3', role: 'Student',  year: 3, max: 4,  loan: 7,  fine: 10 },
  { id: 4, name: 'Gowda',      role: 'Faculty',           max: 5,  loan: 14, fine: 5  },
  { id: 5, name: 'Ansh',       role: 'LabAdmin',          max: 10, loan: 30, fine: 0  },
]);

function resetState() {
  S = {
    day: 1,
    login: null,
    mode: 'menu',
    bookings: [],
    nextBooking: 5001,
    nextGear: 104,
    gear: seedGear(),
    users: seedUsers(),
    tmp: {},
  };
  termEl.innerHTML = '';
  print('Shared Laboratory Equipment Booking System', 'head');
  print('Day=1. Users: 1 Priyanshu-Y1, 2 Arjun-Y2, 3 Lakshit-Y3, 4 Gowda, 5 Ansh.', 'dim');
  print('');
  showMenu();
  renderSuggestions();
}

function print(text = '', cls = '') {
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = text + '\n';
  termEl.appendChild(span);
  termEl.scrollTop = termEl.scrollHeight;
}

function printLines(lines, cls) {
  lines.forEach((l) => print(l, cls));
}

function classify(msg) {
  if (msg.startsWith('FAIL')) return 'bad';
  if (msg.startsWith('OK but')) return 'bad';
  if (msg.startsWith('OK')) return 'ok';
  return '';
}

function setMode(mode, label) {
  S.mode = mode;
  ps1El.textContent = label;
}

function showMenu() {
  print(`--- day ${S.day} user ${S.login === null ? 'none' : S.login} ---`, 'dim');
  printLines([
    '1 login  2 list gear  3 borrow  4 return  5 logs',
    '6 search word  7 search id  8 users  9 admin add  10 admin remove',
    '0 next day  -1 exit',
  ], 'dim');
  setMode('menu', 'pick:');
}

const gearLine = (e) =>
  `[${e.id}] ${e.name} (${e.kind}) brand=${e.brand} ${e.spec} ` +
  `${e.available ? 'FREE' : 'TAKEN'} borrowed=${e.count}x`;

const userLine = (u) =>
  `[${u.id}] ${u.name} (${u.role}${u.year ? ' year ' + u.year : ''} max=${u.max})`;

function listGear() {
  print(`--- gear list (${S.gear.length}) ---`, 'dim');
  if (!S.gear.length) return print('Empty. Admin can add via menu 9.', 'dim');
  S.gear.forEach((e) => print(gearLine(e)));
}

function listUsers() {
  print(`--- user list (${S.users.length}) ---`, 'dim');
  if (!S.users.length) return print('Empty. Nothing to show.', 'dim');
  S.users.forEach((u) => print(userLine(u)));
}

function listBookings() {
  print(`--- booking log (${S.bookings.length}) ---`, 'dim');
  if (!S.bookings.length) return print('No bookings yet. Borrow via menu 3.', 'dim');
  S.bookings.forEach((b) => {
    let line = `B${b.id} gear=${b.gear} user=${b.user} issue=${b.issue} due=${b.due}`;
    line += b.returned ? ` back=${b.returned} fine=${b.fine}` : ' OPEN';
    print(line);
  });
}

function openCount(userId) {
  return S.bookings.filter((b) => b.user === userId && !b.returned).length;
}

function holderOf(gearId) {
  const b = S.bookings.find((x) => x.gear === gearId && !x.returned);
  return b ? b.user : -1;
}

function login(id) {
  const u = S.users.find((x) => x.id === id);
  if (!u) {
    S.login = null;
    return `FAIL: no user with id ${id}. Valid ids are in menu 8. Try 1 to 5 from the seed list.`;
  }
  S.login = id;
  return `OK: logged in as ${userLine(u)}. Loan ${u.loan} days, max ${u.max}.`;
}

function borrow(gearId) {
  const u = S.users.find((x) => x.id === S.login);
  const e = S.gear.find((x) => x.id === gearId);
  if (!u) return 'FAIL: login first via menu 1.';
  if (!e) return `FAIL: no gear with id ${gearId}. See menu 2 for valid ids.`;
  if (!e.available) {
    const h = holderOf(gearId);
    return `FAIL: '${e.name}' is TAKEN${h >= 0 ? ' by user ' + h : ''}. Pick another id from menu 2.`;
  }
  const open = openCount(S.login);
  if (open >= u.max) {
    return `FAIL: ${u.name} (${u.role}) holds ${open}, max is ${u.max}. Return something first.`;
  }
  const b = {
    id: S.nextBooking++,
    gear: gearId,
    user: S.login,
    issue: S.day,
    due: S.day + u.loan,
    returned: null,
    fine: 0,
  };
  S.bookings.push(b);
  e.available = false;
  e.count += 1;
  return `OK: ${u.name} took '${e.name}' [${e.kind}] on day ${S.day}. Due day ${b.due} (loan ${u.loan} days for ${u.role}).`;
}

function giveBack(gearId) {
  const b = S.bookings.find(
    (x) => x.user === S.login && x.gear === gearId && !x.returned
  );
  if (!b) {
    return `FAIL: no OPEN booking for user ${S.login} + gear ${gearId}. Check menu 5 for open logs.`;
  }
  const u = S.users.find((x) => x.id === S.login);
  const rate = u ? u.fine : 10;
  b.returned = S.day;
  const late = Math.max(0, S.day - b.due);
  b.fine = late * rate;
  const e = S.gear.find((x) => x.id === gearId);
  if (e) e.available = true;
  if (late > 0) {
    return `OK but LATE: day ${S.day} is past due ${b.due}. Fine=${b.fine} (${late} ${late === 1 ? 'day' : 'days'} x ${rate}/day).`;
  }
  return `OK: returned on time on day ${S.day}. Due was ${b.due}. No fine.`;
}

function searchWord(k) {
  print(`--- search word '${k}' ---`, 'dim');
  const key = k.toLowerCase();
  const hits = S.gear.filter(
    (e) => e.name.toLowerCase().includes(key) || e.kind.toLowerCase().includes(key)
  );
  if (!hits.length) return print(`No match for '${k}'. Try 'Micro', 'Centri', or brand.`, 'dim');
  hits.forEach((e) => print(gearLine(e)));
}

function searchId(id) {
  print(`--- search id ${id} ---`, 'dim');
  const e = S.gear.find((x) => x.id === id);
  if (e) print(gearLine(e));
  else print(`FAIL: no gear with id ${id}. See menu 2 for live ids 101 and up.`, 'bad');
}

function addGear(kind, name, brand, value) {
  const k = String(kind).toLowerCase();
  const defaults = { microscope: 400, centrifuge: 10000, spectrometer: 1100 };
  if (!(k in defaults)) {
    return `FAIL: kind must be microscope, centrifuge, or spectrometer. Got '${kind}'.`;
  }
  const v = value > 0 ? value : defaults[k];
  const spec =
    k === 'microscope' ? `mag=${v}x` : k === 'centrifuge' ? `max=${v}rpm` : `range=${v}nm`;
  const label = k.charAt(0).toUpperCase() + k.slice(1);
  S.gear.push({
    id: S.nextGear++,
    kind: label,
    name,
    brand,
    spec,
    available: true,
    count: 0,
  });
  return `OK: added ${k} '${name}' brand '${brand}'.`;
}

function removeGear(id) {
  const i = S.gear.findIndex((x) => x.id === id);
  if (i < 0) return `FAIL: no gear with id ${id}. See menu 2 for live ids.`;
  if (!S.gear[i].available) return `FAIL: id ${id} is TAKEN. Return it before remove.`;
  const name = S.gear[i].name;
  S.gear.splice(i, 1);
  return `OK: removed id ${id} ('${name}').`;
}

/* ---------- menu handling ---------- */
function handle(line) {
  const v = String(line).trim();
  if (S.mode === 'done') {
    if (v.toLowerCase() === 'restart' || v === '-1') resetState();
    else print('Session ended. Press Restart to begin again.', 'dim');
    return;
  }

  switch (S.mode) {
    case 'menu': {
      if (v === '-1') {
        print('Bye. Log left on screen above.', 'dim');
        setMode('done', 'exit:');
        return;
      }
      if (v === '0') {
        S.day += 1;
        print(`OK: moved to day ${S.day}.`, 'ok');
        return showMenu();
      }
      if (v === '1') { listUsers(); return setMode('login', 'user id:'); }
      if (v === '2') { listGear(); return showMenu(); }
      if (v === '3') {
        if (S.login === null) { print('FAIL: login first via menu 1.', 'bad'); return showMenu(); }
        listGear();
        return setMode('borrow', 'equipment id:');
      }
      if (v === '4') {
        if (S.login === null) { print('FAIL: login first via menu 1.', 'bad'); return showMenu(); }
        return setMode('return', 'equipment id to give back:');
      }
      if (v === '5') { listBookings(); return showMenu(); }
      if (v === '6') { return setMode('searchw', 'word:'); }
      if (v === '7') { return setMode('searchid', 'id:'); }
      if (v === '8') { listUsers(); return showMenu(); }
      if (v === '9') {
        print('kinds: microscope / centrifuge / spectrometer', 'dim');
        return setMode('addkind', 'kind:');
      }
      if (v === '10') { listGear(); return setMode('remove', 'id to remove:'); }
      print(`FAIL: bad pick '${v}'. Use -1 to 10.`, 'bad');
      return showMenu();
    }

    case 'login': {
      const n = Number(v);
      if (!Number.isFinite(n)) {
        print(`FAIL: bad id '${v}'. Use a number from the list.`, 'bad');
        return showMenu();
      }
      const msg = login(n);
      print(msg, classify(msg));
      return showMenu();
    }

    case 'borrow': {
      const n = Number(v);
      if (!Number.isFinite(n)) { print(`FAIL: bad id '${v}'.`, 'bad'); return showMenu(); }
      const msg = borrow(n);
      print(msg, classify(msg));
      return showMenu();
    }

    case 'return': {
      const n = Number(v);
      if (!Number.isFinite(n)) { print(`FAIL: bad id '${v}'.`, 'bad'); return showMenu(); }
      const msg = giveBack(n);
      print(msg, classify(msg));
      return showMenu();
    }

    case 'searchw': {
      searchWord(v);
      return showMenu();
    }

    case 'searchid': {
      const n = Number(v);
      if (!Number.isFinite(n)) { print(`FAIL: bad id '${v}'.`, 'bad'); return showMenu(); }
      searchId(n);
      return showMenu();
    }

    case 'addkind': {
      S.tmp = { kind: v };
      return setMode('addname', 'name:');
    }
    case 'addname': {
      S.tmp.name = v;
      return setMode('addbrand', 'brand:');
    }
    case 'addbrand': {
      S.tmp.brand = v;
      return setMode('addspec', 'spec number (mag/rpm/nm, 0 = default):');
    }
    case 'addspec': {
      const n = Number(v);
      const msg = addGear(S.tmp.kind, S.tmp.name, S.tmp.brand, Number.isFinite(n) ? n : 0);
      print(msg, classify(msg));
      return showMenu();
    }

    case 'remove': {
      const n = Number(v);
      if (!Number.isFinite(n)) { print(`FAIL: bad id '${v}'.`, 'bad'); return showMenu(); }
      const msg = removeGear(n);
      print(msg, classify(msg));
      return showMenu();
    }
  }
}

/* ---------- suggestions ---------- */
function buildSuggestions() {
  if (S.mode === 'done') return [{ key: '', label: 'Restart', value: '__restart__' }];

  if (S.mode === 'menu') {
    const out = [{ key: '', label: 'Guided flow', value: '__demo__', primary: true }];
    if (S.login === null) {
      out.push({ key: '1', label: 'Login', value: '1' });
    } else {
      out.push({ key: '3', label: 'Borrow', value: '3' });
      out.push({ key: '4', label: 'Return', value: '4' });
    }
    out.push({ key: '2', label: 'List gear', value: '2' });
    out.push({ key: '5', label: 'Logs', value: '5' });
    out.push({ key: '6', label: 'Search', value: '6' });
    out.push({ key: '0', label: 'Next day', value: '0' });
    if (S.login !== null) out.push({ key: '1', label: 'Switch user', value: '1' });
    const u = S.users.find((x) => x.id === S.login);
    if (u && u.role === 'LabAdmin') {
      out.push({ key: '9', label: 'Add gear', value: '9' });
      out.push({ key: '10', label: 'Remove gear', value: '10' });
    }
    return out;
  }

  if (S.mode === 'login') {
    return S.users.map((u) => ({
      key: String(u.id),
      label: `${u.name} (${u.role === 'Student' ? 'year ' + u.year : u.role})`,
      value: String(u.id),
    }));
  }

  if (S.mode === 'borrow') {
    const free = S.gear.filter((g) => g.available);
    if (!free.length) return [];
    return free.map((g) => ({
      key: String(g.id),
      label: `${g.name} (${g.kind})`,
      value: String(g.id),
    }));
  }

  if (S.mode === 'return') {
    const open = S.bookings.filter((b) => b.user === S.login && !b.returned);
    return open.map((b) => {
      const g = S.gear.find((x) => x.id === b.gear);
      return {
        key: String(b.gear),
        label: `${g ? g.name : 'item'} (due day ${b.due})`,
        value: String(b.gear),
      };
    });
  }

  if (S.mode === 'searchw') {
    return ['Micro', 'Centri', 'Shimadzu'].map((k) => ({ key: '', label: k, value: k }));
  }

  if (S.mode === 'searchid') {
    return S.gear.slice(0, 3).map((g) => ({
      key: String(g.id),
      label: g.name,
      value: String(g.id),
    }));
  }

  if (S.mode === 'addkind') {
    return ['microscope', 'centrifuge', 'spectrometer'].map((k) => ({
      key: '',
      label: k,
      value: k,
    }));
  }
  if (S.mode === 'addname') return [{ key: '', label: 'DemoScope', value: 'DemoScope' }];
  if (S.mode === 'addbrand') return [{ key: '', label: 'Demo', value: 'Demo' }];
  if (S.mode === 'addspec') {
    return [
      { key: '0', label: 'default', value: '0' },
      { key: '', label: '1000', value: '1000' },
    ];
  }

  if (S.mode === 'remove') {
    return S.gear.filter((g) => g.available).map((g) => ({
      key: String(g.id),
      label: g.name,
      value: String(g.id),
    }));
  }

  return [];
}

function renderSuggestions() {
  suggestEl.innerHTML = '';
  if (demoRunning) {
    const span = document.createElement('span');
    span.className = 'chip';
    span.style.opacity = '.55';
    span.textContent = 'Running the guided flow...';
    suggestEl.appendChild(span);
    return;
  }
  buildSuggestions().forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (s.primary ? ' primary' : '');
    if (s.key) {
      const k = document.createElement('span');
      k.className = 'n';
      k.textContent = s.key;
      b.appendChild(k);
    }
    b.appendChild(document.createTextNode(s.label));
    b.onclick = () => runValue(s.value);
    suggestEl.appendChild(b);
  });
}

function submitValue(raw) {
  const v = String(raw);
  if (!v.trim()) return;
  history.push(v);
  hIndex = history.length;
  print(`${ps1El.textContent} ${v}`, 'cmd');
  handle(v);
  renderSuggestions();
}

function runValue(v) {
  if (demoRunning) return;
  if (v === '__demo__') return runFlow();
  if (v === '__restart__') return resetState();
  submitValue(v);
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  if (demoRunning) return;
  const v = inputEl.value;
  inputEl.value = '';
  submitValue(v);
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (hIndex > 0) { hIndex -= 1; inputEl.value = history[hIndex] || ''; }
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (hIndex < history.length - 1) { hIndex += 1; inputEl.value = history[hIndex] || ''; }
    else { hIndex = history.length; inputEl.value = ''; }
  }
});

document.getElementById('reset').onclick = () => {
  if (demoRunning) return;
  resetState();
  inputEl.focus();
};

/* ---------- guided flow ---------- */
const FLOW = [
  { label: 'Login as Priyanshu, a year 1 student', cmds: ['1', '1'] },
  { label: 'Show what is on the shelf', cmds: ['2'] },
  { label: 'Borrow the microscope 101', cmds: ['3', '101'] },
  { label: 'Try the same item again', cmds: ['3', '101'] },
  { label: 'Switch to another student, Arjun', cmds: ['1', '2'] },
  { label: 'Arjun tries the same item', cmds: ['3', '101'] },
  { label: 'Switch back to Priyanshu', cmds: ['1', '1'] },
  { label: 'Borrow a second item, 102', cmds: ['3', '102'] },
  { label: 'Try a third item, 103', cmds: ['3', '103'] },
  { label: 'Search by word', cmds: ['6', 'Micro'] },
  { label: 'Search by id', cmds: ['7', '102'] },
  { label: 'List the people', cmds: ['8'] },
  { label: 'Move eight days ahead', cmds: ['0', '0', '0', '0', '0', '0', '0', '0'] },
  { label: 'Return 101 after the due day', cmds: ['4', '101'] },
  { label: 'Show the booking log', cmds: ['5'] },
  { label: 'Switch to the lab admin', cmds: ['1', '5'] },
  { label: 'Add a new instrument', cmds: ['9', 'microscope', 'DemoScope', 'Demo', '0'] },
  { label: 'Remove it again', cmds: ['10', '104'] },
  { label: 'Exit', cmds: ['-1'] },
];

function runFlow() {
  if (demoRunning) return;
  demoRunning = true;
  resetState();
  renderSuggestions();
  let i = 0;

  const nextStep = () => {
    if (i >= FLOW.length) {
      demoRunning = false;
      renderSuggestions();
      inputEl.focus();
      return;
    }
    const step = FLOW[i];
    print(`step ${i + 1} / ${FLOW.length} · ${step.label}`, 'step');
    i += 1;

    let j = 0;
    const nextCmd = () => {
      if (j >= step.cmds.length) {
        setTimeout(nextStep, 240);
        return;
      }
      const v = step.cmds[j];
      j += 1;
      print(`${ps1El.textContent} ${v}`, 'cmd');
      handle(v);
      termEl.scrollTop = termEl.scrollHeight;
      setTimeout(nextCmd, 260);
    };
    nextCmd();
  };

  setTimeout(nextStep, 300);
}

document.getElementById('demo').onclick = () => runFlow();

/* boot */
resetState();
renderSuggestions();
showSlide(0);
const hash = location.hash.replace('#', '');
if (hash === 'shell' || hash === 'slides') activate(hash);
if (hash === 'shell-demo') {
  activate('shell');
  setTimeout(() => runFlow(), 300);
}

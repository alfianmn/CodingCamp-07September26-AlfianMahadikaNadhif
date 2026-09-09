/* ============================================================
   app.js – RevoU Dashboard
   Vanilla JavaScript – no frameworks, no external libraries
   Features:
     ✅ Greeting + Live Clock + Date
     ✅ Custom Name in Greeting        (Challenge 1)
     ✅ Light / Dark Mode              (Challenge 2)
     ✅ Focus Timer (Start/Stop/Reset)
     ✅ Change Pomodoro Time           (Challenge 3)
     ✅ To-Do List (Add/Edit/Done/Delete) + LocalStorage
     ✅ Prevent Duplicate Tasks        (Challenge 4)
     ✅ Sort Tasks                     (Challenge 5)
     ✅ Quick Links + LocalStorage
   ============================================================ */

'use strict';

/* ── Utility: LocalStorage helpers ───────────────────────── */
const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  },
};

/* ── Utility: Toast notification ─────────────────────────── */
let toastTimer = null;
function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  toastTimer = setTimeout(() => toast.remove(), 3000);
}

/* ============================================================
   MODULE 1 – THEME (Light / Dark Mode)
   Challenge: Light / Dark mode toggle, persisted to LocalStorage
   ============================================================ */
const ThemeModule = (() => {
  const STORAGE_KEY = 'revou_theme';
  const htmlEl      = document.documentElement;
  const toggleBtn   = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  function apply(theme) {
    htmlEl.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute(
      'title',
      theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'
    );
  }

  function init() {
    const saved = storage.get(STORAGE_KEY, 'light');
    apply(saved);

    toggleBtn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      apply(next);
      storage.set(STORAGE_KEY, next);
    });
  }

  return { init };
})();

/* ============================================================
   MODULE 2 – GREETING (Clock, Date, Custom Name)
   Challenge: Custom name in greeting, persisted to LocalStorage
   ============================================================ */
const GreetingModule = (() => {
  const STORAGE_KEY  = 'revou_name';
  const greetingText = document.getElementById('greetingText');
  const greetingName = document.getElementById('greetingName');
  const dateText     = document.getElementById('dateText');
  const clockText    = document.getElementById('clockText');
  const nameInput    = document.getElementById('nameInput');
  const saveNameBtn  = document.getElementById('saveNameBtn');

  const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ];

  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Selamat Pagi';
    if (hour >= 12 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateClock() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
    const s    = now.getSeconds();

    clockText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    greetingText.textContent = getGreeting(h) + '!';

    dateText.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }

  function renderName() {
    const name = storage.get(STORAGE_KEY, '');
    if (name) {
      greetingName.textContent = `Halo, ${name}! 👋`;
      nameInput.value = name;
    } else {
      greetingName.textContent = 'Halo, Teman! 👋';
    }
  }

  function saveName() {
    const name = nameInput.value.trim();
    if (!name) {
      showToast('Masukkan nama kamu dulu ya!', 'error');
      nameInput.focus();
      return;
    }
    storage.set(STORAGE_KEY, name);
    renderName();
    showToast(`Nama disimpan: ${name} 🎉`, 'success');
  }

  function init() {
    renderName();
    updateClock();
    setInterval(updateClock, 1000);

    saveNameBtn.addEventListener('click', saveName);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveName();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE 3 – FOCUS TIMER
   Features: Start, Stop, Reset
   Challenge: Change Pomodoro Time (custom duration)
   ============================================================ */
const TimerModule = (() => {
  const STORAGE_KEY      = 'revou_pomodoro_minutes';
  const timerDisplay     = document.getElementById('timerDisplay');
  const timerStart       = document.getElementById('timerStart');
  const timerStop        = document.getElementById('timerStop');
  const timerReset       = document.getElementById('timerReset');
  const timerStatus      = document.getElementById('timerStatus');
  const pomodoroMinutes  = document.getElementById('pomodoroMinutes');
  const applyDurationBtn = document.getElementById('applyDurationBtn');

  let totalSeconds  = 0;   // total duration in seconds
  let remaining     = 0;   // current remaining seconds
  let intervalId    = null;
  let isRunning     = false;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function setDisplay(seconds, state = 'idle') {
    timerDisplay.textContent = formatTime(seconds);
    timerDisplay.className   = 'timer__display';
    if (state === 'running') timerDisplay.classList.add('--running');
    if (state === 'done')    timerDisplay.classList.add('--done');
  }

  function updateControls() {
    timerStart.disabled = isRunning;
    timerStop.disabled  = !isRunning;
  }

  function setStatus(text) {
    timerStatus.textContent = text;
  }

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning  = false;
      setDisplay(0, 'done');
      updateControls();
      setStatus('🎉 Waktu habis! Istirahat sebentar.');
      showToast('⏰ Pomodoro selesai! Saatnya istirahat.', 'success');
      return;
    }
    remaining--;
    setDisplay(remaining, 'running');
  }

  function start() {
    if (isRunning) return;
    if (remaining <= 0) remaining = totalSeconds; // restart from full if at 0
    isRunning = true;
    intervalId = setInterval(tick, 1000);
    setDisplay(remaining, 'running');
    updateControls();
    setStatus('⏱ Sedang berjalan… tetap fokus!');
  }

  function stop() {
    if (!isRunning) return;
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    setDisplay(remaining, 'idle');
    updateControls();
    setStatus('⏸ Dijeda. Klik Mulai untuk lanjutkan.');
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    remaining  = totalSeconds;
    setDisplay(remaining, 'idle');
    updateControls();
    setStatus('Siap untuk fokus!');
  }

  function applyDuration() {
    const minutes = parseInt(pomodoroMinutes.value, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
      showToast('Durasi harus antara 1–120 menit.', 'error');
      pomodoroMinutes.focus();
      return;
    }
    // Stop any running timer before changing duration
    if (isRunning) stop();

    totalSeconds = minutes * 60;
    remaining    = totalSeconds;
    storage.set(STORAGE_KEY, minutes);
    setDisplay(remaining, 'idle');
    setStatus(`Durasi diset ke ${minutes} menit. Siap!`);
    showToast(`⏱ Durasi diubah ke ${minutes} menit.`, 'info');
  }

  function init() {
    // Load saved duration or default to 25
    const saved  = storage.get(STORAGE_KEY, 25);
    const minutes = (saved >= 1 && saved <= 120) ? saved : 25;
    pomodoroMinutes.value = minutes;
    totalSeconds = minutes * 60;
    remaining    = totalSeconds;

    setDisplay(remaining, 'idle');
    updateControls();

    timerStart.addEventListener('click', start);
    timerStop.addEventListener('click', stop);
    timerReset.addEventListener('click', reset);
    applyDurationBtn.addEventListener('click', applyDuration);
    pomodoroMinutes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyDuration();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE 4 – TO-DO LIST
   Features: Add, Edit, Done, Delete, LocalStorage
   Challenge: Prevent Duplicate Tasks, Sort Tasks
   ============================================================ */
const TodoModule = (() => {
  const STORAGE_KEY = 'revou_todos';
  const todoInput   = document.getElementById('todoInput');
  const todoAddBtn  = document.getElementById('todoAddBtn');
  const todoList    = document.getElementById('todoList');
  const todoEmpty   = document.getElementById('todoEmpty');
  const sortSelect  = document.getElementById('sortSelect');

  // Each task: { id, text, done, createdAt }
  let tasks = [];

  /* ── Persistence ── */
  function load() {
    tasks = storage.get(STORAGE_KEY, []);
  }

  function save() {
    storage.set(STORAGE_KEY, tasks);
  }

  /* ── Sort helper ── */
  function getSorted() {
    const mode = sortSelect.value;
    const copy = [...tasks];

    switch (mode) {
      case 'az':
        return copy.sort((a, b) => a.text.localeCompare(b.text, 'id'));
      case 'za':
        return copy.sort((a, b) => b.text.localeCompare(a.text, 'id'));
      case 'done':
        return copy.sort((a, b) => Number(a.done) - Number(b.done));
      case 'undone':
        return copy.sort((a, b) => Number(b.done) - Number(a.done));
      default:
        return copy; // default = insertion order (createdAt)
    }
  }

  /* ── Render ── */
  function render() {
    todoList.innerHTML = '';
    const sorted = getSorted();

    if (sorted.length === 0) {
      todoEmpty.style.display = 'block';
      return;
    }
    todoEmpty.style.display = 'none';

    sorted.forEach((task) => {
      const li = document.createElement('li');
      li.className = `todo-item${task.done ? ' --done' : ''}`;
      li.dataset.id = task.id;
      li.setAttribute('role', 'listitem');

      /* Checkbox */
      const check = document.createElement('input');
      check.type      = 'checkbox';
      check.className = 'todo-item__check';
      check.checked   = task.done;
      check.setAttribute('aria-label', `Tandai selesai: ${task.text}`);
      check.addEventListener('change', () => toggleDone(task.id));

      /* Text span */
      const span = document.createElement('span');
      span.className   = 'todo-item__text';
      span.textContent = task.text;

      /* Action buttons */
      const actions = document.createElement('div');
      actions.className = 'todo-item__actions';

      const editBtn = document.createElement('button');
      editBtn.className   = 'btn btn--ghost';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit tugas: ${task.text}`);
      editBtn.title = 'Edit tugas';
      editBtn.addEventListener('click', () => startEdit(task.id, li, span));

      const delBtn = document.createElement('button');
      delBtn.className   = 'btn btn--ghost';
      delBtn.textContent = '🗑️';
      delBtn.setAttribute('aria-label', `Hapus tugas: ${task.text}`);
      delBtn.title = 'Hapus tugas';
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.append(editBtn, delBtn);
      li.append(check, span, actions);
      todoList.appendChild(li);
    });
  }

  /* ── Inline Edit ── */
  function startEdit(id, li, span) {
    // If already editing, skip
    if (li.querySelector('.todo-item__edit-input')) return;

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    span.style.display = 'none';

    const editInput = document.createElement('input');
    editInput.type      = 'text';
    editInput.className = 'todo-item__edit-input';
    editInput.value     = task.text;
    editInput.maxLength = 100;
    editInput.setAttribute('aria-label', 'Edit teks tugas');

    function confirmEdit() {
      const newText = editInput.value.trim();
      if (!newText) {
        showToast('Teks tugas tidak boleh kosong.', 'error');
        editInput.focus();
        return;
      }

      // Prevent duplicate (Challenge 4) – ignore the task being edited
      const isDuplicate = tasks.some(
        (t) => t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
      );
      if (isDuplicate) {
        showToast(`Tugas "${newText}" sudah ada!`, 'error');
        editInput.focus();
        return;
      }

      task.text = newText;
      save();
      render();
    }

    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  confirmEdit();
      if (e.key === 'Escape') render(); // cancel
    });
    editInput.addEventListener('blur', confirmEdit);

    li.insertBefore(editInput, li.querySelector('.todo-item__actions'));
    editInput.focus();
    editInput.select();
  }

  /* ── Add Task ── */
  function addTask() {
    const text = todoInput.value.trim();
    if (!text) {
      showToast('Tulis tugas dulu sebelum menambahkan!', 'error');
      todoInput.focus();
      return;
    }

    // Prevent duplicate (Challenge 4)
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === text.toLowerCase()
    );
    if (isDuplicate) {
      showToast(`Tugas "${text}" sudah ada dalam daftar!`, 'error');
      todoInput.focus();
      return;
    }

    tasks.push({
      id:        Date.now().toString(),
      text,
      done:      false,
      createdAt: Date.now(),
    });

    save();
    render();
    todoInput.value = '';
    todoInput.focus();
    showToast('Tugas berhasil ditambahkan! ✅', 'success');
  }

  /* ── Toggle Done ── */
  function toggleDone(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.done = !task.done;
      save();
      render();
    }
  }

  /* ── Delete Task ── */
  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
    showToast('Tugas dihapus.', 'info');
  }

  /* ── Init ── */
  function init() {
    load();
    render();

    todoAddBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTask();
    });
    sortSelect.addEventListener('change', render);
  }

  return { init };
})();

/* ============================================================
   MODULE 5 – QUICK LINKS
   Features: Add, Open, Delete – persisted to LocalStorage
   ============================================================ */
const LinksModule = (() => {
  const STORAGE_KEY  = 'revou_links';
  const linkNameInput = document.getElementById('linkNameInput');
  const linkUrlInput  = document.getElementById('linkUrlInput');
  const linkAddBtn    = document.getElementById('linkAddBtn');
  const linksList     = document.getElementById('linksList');
  const linksEmpty    = document.getElementById('linksEmpty');

  // Each link: { id, name, url }
  let links = [];

  /* ── Persistence ── */
  function load() {
    links = storage.get(STORAGE_KEY, []);
  }

  function save() {
    storage.set(STORAGE_KEY, links);
  }

  /* ── Normalize URL ── */
  function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return '';
    // Add https:// if missing protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'https://' + trimmed;
    }
    return trimmed;
  }

  /* ── Validate URL ── */
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /* ── Get favicon ── */
  function getFavicon(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
    } catch {
      return '';
    }
  }

  /* ── Render ── */
  function render() {
    linksList.innerHTML = '';

    if (links.length === 0) {
      linksEmpty.style.display = 'block';
      return;
    }
    linksEmpty.style.display = 'none';

    links.forEach((link) => {
      const chip = document.createElement('a');
      chip.className  = 'link-chip';
      chip.href       = link.url;
      chip.target     = '_blank';
      chip.rel        = 'noopener noreferrer';
      chip.setAttribute('aria-label', `Buka ${link.name}`);

      // Favicon image
      const favicon = document.createElement('img');
      favicon.src    = getFavicon(link.url);
      favicon.alt    = '';
      favicon.width  = 14;
      favicon.height = 14;
      favicon.style.borderRadius = '2px';
      favicon.onerror = () => { favicon.style.display = 'none'; };

      // Label
      const label = document.createElement('span');
      label.className   = 'link-chip__label';
      label.textContent = link.name;

      // Delete button — stop propagation so click doesn't follow the link
      const delBtn = document.createElement('button');
      delBtn.className   = 'link-chip__delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Hapus link ${link.name}`);
      delBtn.title = 'Hapus link';
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(link.id);
      });

      chip.append(favicon, label, delBtn);
      linksList.appendChild(chip);
    });
  }

  /* ── Add Link ── */
  function addLink() {
    const name = linkNameInput.value.trim();
    const rawUrl = linkUrlInput.value.trim();

    if (!name) {
      showToast('Masukkan nama untuk link ini!', 'error');
      linkNameInput.focus();
      return;
    }

    if (!rawUrl) {
      showToast('Masukkan URL untuk link ini!', 'error');
      linkUrlInput.focus();
      return;
    }

    const url = normalizeUrl(rawUrl);

    if (!isValidUrl(url)) {
      showToast('URL tidak valid. Contoh: https://google.com', 'error');
      linkUrlInput.focus();
      return;
    }

    links.push({
      id:   Date.now().toString(),
      name,
      url,
    });

    save();
    render();
    linkNameInput.value = '';
    linkUrlInput.value  = '';
    linkNameInput.focus();
    showToast(`Link "${name}" ditambahkan! 🔗`, 'success');
  }

  /* ── Delete Link ── */
  function deleteLink(id) {
    links = links.filter((l) => l.id !== id);
    save();
    render();
    showToast('Link dihapus.', 'info');
  }

  /* ── Init ── */
  function init() {
    load();
    render();

    linkAddBtn.addEventListener('click', addLink);
    linkUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addLink();
    });
    linkNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') linkUrlInput.focus();
    });
  }

  return { init };
})();

/* ============================================================
   BOOTSTRAP – Initialize all modules when DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeModule.init();
  GreetingModule.init();
  TimerModule.init();
  TodoModule.init();
  LinksModule.init();
});

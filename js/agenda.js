
const STORAGE_KEY = "prospera_agenda_v1";

let events = loadEvents();
let current = new Date();
let selected = dateKey(new Date());
let view = "month";

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function dateKey(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function setView(v) {
  view = v;
  updateButtons();
  render();
}

function changeMonth(delta) {
  current = new Date(
    current.getFullYear(),
    current.getMonth() + delta,
    1
  );
  render();
}

function render() {
  const year = current.getFullYear();
  const month = current.getMonth();

  document.getElementById("month-title").textContent =
    current.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric"
    });

  const days = document.getElementById("days");
  days.innerHTML = "";

  let start;
  let count;

  if (view === "month") {
    start = new Date(year, month, 1);
    start.setDate(1 - start.getDay());
    count = 42;
  } else if (view === "week") {
    start = parseDate(selected);
    start.setDate(start.getDate() - start.getDay());
    count = 7;
  } else {
    start = parseDate(selected);
    count = 1;
  }

  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const key = dateKey(d);
    const cell = document.createElement("div");

    cell.className = "day";
    cell.textContent = d.getDate();

    if (d.getMonth() !== month && view === "month") {
      cell.classList.add("other");
    }

    if (key === dateKey(new Date())) {
      cell.classList.add("today");
    }

    if (key === selected) {
      cell.classList.add("selected");
    }

    if (events.some(e => e.date === key)) {
      cell.classList.add("has-event");
    }

    cell.onclick = () => {
      selected = key;

      if (view === "month") {
        view = "day";
      }

      updateButtons();
      render();
    };

    days.appendChild(cell);
  }

  document.getElementById("selected-title").textContent =
    "Compromissos — " +
    parseDate(selected).toLocaleDateString("pt-BR");

  renderEvents();
}

function updateButtons() {
  document.querySelectorAll(".controls button").forEach(b => {
    b.classList.remove("active");
  });

  document.getElementById(view + "-btn").classList.add("active");
}

function renderEvents() {
  const container = document.getElementById("events");
  container.innerHTML = "";

  const list = events
    .filter(e => e.date === selected)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (!list.length) {
    container.innerHTML =
      '<p class="empty">Nenhum compromisso nesta data.</p>';
    return;
  }

  list.forEach(e => {
    const item = document.createElement("div");
    item.className = "event";

    const info = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = e.title;

    const time = document.createElement("p");
    time.textContent =
      e.start + (e.end ? " até " + e.end : "");

    const desc = document.createElement("p");
    desc.textContent = e.description || "";

    info.append(heading, time, desc);

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Excluir";

    del.onclick = () => {
      if (confirm("Excluir este compromisso?")) {
        events = events.filter(x => x.id !== e.id);
        saveEvents();
        render();
      }
    };

    item.append(info, del);
    container.appendChild(item);
  });
}

function openForm() {
  document.getElementById("form-area").style.display = "block";
  document.getElementById("date").value = selected;
}

function closeForm() {
  document.getElementById("form-area").style.display = "none";
}

document.getElementById("event-form").addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description =
    document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  if (!title || !date || !start) {
    alert("Preencha o título, a data e o horário inicial.");
    return;
  }

  if (end && end <= start) {
    alert("O horário final deve ser posterior ao inicial.");
    return;
  }

  events.push({
    id: Date.now().toString(),
    title,
    description,
    date,
    start,
    end
  });

  saveEvents();

  selected = date;
  current = parseDate(date);
  view = "day";

  updateButtons();
  e.target.reset();
  closeForm();
  render();
});

render();

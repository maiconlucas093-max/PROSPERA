
/* =========================================
   PROSPERA — AGENDA INTELIGENTE
   Gerenciamento de compromissos
========================================= */

const STORAGE_KEY = "prospera_agenda_v1";

let events = loadEvents();
let current = new Date();
let selected = dateKey(new Date());
let view = "month";

/* =========================================
   ARMAZENAMENTO LOCAL
========================================= */

function loadEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Erro ao carregar compromissos:", error);
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );
}

/* =========================================
   DATAS
========================================= */

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function sameDay(dateA, dateB) {
  return dateKey(dateA) === dateKey(dateB);
}

/* =========================================
   NAVEGAÇÃO DA AGENDA
========================================= */

function setView(newView) {
  view = newView;
  updateButtons();
  render();
}

function changeMonth(direction) {
  current = new Date(
    current.getFullYear(),
    current.getMonth() + direction,
    1
  );

  render();
}

function updateButtons() {
  document.querySelectorAll(".controls button").forEach(button => {
    button.classList.remove("active");
  });

  const activeButton = document.getElementById(view + "-btn");

  if (activeButton) {
    activeButton.classList.add("active");
  }
}

/* =========================================
   RENDERIZAÇÃO DO CALENDÁRIO
========================================= */

function render() {
  const year = current.getFullYear();
  const month = current.getMonth();

  const monthTitle = document.getElementById("month-title");
  const daysContainer = document.getElementById("days");

  if (!monthTitle || !daysContainer) {
    console.error("Elementos do calendário não encontrados.");
    return;
  }

  monthTitle.textContent = current.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  daysContainer.innerHTML = "";

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
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const key = dateKey(date);
    const cell = document.createElement("div");

    cell.className = "day";
    cell.textContent = date.getDate();

    if (date.getMonth() !== month && view === "month") {
      cell.classList.add("other");
    }

    if (key === dateKey(new Date())) {
      cell.classList.add("today");
    }

    if (key === selected) {
      cell.classList.add("selected");
    }

    if (events.some(event => event.date === key)) {
      cell.classList.add("has-event");
    }

    cell.addEventListener("click", () => {
      selected = key;

      if (view === "month") {
        view = "day";
      }

      updateButtons();
      render();
    });

    daysContainer.appendChild(cell);
  }

  const selectedTitle = document.getElementById("selected-title");

  if (selectedTitle) {
    selectedTitle.textContent =
      "Compromissos — " +
      parseDate(selected).toLocaleDateString("pt-BR");
  }

  renderEvents();
}

/* =========================================
   LISTAGEM DE COMPROMISSOS
========================================= */

function renderEvents() {
  const container = document.getElementById("events");

  if (!container) return;

  container.innerHTML = "";

  const list = events
    .filter(event => event.date === selected)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Nenhum compromisso nesta data.";

    container.appendChild(empty);
    return;
  }

  list.forEach(event => {
    const item = document.createElement("div");
    item.className = "event";

    const info = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = event.title;

    const time = document.createElement("p");
    time.textContent =
      event.start + (event.end ? " até " + event.end : "");

    const description = document.createElement("p");
    description.textContent = event.description || "";

    info.append(heading, time, description);

    const actions = document.createElement("div");

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.textContent = "Excluir";

    deleteButton.addEventListener("click", () => {
      if (confirm("Deseja excluir este compromisso?")) {
        events = events.filter(item => item.id !== event.id);

        saveEvents();
        render();
      }
    });

    actions.appendChild(deleteButton);

    item.append(info, actions);
    container.appendChild(item);
  });
}

/* =========================================
   FORMULÁRIO
========================================= */

function openForm() {
  const formArea = document.getElementById("form-area");
  const dateInput = document.getElementById("date");

  if (!formArea || !dateInput) return;

  formArea.style.display = "block";
  dateInput.value = selected;
}

function closeForm() {
  const formArea = document.getElementById("form-area");

  if (formArea) {
    formArea.style.display = "none";
  }
}

/* =========================================
   SALVAR COMPROMISSO
========================================= */

function initializeForm() {
  const form = document.getElementById("event-form");

  if (!form) {
    console.error("Formulário da agenda não encontrado.");
    return;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

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

    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date,
      start,
      end
    };

    events.push(newEvent);

    saveEvents();

    selected = date;
    current = parseDate(date);
    view = "day";

    updateButtons();
    form.reset();
    closeForm();
    render();
  });
}

/* =========================================
   INICIALIZAÇÃO
========================================= */

function initializeAgenda() {
  initializeForm();
  updateButtons();
  render();

  console.log("PROSPERA Agenda inicializada.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAgenda);
} else {
  initializeAgenda();
}

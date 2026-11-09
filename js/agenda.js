
(() => {
  "use strict";

  const STORAGE_KEY = "prospera_agenda_v1";
  const SLOT_MINUTES = 15;
  const DAY_MINUTES = 24 * 60;
const supabaseClient = window.prosperaSupabase;

let currentUser = null;
let activeUserId = "__initial__";
  let events = [];
  let currentDate = new Date();
  let currentView = "month";
  let editingId = null;

  const $ = (id) => document.getElementById(id);

  function localDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseDate(value) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function startOfWeek(date) {
    const result = new Date(date);
    const day = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  function formatDate(date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function timeToMinutes(value) {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) return NaN;
    const [h, m] = value.split(":").map(Number);
    if (h > 23 || m > 59) return NaN;
    return h * 60 + m;
  }

  async function loadEvents() {
  const { data, error } = await supabaseClient
    .from("agenda_items")
    .select("id, title, description, starts_at, ends_at")
    .eq("user_id", currentUser.id)
    .order("starts_at", { ascending: true });
  
  if (error) throw error;
  
  return (data || []).map((item) => {
    const startDate = new Date(item.starts_at);
    const endDate = new Date(item.ends_at);
    
    return {
      id: item.id,
      title: item.title,
      description: item.description || "",
      date: localDate(startDate),
      start: formatTime(
        startDate.getHours() * 60 + startDate.getMinutes()
      ),
      end: formatTime(
        endDate.getHours() * 60 + endDate.getMinutes()
      )
    };
  });
}

  function saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      alert("Não foi possível salvar os compromissos neste navegador.");
      console.error(error);
    }
  }

  

  function sortedEvents(list) {
    return [...list].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function render() {
    renderHeader();
    renderMonth();
    renderSchedule();
    renderEventList();
    updateViewButtons();
  }

  function renderHeader() {
    const title = $("month-title");
    if (!title) return;

    if (currentView === "month") {
      title.textContent = currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });
    } else if (currentView === "week") {
      const first = startOfWeek(currentDate);
      const last = addDays(first, 6);
      title.textContent = `${first.toLocaleDateString("pt-BR")} – ${last.toLocaleDateString("pt-BR")}`;
    } else {
      title.textContent = formatDate(currentDate);
    }

    const selectedTitle = $("selected-title");
    if (selectedTitle) {
      selectedTitle.textContent = formatDate(currentDate);
    }
  }

  function updateViewButtons() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      const active = button.dataset.view === currentView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderMonth() {
    const container = $("days");
    if (!container) return;

    container.replaceChildren();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const start = addDays(firstDay, -offset);

    const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    weekdays.forEach((name) => {
      container.appendChild(
        createElement("div", "calendar-weekday", name)
      );
    });

    for (let i = 0; i < 42; i++) {
      const date = addDays(start, i);
      const dateKey = localDate(date);
      const dayEvents = events.filter((event) => event.date === dateKey);

      const button = createElement("button", "calendar-day");
      button.type = "button";
      button.textContent = String(date.getDate());

      if (date.getMonth() !== month) button.classList.add("outside-month");
      if (dateKey === localDate(new Date())) button.classList.add("today");
      if (dateKey === localDate(currentDate)) button.classList.add("selected");
      if (dayEvents.length) button.classList.add("has-events");

      button.setAttribute("aria-label",
        `${formatDate(date)}, ${dayEvents.length} compromissos`
      );

      button.addEventListener("click", () => {
        currentDate = date;
        currentView = "day";
        render();
      });

      if (dayEvents.length) {
        button.appendChild(createElement("span", "calendar-dot"));
      }

      container.appendChild(button);
    }
  }

  function renderSchedule() {
    const wrapper = $("schedule-wrap");
    const grid = $("schedule-grid");
    if (!wrapper || !grid) return;

    wrapper.hidden = currentView === "month";
    grid.replaceChildren();

    const dates = currentView === "day"
      ? [new Date(currentDate)]
      : Array.from({ length: 7 }, (_, i) =>
          addDays(startOfWeek(currentDate), i)
        );

    grid.className = `schedule-grid ${currentView}-schedule`;

    const corner = createElement("div", "schedule-corner", "Horário");
    grid.appendChild(corner);

    dates.forEach((date) => {
      const header = createElement(
        "div",
        "schedule-day-head",
        date.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit"
        })
      );

      if (localDate(date) === localDate(new Date())) {
        header.classList.add("today");
      }

      grid.appendChild(header);
    });

    for (let minutes = 0; minutes < DAY_MINUTES; minutes += SLOT_MINUTES) {
      const time = createElement(
        "div",
        "schedule-time",
        formatTime(minutes)
      );
      grid.appendChild(time);

      dates.forEach((date) => {
        const dateKey = localDate(date);
        const slot = createElement("button", "schedule-slot");
        slot.type = "button";
        slot.dataset.date = dateKey;
        slot.dataset.time = formatTime(minutes);
        slot.setAttribute(
          "aria-label",
          `Criar compromisso em ${dateKey} às ${formatTime(minutes)}`
        );

        slot.addEventListener("click", () => {
          openForm({
            date: dateKey,
            start: formatTime(minutes),
            end: formatTime(Math.min(minutes + 60, DAY_MINUTES - 1))
          });
        });

        grid.appendChild(slot);
      });
    }

    events.forEach((event) => {
      const dateIndex = dates.findIndex(
        (date) => localDate(date) === event.date
      );
      if (dateIndex === -1) return;

      const start = timeToMinutes(event.start);
      let end = timeToMinutes(event.end);

      if (!Number.isFinite(start)) return;
      if (!Number.isFinite(end) || end <= start) {
        end = Math.min(start + 60, DAY_MINUTES);
      }

      const eventElement = createElement("button", "schedule-event");
      eventElement.type = "button";
      eventElement.textContent = `${event.start} · ${event.title}`;
      eventElement.title = `${event.title} (${event.start}–${event.end})`;

      const top = start / SLOT_MINUTES;
      const duration = Math.max(
        1,
        (end - start) / SLOT_MINUTES
      );

      eventElement.style.gridColumn = String(dateIndex + 2);
      eventElement.style.gridRow = `${Math.floor(top) + 2} / span ${Math.ceil(duration)}`;
      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        openForm(event);
      });

      grid.appendChild(eventElement);
    });
  }

  function renderEventList() {
    const container = $("events");
    if (!container) return;

    container.replaceChildren();

    const dateKey = localDate(currentDate);
    const dayEvents = sortedEvents(
      events.filter((event) => event.date === dateKey)
    );

    if (!dayEvents.length) {
      container.appendChild(
        createElement("p", "empty-events", "Nenhum compromisso neste dia.")
      );
      return;
    }

    dayEvents.forEach((event) => {
      const item = createElement("article", "agenda-event-card");
      const info = createElement("div", "agenda-event-info");
      const title = createElement("strong", "", event.title);
      const time = createElement(
        "span",
        "agenda-event-time",
        `${event.start} – ${event.end}`
      );

      info.append(title, time);

      if (event.description) {
        info.appendChild(
          createElement("p", "agenda-event-description", event.description)
        );
      }

      const actions = createElement("div", "agenda-event-actions");

      const editButton = createElement("button", "", "Editar");
      editButton.type = "button";
      editButton.addEventListener("click", () => openForm(event));

      const deleteButton = createElement("button", "", "Excluir");
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => deleteEvent(event.id));

      actions.append(editButton, deleteButton);
      item.append(info, actions);
      container.appendChild(item);
    });
  }

  function openForm(event = {}) {
    const form = $("event-form");
    const area = $("form-area");
    if (!form) return;

    editingId = event.id || null;

    if (form.elements.title) form.elements.title.value = event.title || "";
    if (form.elements.description) {
      form.elements.description.value = event.description || "";
    }
    if (form.elements.date) {
      form.elements.date.value = event.date || localDate(currentDate);
    }
    if (form.elements.start) {
      form.elements.start.value = event.start || "09:00";
    }
    if (form.elements.end) {
      form.elements.end.value = event.end || "10:00";
    }

    const hiddenId = $("event-id");
    if (hiddenId) hiddenId.value = editingId || "";

    const heading = form.querySelector("[data-form-title]");
    if (heading) {
      heading.textContent = editingId
        ? "Editar compromisso"
        : "Novo compromisso";
    }

    if (area) area.hidden = false;
    form.hidden = false;

    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.textContent = editingId
      ? "Salvar alterações"
      : "Salvar compromisso";

    if (form.elements.title) form.elements.title.focus();
  }

  function closeForm() {
    const area = $("form-area");
    const form = $("event-form");

    if (area) area.hidden = true;
    if (form) {
      form.hidden = true;
      form.reset();
    }

    editingId = null;
  }

  async function handleSubmit(event) {
  event.preventDefault();
  
  if (!currentUser) {
    alert("Entre na sua conta PROSPERA antes de salvar.");
    return;
  }
  
  const form = $("event-form");
  if (!form) return;
  
  const title = form.elements.title.value.trim();
  const description = form.elements.description.value.trim();
  const date = form.elements.date.value;
  const start = form.elements.start.value;
  const end = form.elements.end.value;
  
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  if (!title || !date || !Number.isFinite(startMinutes) ||
    !Number.isFinite(endMinutes)) {
    alert("Preencha o título, a data e os horários corretamente.");
    return;
  }
  
  if (endMinutes <= startMinutes) {
    alert("O horário de término precisa ser posterior ao início.");
    return;
  }
  
  const startDate = new Date(`${date}T${start}:00`);
  const endDate = new Date(`${date}T${end}:00`);
  
  const eventData = {
    title,
    description,
    starts_at: startDate.toISOString(),
    ends_at: endDate.toISOString(),
    item_type: "task",
    area: "personal",
    status: "pending",
    source_app: "PROSPERA"
  };
  
  try {
    let result;
    
    if (editingId) {
      result = await supabaseClient
        .from("agenda_items")
        .update(eventData)
        .eq("id", editingId)
        .eq("user_id", currentUser.id);
    } else {
      result = await supabaseClient
        .from("agenda_items")
        .insert({
          ...eventData,
          user_id: currentUser.id
        });
    }
    
    if (result.error) throw result.error;
    
    events = await loadEvents();
    
    currentDate = parseDate(date);
    currentView = "day";
    
    closeForm();
    render();
    
  } catch (error) {
    console.error("Erro ao salvar compromisso:", error);
    alert("Não foi possível salvar na nuvem. Verifique sua conexão e tente novamente.");
  }
}

  async function deleteEvent(id) {
  const event = events.find((item) => item.id === id);
  
  if (!event || !currentUser) return;
  
  if (!confirm(`Excluir o compromisso "${event.title}"?`)) {
    return;
  }
  
  try {
    const { error } = await supabaseClient
      .from("agenda_items")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);
    
    if (error) throw error;
    
    events = await loadEvents();
    render();
    
  } catch (error) {
    console.error("Erro ao excluir compromisso:", error);
    alert("Não foi possível excluir o compromisso da nuvem.");
  }
}

  function changePeriod(direction) {
    if (currentView === "month") {
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1
      );
    } else if (currentView === "week") {
      currentDate = addDays(currentDate, direction * 7);
    } else {
      currentDate = addDays(currentDate, direction);
    }

    render();
  }

  function bindControls() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.view;
        if (!["month", "week", "day"].includes(view)) return;
        currentView = view;
        render();
      });
    });

    const previous = $("prev-period");
    const next = $("next-period");
    const today = $("today-button");
    const add = $("add-event-button");
    const close = $("close-form");
    const cancel = $("cancel-event");

    if (previous) {
      previous.addEventListener("click", () => changePeriod(-1));
    }
    if (next) {
      next.addEventListener("click", () => changePeriod(1));
    }
    if (today) {
      today.addEventListener("click", () => {
        currentDate = new Date();
        render();
      });
    }
    if (add) {
      add.addEventListener("click", () => openForm());
    }
    if (close) close.addEventListener("click", closeForm);
    if (cancel) cancel.addEventListener("click", closeForm);

    const form = $("event-form");
    if (form) form.addEventListener("submit", handleSubmit);
  }

  async function syncAgendaSession(session) {
  const nextUser = session ? session.user : null;
  const nextUserId = nextUser ? nextUser.id : null;
  
  if (nextUserId === activeUserId) return;
  
  activeUserId = nextUserId;
  currentUser = nextUser;
  
  if (!currentUser) {
    events = [];
    render();
    return;
  }
  
  try {
    events = await loadEvents();
    render();
  } catch (error) {
    console.error("Erro ao carregar agenda:", error);
    alert("Não foi possível carregar seus compromissos da nuvem.");
  }
}

function initializeAgenda() {
  bindControls();
  
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    syncAgendaSession(session);
  });
  
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Erro ao verificar sessão:", error);
      return;
    }
    
    syncAgendaSession(data.session);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAgenda, {
    once: true
  });
} else {
  initializeAgenda();
}
})();

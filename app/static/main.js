async function fetchTasks(categoryFilter) {
  let url = "/api/tasks";
  if (categoryFilter) {
    const params = new URLSearchParams({ category: categoryFilter });
    url += "?" + params.toString();
  }

  const res = await fetch(url);
  const tasks = await res.json();
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    const mainSpan = document.createElement("span");
    const categoryPrefix = task.category ? `[${task.category}] ` : "";
    mainSpan.textContent =
      categoryPrefix + task.title + (task.done ? " ✅" : "");
    mainSpan.style.cursor = "pointer";
    mainSpan.onclick = () => toggleTask(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.type = "button";
    deleteBtn.style.marginLeft = "8px";
    deleteBtn.onclick = (e) => {
      e.stopPropagation(); // do not toggle 'done' on delete click
      deleteTask(task.id);
    };

    li.appendChild(mainSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function getCurrentFilter() {
  const select = document.getElementById("category-filter");
  return select ? select.value : "";
}

async function refreshTasks() {
  const category = getCurrentFilter();
  await fetchTasks(category);
}

async function addTask(title, category) {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category }),
  });
  await refreshTasks();
}

async function toggleTask(id) {
  await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
  });
  await refreshTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  await refreshTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const categorySelect = document.getElementById("task-category");
  const filterSelect = document.getElementById("category-filter");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    const category = categorySelect ? categorySelect.value : "";
    addTask(title, category);
    input.value = "";
  });

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      refreshTasks();
    });
  }

  // initial load
  refreshTasks();
});


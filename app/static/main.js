async function fetchTasksRaw(categoryFilter) {
  let url = "/api/tasks";
  if (categoryFilter) {
    const params = new URLSearchParams({ category: categoryFilter });
    url += "?" + params.toString();
  }

  const res = await fetch(url);
  return await res.json();
}

function buildTaskTree(tasks) {
  const map = new Map();
  tasks.forEach((t) => {
    map.set(t.id, {
      ...t,
      children: [],
    });
  });

  const roots = [];

  map.forEach((task) => {
    if (task.parent_id && map.has(task.parent_id)) {
      const parent = map.get(task.parent_id);
      parent.children.push(task);
    } else {
      roots.push(task);
    }
  });

  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.id - b.id);
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(roots);
  return roots;
}

function renderTaskTree(rootTasks) {
  const container = document.getElementById("task-list");
  container.innerHTML = "";

  const ol = document.createElement("ol");
  rootTasks.forEach((task, index) => {
    const prefix = String(index + 1); // "1", "2", ...
    const li = createTaskElement(task, prefix);
    ol.appendChild(li);
  });

  container.appendChild(ol);
}

function createTaskElement(task, prefix) {
  const li = document.createElement("li");

  const mainSpan = document.createElement("span");
  const categoryPrefix = task.category ? `[${task.category}] ` : "";
  mainSpan.textContent =
    `${prefix}. ` +
    categoryPrefix +
    task.title +
    (task.done ? " ✅" : "");
  mainSpan.style.cursor = "pointer";
  mainSpan.onclick = () => toggleTask(task.id);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.type = "button";
  deleteBtn.style.marginLeft = "8px";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const subtaskBtn = document.createElement("button");
  subtaskBtn.textContent = "+ subtask";
  subtaskBtn.type = "button";
  subtaskBtn.style.marginLeft = "8px";
  subtaskBtn.onclick = (e) => {
    e.stopPropagation();
    const title = window.prompt("Sub-task title:");
    if (!title) return;
    const category = task.category || "";
    addTask(title, category, task.id);
  };

  li.appendChild(mainSpan);
  li.appendChild(subtaskBtn);
  li.appendChild(deleteBtn);

  if (task.children && task.children.length > 0) {
    const childOl = document.createElement("ol");
    task.children.forEach((child, index) => {
      const childPrefix = `${prefix}.${index + 1}`; // "1.1", "1.2", ...
      const childLi = createTaskElement(child, childPrefix);
      childOl.appendChild(childLi);
    });
    li.appendChild(childOl);
  }

  return li;
}

function getCurrentFilter() {
  const select = document.getElementById("category-filter");
  return select ? select.value : "";
}

async function refreshTasks() {
  const category = getCurrentFilter();
  const tasks = await fetchTasksRaw(category);
  const tree = buildTaskTree(tasks);
  renderTaskTree(tree);
}

async function addTask(title, category, parentId = null) {
  const payload = { title, category };
  if (parentId) {
    payload.parent_id = parentId;
  }

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
    addTask(title, category, null);
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


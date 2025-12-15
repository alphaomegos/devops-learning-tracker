async function fetchTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.title + (task.done ? " ✅" : "");
    li.style.cursor = "pointer";
    li.onclick = () => toggleTask(task.id);
    list.appendChild(li);
  });
}

async function addTask(title) {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  await fetchTasks();
}

async function toggleTask(id) {
  await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
  });
  await fetchTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    addTask(title);
    input.value = "";
  });

  fetchTasks();
});


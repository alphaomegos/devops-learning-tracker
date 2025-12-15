from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

TASKS = [
    {"id": 1, "title": "Dockerize a full-stack app", "done": False},
    {"id": 2, "title": "Set up Jenkins pipeline", "done": False},
    {"id": 3, "title": "Deploy app on AWS EC2", "done": False},
]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(TASKS)


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    new_task = {
        "id": len(TASKS) + 1,
        "title": title,
        "done": False,
    }
    TASKS.append(new_task)
    return jsonify(new_task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def toggle_task(task_id):
    for task in TASKS:
        if task["id"] == task_id:
            task["done"] = not task["done"]
            return jsonify(task)
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    # host=0.0.0.0 чтобы было видно из контейнера
    app.run(host="0.0.0.0", port=5000)


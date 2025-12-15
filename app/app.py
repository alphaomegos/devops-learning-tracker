import os
import time

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)


def get_db_conn(retries: int = 5, delay: int = 2):
    """
    Open a new DB connection with simple retry logic.
    """
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set")

    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        except psycopg2.OperationalError as exc:
            last_exc = exc
            print(
                f"[app] DB not ready yet (attempt {attempt}/{retries}): {exc}",
                flush=True,
            )
            time.sleep(delay)

    # If we are here, all retries failed
    raise last_exc


def init_db():
    """
    Create base table and new columns if they do not exist.
    """
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            # Base table (old version might already exist)
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    done BOOLEAN NOT NULL DEFAULT FALSE
                );
                """
            )
            # New column for category
            cur.execute(
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT;"
            )
        conn.commit()
    finally:
        conn.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """
    Optional filter: /api/tasks?category=Docker
    """
    category = request.args.get("category", "").strip() or None

    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            if category:
                cur.execute(
                    """
                    SELECT id, title, done, category
                    FROM tasks
                    WHERE category = %s
                    ORDER BY id;
                    """,
                    (category,),
                )
            else:
                cur.execute(
                    """
                    SELECT id, title, done, category
                    FROM tasks
                    ORDER BY id;
                    """
                )
            rows = cur.fetchall()
            return jsonify(rows)
    finally:
        conn.close()


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    category = (data.get("category") or "").strip() or None

    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO tasks (title, done, category)
                VALUES (%s, FALSE, %s)
                RETURNING id, title, done, category;
                """,
                (title, category),
            )
            row = cur.fetchone()
        conn.commit()
        return jsonify(row), 201
    finally:
        conn.close()


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def toggle_task(task_id: int):
    """
    Toggle 'done' flag for a task.
    """
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE tasks
                SET done = NOT done
                WHERE id = %s
                RETURNING id, title, done, category;
                """,
                (task_id,),
            )
            row = cur.fetchone()
        conn.commit()

        if not row:
            return jsonify({"error": "Not found"}), 404

        return jsonify(row)
    finally:
        conn.close()


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    """
    Delete a task.
    """
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM tasks WHERE id = %s RETURNING id;",
                (task_id,),
            )
            row = cur.fetchone()
        conn.commit()

        if not row:
            return jsonify({"error": "Not found"}), 404

        return jsonify({"status": "deleted"}), 200
    finally:
        conn.close()


@app.route("/health", methods=["GET"])
def health():
    """
    Health-check endpoint.
    """
    try:
        conn = get_db_conn()
        conn.close()
        return jsonify({"status": "ok"}), 200
    except Exception as exc:
        return jsonify({"status": "error", "details": str(exc)}), 500


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)


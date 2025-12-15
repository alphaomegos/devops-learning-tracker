# DevOps Portfolio

A small but realistic full-stack demo service used for planning and tracking steps to create a strong DevOps portfolio.

The application lets you plan portfolio items (Docker project, Jenkins pipeline, AWS deployment, Terraform infra, monitoring, etc.), break them down into sub-tasks, and track progress.
It is designed to look and behave like a real microservice in a containerized environment.

You can:
- see the current portfolio tasks
- add new items and sub-tasks (e.g. "Dockerize app", "Set up Jenkins pipeline")
- group them by category (Docker, Jenkins, AWS, Terraform, Monitoring)
- track progress via checkmarks

---

## Features

- **Full-stack app**: Flask backend + simple HTML/JS frontend
- **PostgreSQL storage** instead of in-memory lists
- **Containerized** with a Docker/Podman-compatible image
- **Compose stack**: `web` + `db` services wired together
- **Health check endpoint**: `GET /health`
- Simple DB initialization on startup (`CREATE TABLE IF NOT EXISTS ...`)

---

## Tech Stack

- **Backend:** Python 3.12, Flask
- **Database:** PostgreSQL 16
- **Containers:** Docker / Podman compatible image
- **Orchestration:** docker-compose / podman-compose

---

## Architecture

```text
+--------------------------+
|    DevOps Learning UI    |  -->  Browser (HTML + JS)
+------------+-------------+
             |
             v
+------------+-------------+        +------------------------+
|      Flask API (web)     | <----> |   PostgreSQL (db)      |
|  /, /api/tasks, /health  |        |   tasks table          |
+--------------------------+        +------------------------+
            |
         Container
            |
       docker-compose
я

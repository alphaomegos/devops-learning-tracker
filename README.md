# DevOps Learning Tracker

A small but realistic full-stack demo service used for my DevOps portfolio.

The application lets you track learning tasks (e.g. “Set up Jenkins pipeline”, “Deploy to AWS EC2”), mark them as done, and stores everything in a PostgreSQL database.  
It is designed to look and behave like a real microservice in a containerized environment.

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

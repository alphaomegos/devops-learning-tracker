COMPOSE ?= docker compose

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

db-shell:
	$(COMPOSE) exec db psql -U tracker -d tracker

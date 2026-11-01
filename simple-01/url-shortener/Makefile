.DEFAULT_GOAL := help
.SHELLFLAGS := -eu -o pipefail -c

NPM ?= npm

.PHONY: help install start dev test frontend-build db-init db-seed db-reset clean

help: ## Show application commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <target>\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install application dependencies
	$(NPM) install

start: ## Start the application
	$(NPM) start

dev: ## Start with Node's file watcher
	$(NPM) run dev

test: ## Run the application test suite
	$(NPM) test

frontend-build: ## Build local HTMX, Alpine.js, and Tailwind assets
	$(NPM) run frontend:build

db-init: ## Create the schema in DATABASE_PATH
	$(NPM) run db:init

db-seed: ## Insert deterministic development data
	$(NPM) run db:seed

db-reset: ## Delete only the configured local development database
	@test "$${NODE_ENV:-development}" = development || (echo 'Refusing reset outside NODE_ENV=development' >&2; exit 1)
	rm -f "$${DATABASE_PATH:-./data/url-shortener.db}"
	$(NPM) run db:init

clean: ## Remove generated local database files
	rm -f data/*.db data/*.db-shm data/*.db-wal


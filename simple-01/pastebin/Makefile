.DEFAULT_GOAL := help
.SHELLFLAGS := -eu -o pipefail -c
NPM ?= npm

.PHONY: help install start dev test db-init db-seed db-cleanup db-reset clean

help: ## Show application commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <target>\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	$(NPM) install

start: ## Start the application
	$(NPM) start

dev: ## Start with Node's file watcher
	$(NPM) run dev

test: ## Run tests
	$(NPM) test

db-init: ## Initialize the database
	$(NPM) run db:init

db-seed: ## Load idempotent teaching data
	$(NPM) run db:seed

db-cleanup: ## Delete expired snippets
	$(NPM) run db:cleanup

db-reset: ## Reset only a local development database
	@test "$${NODE_ENV:-development}" = development || (echo 'Refusing reset outside NODE_ENV=development' >&2; exit 1)
	rm -f "$${DATABASE_PATH:-./data/pastebin.db}"
	$(NPM) run db:init

clean: ## Remove local database files
	rm -f data/*.db data/*.db-shm data/*.db-wal


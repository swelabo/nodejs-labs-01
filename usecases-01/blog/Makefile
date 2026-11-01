.DEFAULT_GOAL := help
NPM ?= npm
.PHONY: help install generate migrate db-init db-seed db-reset lint test start dev clean

help: ## Show commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <target>\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	$(NPM) install

generate: ## Generate Prisma Client
	$(NPM) run db:generate

migrate: ## Apply migrations
	$(NPM) run db:migrate

db-init: migrate

db-reset: ## Reset only a local development database
	@test "$${NODE_ENV:-development}" = development || (echo 'Refusing reset outside NODE_ENV=development' >&2; exit 1)
	rm -f data/*.db data/*.db-shm data/*.db-wal
	$(MAKE) db-init db-seed

db-seed: ## Load idempotent teaching data
	$(NPM) run db:seed

lint: ## Run the package verification command
	$(NPM) test

test: ## Run tests
	$(NPM) test

start: ## Start the application
	$(NPM) start

dev: ## Start the application in development mode
	$(NPM) start

clean: ## Remove local database files
	rm -f data/*.db data/*.db-shm data/*.db-wal


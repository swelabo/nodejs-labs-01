.DEFAULT_GOAL := help
NPM ?= npm
.PHONY: help install generate migrate db-init db-seed lint typecheck test start dev clean

help: ## Show commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <target>\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	$(NPM) install

generate: ## Generate Prisma Client
	$(NPM) run db:generate

migrate: ## Apply migrations
	$(NPM) run db:migrate

db-init: migrate

db-seed: ## Load idempotent teaching data
	$(NPM) run db:seed

lint: typecheck

dev: ## Start the watch server
	$(NPM) run dev

typecheck: ## Type-check the TypeScript source
	$(NPM) run typecheck

test: ## Run tests
	$(NPM) test

start: ## Start the application
	$(NPM) start

clean: ## Remove local database files
	rm -f data/*.db data/*.db-shm data/*.db-wal


SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
MAKEFLAGS += --no-builtin-variables
.DEFAULT_GOAL := help

NPM ?= npm

##@ Documentation

.PHONY: docs-dev
docs-dev: ## Start the VitePress development server
	$(NPM) run docs:dev

.PHONY: docs-build
docs-build: ## Build the static VitePress book
	$(NPM) run docs:build

.PHONY: docs-preview
docs-preview: ## Preview the production documentation build
	$(NPM) run docs:preview

.PHONY: docs-lint
docs-lint: ## Run documentation quality and link checks
	$(NPM) run docs:lint

##@ Verification

.PHONY: test
test: ## Run the root smoke-test suite
	$(NPM) test

.PHONY: verify-apps
verify-apps: ## Run setup and tests for all 18 applications
	$(NPM) run verify:apps

.PHONY: verify-contracts
verify-contracts: ## Verify OpenAPI metadata and implemented routes
	$(NPM) run verify:contracts

.PHONY: verify-start
verify-start: ## Start and gracefully stop all applications
	$(NPM) run verify:start

.PHONY: verify-structure
verify-structure: ## Verify application lifecycle and frontend structure
	$(NPM) run verify:structure

.PHONY: verify-dependencies
verify-dependencies: ## Audit runtime dependencies in every application
	$(NPM) run verify:dependencies

.PHONY: check
check: verify-apps verify-contracts verify-structure verify-start verify-dependencies docs-build docs-lint ## Run the complete project verification

.PHONY: build
build: docs-build ## Build the documentation artifact

.PHONY: all
all: check ## Run the complete verification target

##@ Installation

.PHONY: install
install: ## Install locked root documentation dependencies
	$(NPM) ci

##@ Focused application tests

.PHONY: simple-url-shortener-test
simple-url-shortener-test: ## Test the direct URL shortener
	$(NPM) test --prefix simple-01/url-shortener

.PHONY: pastebin-test
pastebin-test: ## Test the direct Pastebin
	$(NPM) test --prefix simple-01/pastebin

.PHONY: blog-test
blog-test: ## Test the direct Blog
	$(NPM) test --prefix simple-01/blog

.PHONY: prisma-url-shortener-test
prisma-url-shortener-test: ## Test the Prisma URL shortener
	$(NPM) test --prefix prisma-01/url-shortener

.PHONY: prisma-pastebin-test
prisma-pastebin-test: ## Test the Prisma Pastebin
	$(NPM) test --prefix prisma-01/pastebin

.PHONY: prisma-blog-test
prisma-blog-test: ## Test the Prisma Blog
	$(NPM) test --prefix prisma-01/blog

.PHONY: usecases-url-shortener-test
usecases-url-shortener-test: ## Test the use-case URL shortener
	$(NPM) test --prefix usecases-01/url-shortener

.PHONY: usecases-pastebin-test
usecases-pastebin-test: ## Test the use-case Pastebin
	$(NPM) test --prefix usecases-01/pastebin

.PHONY: usecases-blog-test
usecases-blog-test: ## Test the use-case Blog
	$(NPM) test --prefix usecases-01/blog

.PHONY: hexagonal-url-shortener-test
hexagonal-url-shortener-test: ## Test the hexagonal URL shortener
	$(NPM) test --prefix hexagonal-01/url-shortener

.PHONY: hexagonal-pastebin-test
hexagonal-pastebin-test: ## Test the hexagonal Pastebin
	$(NPM) test --prefix hexagonal-01/pastebin

.PHONY: hexagonal-blog-test
hexagonal-blog-test: ## Test the hexagonal Blog
	$(NPM) test --prefix hexagonal-01/blog

.PHONY: typescript-url-shortener-test
typescript-url-shortener-test: ## Test the TypeScript URL shortener
	$(NPM) test --prefix typescript-01/url-shortener

.PHONY: typescript-url-shortener-typecheck
typescript-url-shortener-typecheck: ## Type-check the TypeScript URL shortener
	$(NPM) run typecheck --prefix typescript-01/url-shortener

.PHONY: typescript-pastebin-test
typescript-pastebin-test: ## Test the TypeScript Pastebin
	$(NPM) test --prefix typescript-01/pastebin

.PHONY: typescript-pastebin-typecheck
typescript-pastebin-typecheck: ## Type-check the TypeScript Pastebin
	$(NPM) run typecheck --prefix typescript-01/pastebin

.PHONY: typescript-blog-test
typescript-blog-test: ## Test the TypeScript Blog
	$(NPM) test --prefix typescript-01/blog

.PHONY: typescript-blog-typecheck
typescript-blog-typecheck: ## Type-check the TypeScript Blog
	$(NPM) run typecheck --prefix typescript-01/blog

.PHONY: ddd-url-shortener-test
ddd-url-shortener-test: ## Test the DDD URL shortener
	$(NPM) test --prefix ddd-01/url-shortener

.PHONY: ddd-pastebin-test
ddd-pastebin-test: ## Test the DDD Pastebin
	$(NPM) test --prefix ddd-01/pastebin

.PHONY: ddd-blog-test
ddd-blog-test: ## Test the DDD Blog
	$(NPM) test --prefix ddd-01/blog

##@ Maintenance

.PHONY: clean
clean: ## Remove generated VitePress output
	rm -rf docs/.vitepress/cache docs/.vitepress/dist

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z0-9_.-]+:.*##/ { printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo

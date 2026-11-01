.DEFAULT_GOAL := help
.SHELLFLAGS := -eu -o pipefail -c

NPM ?= npm

.PHONY: help install docs-dev docs-build docs-preview docs-lint test verify-apps verify-contracts verify-start simple-url-shortener-test pastebin-test blog-test prisma-url-shortener-test prisma-pastebin-test prisma-blog-test usecases-url-shortener-test usecases-pastebin-test usecases-blog-test hexagonal-url-shortener-test hexagonal-pastebin-test hexagonal-blog-test typescript-url-shortener-test typescript-url-shortener-typecheck typescript-pastebin-test typescript-pastebin-typecheck typescript-blog-test typescript-blog-typecheck ddd-url-shortener-test ddd-pastebin-test ddd-blog-test clean

help: ## Show available foundation commands
	@awk 'BEGIN {FS = ":.*##"; print "Usage: make <target>\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install the locked root documentation dependencies
	$(NPM) install

docs-dev: ## Start the VitePress development server
	$(NPM) run docs:dev

docs-build: ## Build the static VitePress book
	$(NPM) run docs:build

docs-preview: ## Preview a production documentation build
	$(NPM) run docs:preview

docs-lint: ## Run the documentation quality checks
	$(NPM) run docs:lint

test: ## Run the root test suite
	$(NPM) test

verify-apps: ## Verify every application variant
	$(NPM) run verify:apps

verify-contracts: ## Verify OpenAPI contracts exist for every variant
	$(NPM) run verify:contracts

verify-start: ## Start and gracefully stop every application
	$(NPM) run verify:start

simple-url-shortener-test: ## Run the first application test suite
	$(MAKE) -C simple-01/url-shortener test

pastebin-test: ## Run the Pastebin application test suite
	$(MAKE) -C simple-01/pastebin test

blog-test: ## Run the blog application test suite
	$(MAKE) -C simple-01/blog test

prisma-url-shortener-test: ## Run the Prisma URL-shortener test suite
	$(MAKE) -C prisma-01/url-shortener test

prisma-pastebin-test: ## Run the Prisma Pastebin test suite
	$(MAKE) -C prisma-01/pastebin test

prisma-blog-test: ## Run the Prisma blog test suite
	$(MAKE) -C prisma-01/blog test

usecases-url-shortener-test: ## Run the use-case URL-shortener test suite
	$(MAKE) -C usecases-01/url-shortener test

usecases-pastebin-test: ## Run the use-case Pastebin test suite
	$(MAKE) -C usecases-01/pastebin test

usecases-blog-test: ## Run the use-case blog test suite
	$(MAKE) -C usecases-01/blog test

hexagonal-url-shortener-test: ## Run the hexagonal URL-shortener test suite
	$(MAKE) -C hexagonal-01/url-shortener test

hexagonal-pastebin-test: ## Run the hexagonal Pastebin test suite
	$(MAKE) -C hexagonal-01/pastebin test

hexagonal-blog-test: ## Run the hexagonal blog test suite
	$(MAKE) -C hexagonal-01/blog test

typescript-url-shortener-test: ## Run the TypeScript URL-shortener test suite
	$(MAKE) -C typescript-01/url-shortener test

typescript-url-shortener-typecheck: ## Type-check the TypeScript URL-shortener
	$(MAKE) -C typescript-01/url-shortener typecheck

typescript-pastebin-test: ## Run the TypeScript Pastebin test suite
	$(MAKE) -C typescript-01/pastebin test

typescript-pastebin-typecheck: ## Type-check the TypeScript Pastebin
	$(MAKE) -C typescript-01/pastebin typecheck

typescript-blog-test: ## Run the TypeScript blog test suite
	$(MAKE) -C typescript-01/blog test

typescript-blog-typecheck: ## Type-check the TypeScript blog
	$(MAKE) -C typescript-01/blog typecheck

ddd-url-shortener-test: ## Run the DDD URL-shortener tests
	$(MAKE) -C ddd-01/url-shortener test

ddd-pastebin-test: ## Run the DDD Pastebin tests
	$(MAKE) -C ddd-01/pastebin test

ddd-blog-test: ## Run the DDD blog tests
	$(MAKE) -C ddd-01/blog test

clean: ## Remove generated documentation output
	rm -rf docs/.vitepress/cache docs/.vitepress/dist


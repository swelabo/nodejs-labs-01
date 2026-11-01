.DEFAULT_GOAL := help
.SHELLFLAGS := -eu -o pipefail -c

NPM ?= npm

.PHONY: help install docs-dev docs-build docs-preview docs-lint test simple-url-shortener-test pastebin-test blog-test prisma-url-shortener-test prisma-pastebin-test prisma-blog-test usecases-url-shortener-test usecases-pastebin-test usecases-blog-test hexagonal-url-shortener-test hexagonal-pastebin-test hexagonal-blog-test typescript-url-shortener-test typescript-url-shortener-typecheck clean

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

clean: ## Remove generated documentation output
	rm -rf docs/.vitepress/cache docs/.vitepress/dist


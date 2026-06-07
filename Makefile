PHONY: help server install lint test test-watch test-ui coverage clean

PORT ?= 8088
PYTHON := python3

help:
	@echo "vonsteinkirch.com — make targets:"
	@echo "  make install      — npm install (and pre-commit hook)"
	@echo "  make server      — dev server at http://localhost:$(PORT)"
	@echo "  make lint        — run ESLint"
	@echo "  make test        — run tests once"
	@echo "  make test-watch  — vitest watch"
	@echo "  make test-ui     — vitest UI"
	@echo "  make test-coverage — vitest with coverage"
	@echo "  make clean       — remove node_modules, coverage, caches"

server:
	@echo "⭐️ starting development server on http://localhost:$(PORT)"
	@$(PYTHON) -m http.server $(PORT)

# Install deps (login shell so nvm/fnm are on PATH). test* targets depend on this.
node_modules/.bin/vitest: package.json package-lock.json
	bash -lc 'cd "$(CURDIR)" && npm install'

install: node_modules/.bin/vitest

lint: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && npm run lint'

# Use login shell so nvm/fnm (and node) are on PATH
test: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest run'

test-watch: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest'

test-ui: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest --ui'

coverage: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest run --coverage'

clean:
	rm -rf node_modules coverage .cache .vitest dist build .vite
	@echo "Cleaned node_modules, coverage, caches, and build outputs."

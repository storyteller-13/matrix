PHONY: server install lint test coverage pre-commit clean

PORT ?= 8088
PYTHON := python3

server:
	@echo "⭐️ starting development server on http://localhost:$(PORT)"
	@$(PYTHON) -m http.server $(PORT)

install: node_modules/.installed

node_modules/.installed: package.json package-lock.json
	bash -lc 'cd "$(CURDIR)" && npm install'
	@touch $@

lint: node_modules/.installed
	bash -lc 'cd "$(CURDIR)" && npm run lint'

test: node_modules/.installed
	@mkdir -p .cache
	bash -lc 'cd "$(CURDIR)" && flock .cache/test.lock ./node_modules/.bin/vitest run --coverage'

coverage: test

pre-commit: lint test

clean:
	rm -rf node_modules coverage .cache .vitest dist build .vite

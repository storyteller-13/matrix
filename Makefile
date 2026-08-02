PHONY: server install lint test coverage clean

PORT ?= 8088
PYTHON := python3

server:
	@echo "⭐️ starting development server on http://localhost:$(PORT)"
	@$(PYTHON) -m http.server $(PORT)

install:
	bash -lc 'cd "$(CURDIR)" && npm install'

lint: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && npm run lint'

test: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest run'

coverage: node_modules/.bin/vitest
	bash -lc 'cd "$(CURDIR)" && ./node_modules/.bin/vitest run --coverage'

clean:
	rm -rf node_modules coverage .cache .vitest dist build .vite


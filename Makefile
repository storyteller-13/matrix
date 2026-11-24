.PHONY: server install lint test coverage e2e e2e-install feeds check pre-commit clean

PORT ?= 8088
PYTHON := python3

server:
	@echo "⭐️ starting development server on http://localhost:$(PORT)"
	@$(PYTHON) scripts/dev-server.py $(PORT)

install: node_modules/.installed

node_modules/.installed: package.json package-lock.json
	bash -lc 'cd "$(CURDIR)" && npm install'
	@touch $@

lint: node_modules/.installed
	bash -lc 'cd "$(CURDIR)" && npm run lint'

test: node_modules/.installed
	@mkdir -p .cache
	bash -lc 'cd "$(CURDIR)" && flock .cache/test.lock ./node_modules/.bin/vitest run --configLoader runner --coverage'

# Checks required before committing: static analysis and the unit suite.
pre-commit: install lint test

coverage: test

# Browser tests (Playwright). Install the browser once with `make e2e-install`.
e2e-install: node_modules/.installed
	bash -lc 'cd "$(CURDIR)" && npx playwright install --with-deps chromium'

e2e: node_modules/.installed
	bash -lc 'cd "$(CURDIR)" && npm run test:e2e'

# Regenerates feeds/reflections.xml and feeds/quotes.json from the site data.
feeds:
	bash -lc 'cd "$(CURDIR)" && npm run feeds'

# Everything: lint, unit tests and browser tests.
check: feeds lint test e2e coverage
	git add feeds/

clean:
	rm -rf node_modules coverage .cache .vitest dist build .vite

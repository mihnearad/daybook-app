.PHONY: help build up down logs clean install-backend install-frontend dev-backend dev-frontend

help:
	@echo "DayBook - Make Commands"
	@echo ""
	@echo "Docker commands:"
	@echo "  make build          - Build Docker containers"
	@echo "  make up             - Start containers"
	@echo "  make down           - Stop containers"
	@echo "  make logs           - View container logs"
	@echo "  make clean          - Remove containers and volumes"
	@echo ""
	@echo "Local development commands:"
	@echo "  make install-backend   - Install backend dependencies"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo "  make dev-backend       - Run backend development server"
	@echo "  make dev-frontend      - Run frontend development server"

# Docker commands
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v

# Local development commands
install-backend:
	cd backend && python3 -m venv venv && \
	./venv/bin/pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

dev-backend:
	cd backend && ./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

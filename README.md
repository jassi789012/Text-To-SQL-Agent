# Text-to-SQL AI Agent

An AI-powered chatbot that lets you query a MySQL database using plain English. Ask a question → the agent discovers the schema, generates SQL, validates it, runs the query, and returns a natural-language answer — all through a clean chat UI.

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 19 · Vite                             |
| Backend  | FastAPI · Uvicorn                            |
| AI Agent | LangChain · LangGraph · Groq (gpt-oss-20b) |
| Database | MySQL · SQLAlchemy · PyMySQL                |
| History  | SQLite (LangGraph checkpoints)              |
| Runtime  | Python 3.14 · uv · Node.js                 |

## Project Structure

```
Text-To-SQL-Agent/
├── Backend/
│   ├── api.py            # FastAPI endpoints
│   ├── functions.py       # Agent setup, DB connection, chat logic
│   └── checkpoints.db     # SQLite chat history (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Chat UI component
│   │   ├── index.css      # Styles
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite config
├── DATA/                  # CSV files for database tables
├── .env                   # Environment variables (not committed)
├── pyproject.toml         # Python dependencies & project config
└── README.md
```

## Getting Started

### Prerequisites

- **Python 3.14+** — [python.org](https://www.python.org/downloads/)
- **uv** (Python package manager) — [docs.astral.sh/uv](https://docs.astral.sh/uv/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **MySQL 8.0+** — [dev.mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
- **Groq API Key** — [console.groq.com](https://console.groq.com/)

---

### Step 1 — Clone the repo & install Python dependencies

```bash
git clone https://github.com/jassi789012/Text-To-SQL-Agent.git
cd Text-To-SQL-Agent
uv sync
```

### Step 2 — Activate the virtual environment

```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat

# macOS / Linux
source .venv/bin/activate
```

### Step 3 — Install & set up MySQL

1. Download and install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - **Windows:** Use the MSI Installer and follow the setup wizard
   - **macOS:** `brew install mysql`
   - **Linux:** `sudo apt install mysql-server`
2. Start the MySQL service:
   - **Windows:** It starts automatically, or use `net start mysql`
   - **macOS/Linux:** `sudo systemctl start mysql`
3. Log in and create the database:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE text_to_sql;
   ```
4. Import the CSV files from the `DATA/` directory into the `text_to_sql` database

### Step 4 — Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your MySQL password and Groq API key.

### Step 5 — Start the backend (FastAPI)

```bash
cd Backend
uv run uvicorn api:app --reload
```

The API server will start at `http://127.0.0.1:8000`. You can test the endpoints at `http://127.0.0.1:8000/docs`.

### Step 6 — Start the frontend (React)

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

## API Endpoints

| Method   | Endpoint         | Description                        |
| -------- | ---------------- | ---------------------------------- |
| `GET`    | `/chat-history`  | Get all chat threads and messages  |
| `POST`   | `/invoke-Agent`  | Send a question to the SQL agent   |
| `DELETE` | `/delete-chat`   | Delete a chat thread by thread ID  |

## Author

**Jaswinder Singh** — [jassi789012](https://github.com/jassi789012)

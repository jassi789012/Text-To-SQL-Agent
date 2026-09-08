# Text-to-SQL AI Agent

An AI-powered agent that lets you query a MySQL database using plain English. It discovers the schema, generates SQL, validates and executes it, then returns a natural-language answer.

**Example:**

> *"Which product has the highest total sales amount?"*
>
> → `Product 26 — $117,291,821.40`

## Tech Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| LLM         | Qwen3 4B (via Ollama) / Groq / Gemini |
| Agent       | LangChain · LangGraph                |
| Database    | MySQL · SQLAlchemy · PyMySQL        |
| Environment | Python 3.14 · uv                     |

## Installation

### 1. Clone & install dependencies

```bash
git clone https://github.com/jassi789012/Text-To-SQL-Agent.git
cd Text-To-SQL-Agent
uv sync
```

### 2. Install & set up Ollama (local LLM)

1. Download and install from [ollama.com](https://ollama.com/)
2. Verify installation:
   ```bash
   ollama --version
   ```
3. Pull the model:
   ```bash
   ollama pull qwen3:4b
   ```

### 3. Install & set up MySQL

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

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=text_to_sql
```

## Usage

Start Ollama, then open and run `main.ipynb`:

```bash
ollama serve
```

```python
question = "Which product has the highest total sales amount?"

result = agent.invoke({
    "messages": [{"role": "user", "content": question}]
})
```

## Project Structure

```
Text-To-SQL-Agent/
├── DATA/              # CSV files for database tables
├── src/text_to_sql/   # Source package
├── main.ipynb         # Main notebook
├── pyproject.toml     # Dependencies & project config
└── .env               # Environment variables (not committed)
```

## Author

**Jaswinder Singh** — [jassi789012](https://github.com/jassi789012)

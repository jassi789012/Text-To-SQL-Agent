# Text-to-SQL AI Agent

An AI-powered Text-to-SQL agent that allows users to interact with a MySQL database using natural language.

The agent autonomously discovers the database schema, identifies relevant tables, generates SQL queries, validates them, executes them, and converts the results into natural-language answers.

## 🚀 Project Overview

Traditional database interaction requires users to understand SQL and the underlying database schema.

This project provides a natural-language interface to a MySQL database.

For example:

User:
Which product has the highest total sales amount?

The AI agent determines the relevant tables, understands their schema and relationships, generates the SQL query, validates it, executes it against MySQL, and returns the result.

Example generated SQL:

SELECT
    p.`Product Name`,
    SUM(s.`Line Total`) AS Total_Sales
FROM products p
JOIN sales_order s
    ON p.`Index` = s.`Product Description Index`
GROUP BY p.`Product Name`
ORDER BY Total_Sales DESC
LIMIT 1;

Result:

Product 26
$117,291,821.40

---

## 🏗️ Architecture

                        User
                          │
                          ▼
                 Natural Language
                    Question
                          │
                          ▼
                ┌──────────────────┐
                │   LangChain      │
                │      Agent       │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     LLM          │
                │    Qwen3 4B      │
                │     Ollama       │
                └────────┬─────────┘
                         │
              ┌──────────┴───────────┐
              │      SQL Tools       │
              │                      │
              │ • List tables        │
              │ • Get schema         │
              │ • Check SQL          │
              │ • Execute SQL        │
              └──────────┬───────────┘
                         │
                         ▼
                ┌──────────────────┐
                │      MySQL       │
                │     Database     │
                └────────┬─────────┘
                         │
                         ▼
                    Query Result
                         │
                         ▼
                Natural Language
                     Response

## 🔄 Agent Workflow

1. User submits a natural-language question.
2. Agent discovers available database tables.
3. Agent identifies relevant tables.
4. Agent retrieves the relevant table schemas.
5. Agent determines the required relationships.
6. Agent generates a SQL query.
7. Agent validates the SQL query.
8. Agent executes the query against MySQL.
9. Agent analyzes the returned result.
10. Agent provides a natural-language answer.

If a query produces an error, the agent can use the database error information to correct the SQL and retry.

---

## 🛠️ Tech Stack

- Python
- LangChain
- LangGraph
- Ollama
- Qwen3 4B
- MySQL
- SQLAlchemy
- PyMySQL
- python-dotenv
- uv
- Jupyter Notebook

## 🧩 Core Components

| Component          | Purpose                                       |
| ------------------ | --------------------------------------------- |
| LangChain Agent    | Orchestrates the Text-to-SQL workflow         |
| Qwen3 4B           | Natural-language reasoning and SQL generation |
| Ollama             | Runs the LLM locally                          |
| SQLDatabaseToolkit | Provides database interaction tools           |
| SQLAlchemy         | Database connection layer                     |
| PyMySQL            | MySQL database driver                         |
| MySQL              | Relational database                           |

---

## 🗄️ Database

The project uses a MySQL database containing sales, customer, product, budget, and regional data.

### Current Tables

- 2017_budgets
- customers
- products
- regions
- sales_order
- sales_orders_old
- state_regions

### Important Table Relationships

sales_order.Product Description Index
                ↓
          products.Index

sales_order.Customer Name Index
                ↓
           customers.Index

sales_order.Delivery Region Index
                ↓
            regions.Index

regions.State Code
        ↓
state_regions.State Code

These relationships allow the agent to answer questions requiring multiple-table JOINs.

---

## ⚙️ Installation

### 1. Clone the Repository

    git clone https://github.com/jassi789012/Text-To-SQL-Chatbot.git
    cd Text-To-SQL-Chatbot

### 2. Install Dependencies

This project uses uv for Python environment and dependency management.

    uv sync

This installs the dependencies specified in pyproject.toml and uv.lock.

If you need to create the virtual environment manually:

    uv venv

Windows PowerShell:

    .venv\Scripts\Activate.ps1

Windows CMD:

    .venv\Scripts\activate

---

## 🦙 Local LLM Setup

This project runs the language model locally using Ollama.

Install Ollama from:

https://ollama.com/

Download the Qwen3 4B model:

    ollama pull qwen3:4b

Test the model:

    ollama run qwen3:4b

To exit the model:

    /bye

Make sure Ollama is running before starting the agent.

---

## 🗄️ MySQL Setup

Create the database:

    CREATE DATABASE text_to_sql;

Import the CSV files from the DATA/ directory into MySQL.

The project expects:

Host: localhost
Port: 3306
Database: text_to_sql

---

## 🔐 Environment Variables

Create a .env file in the project root.

Example:

    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=your_mysql_username
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=text_to_sql

If using a cloud model such as Groq:

    GROQ_API_KEY=your_groq_api_key

IMPORTANT:

Never commit .env to GitHub.

Add the following to .gitignore:

    .env
    .venv/
    __pycache__/
    *.pyc
    .ipynb_checkpoints/

Instead, create an .env.example file:

    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=your_mysql_username
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=text_to_sql
    GROQ_API_KEY=your_groq_api_key

---

## ▶️ Usage

Start Ollama:

    ollama serve

Then open:

    main.ipynb

Run the notebook and initialize the agent.

Example:

    question = "Which product has the highest total sales amount?"

    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": question
                }
            ]
        }
    )

The agent determines which database tools are required to answer the question.

---

## 🔧 SQL Tools

The agent uses LangChain's SQLDatabaseToolkit.

### sql_db_list_tables

Lists the tables available in the database.

### sql_db_schema

Retrieves the schema and sample rows for relevant tables.

This allows the LLM to understand:

- Table names
- Column names
- Data types
- Example data
- Potential relationships between tables

### sql_db_query_checker

Validates the generated SQL query before execution.

### sql_db_query

Executes the validated SQL query against MySQL and returns the result.

The LLM then converts the database result into a natural-language response.

---

## 🛡️ Safety

The agent is designed to perform read-only database operations.

The system prompt instructs the agent not to execute data-modifying operations such as:

- INSERT
- UPDATE
- DELETE
- DROP
- ALTER
- TRUNCATE
- CREATE

For production applications, a dedicated MySQL read-only user should also be used.

Example:

    CREATE USER 'sql_agent'@'localhost'
    IDENTIFIED BY 'strong_password';

    GRANT SELECT ON text_to_sql.*
    TO 'sql_agent'@'localhost';

This provides an additional layer of protection even if the model attempts to generate an unsafe query.

---

## 📊 Benchmark Results

The agent is being evaluated using questions with increasing levels of difficulty.

The benchmark evaluates:

- Table selection
- Schema understanding
- SQL generation
- JOIN accuracy
- Aggregation
- SQL validation
- Tool usage
- Query execution
- Result interpretation

### Preliminary Results — Qwen3 4B

| Test                            | Difficulty | Result  |
| ------------------------------- | ---------- | ------- |
| Count products                  | Easy       | ✅ Pass |
| Find product with highest sales | Medium     | ✅ Pass |
| Find state with highest sales   | Hard       | ❌ Fail |

### Test 1 — Count Products

Question:

How many products are there in the database?

Generated SQL:

    SELECT COUNT(*) FROM products;

Database Result:

    30

Final Answer:

There are 30 products in the database.

Result: ✅ Pass

### Test 2 — Highest-Selling Product

Question:

Which product has the highest total sales amount?

Generated SQL:

    SELECT
        p.`Product Name`,
        SUM(s.`Line Total`) AS Total_Sales
    FROM products p
    JOIN sales_order s
        ON p.`Index` = s.`Product Description Index`
    GROUP BY p.`Product Name`
    ORDER BY Total_Sales DESC
    LIMIT 1;

Database Result:

    Product 26
    117291821.40000035

Final Answer:

The product with the highest total sales amount is Product 26, with a total sales value of $117,291,821.40.

Result: ✅ Pass

### Test 3 — Highest-Selling State

Question:

Which state generated the highest total sales amount?

The model selected:

- sales_order
- state_regions

but generated an incorrect JOIN:

    JOIN sales_order so
        ON s.Region = so.`Delivery Region Index`

The problem is that state_regions.Region contains region names such as:

- South
- West
- Midwest
- Northeast

while sales_order.Delivery Region Index contains numeric region indexes.

The correct relationship requires the intermediate regions table.

Expected relationship:

sales_order
     │
     │ Delivery Region Index
     ▼
regions
     │
     │ State Code
     ▼
state_regions
     │
     ▼
State

Result: ❌ Fail

---

## 📈 Current Benchmark Summary

| Capability                | Status                 |
| ------------------------- | ---------------------- |
| Simple SQL / Aggregation  | ✅ Good                |
| Basic JOINs               | ✅ Good                |
| Schema inspection         | ✅ Good                |
| Tool calling              | ✅ Good                |
| Result interpretation     | ✅ Good                |
| Complex multi-table JOINs | ⚠️ Needs improvement |
| Indirect relationships    | ⚠️ Needs improvement |

The current model performs well on straightforward SQL tasks but can struggle when relationships between tables require an indirect JOIN path.

---

## 🧪 Benchmark Questions

### Basic

- How many products are there?
- How many customers are there?
- What is the total sales amount?
- What is the average unit price?
- What are the different sales channels?

### Intermediate

- Which product generated the highest sales?
- Which customer generated the highest sales?
- What are the top 5 products by sales?
- Which state generated the highest sales?
- Which city generated the highest sales?

### Advanced

- Which customer from California generated the highest sales?
- Which region has the highest revenue?
- Which product contributed the most revenue and what percentage of total revenue did it generate?
- Which state generated the most revenue and which customer in that state generated the most revenue?
- For each sales region, show total revenue and total quantity sold.

---

## 🚧 Current Limitations

The current local model is Qwen3 4B.

It performs well on many basic and intermediate Text-to-SQL tasks, but smaller models can struggle with complex database reasoning.

Current limitations include:

- Complex multi-table JOINs can be unreliable
- Indirect table relationships can be difficult for the model to discover
- Ambiguous database relationships can cause incorrect SQL
- Local inference can be slow on consumer hardware
- SQL generation quality depends heavily on schema clarity
- The benchmark is still being expanded

---

## ☁️ Cloud Model Support

The architecture is designed so that the LLM can be replaced without changing the database and SQL-tool layer.

### Local Model

Ollama
   ↓
Qwen3 4B
   ↓
LangChain Agent
   ↓
SQLDatabaseToolkit
   ↓
MySQL

### Cloud Model

Groq API
   ↓
Tool-Calling LLM
   ↓
LangChain Agent
   ↓
SQLDatabaseToolkit
   ↓
MySQL

This allows local and cloud models to be benchmarked using the same database, tools, questions, and evaluation criteria.

---

## 🔮 Future Improvements

- [ ] Improve database relationship discovery
- [ ] Add explicit schema relationship metadata
- [ ] Improve complex multi-table JOIN handling
- [ ] Add automatic SQL error recovery
- [ ] Add stronger SQL validation
- [ ] Add query-result verification
- [ ] Benchmark multiple LLMs
- [ ] Compare Qwen3 4B with larger cloud models
- [ ] Add Groq API support
- [ ] Add Streamlit web interface
- [ ] Add automated Text-to-SQL evaluation
- [ ] Track SQL accuracy and execution latency
- [ ] Add read-only database user
- [ ] Improve handling of ambiguous natural-language questions

---

## 📁 Project Structure

Text-To-SQL/
│
├── DATA/
│   ├── 2017_Budgets.csv
│   ├── customers.csv
│   ├── products.csv
│   ├── regions.csv
│   ├── sales_order.csv
│   ├── Sales_Orders_old.csv
│   └── State_Regions.csv
│
├── src/
│   └── text_to_sql/
│       └── __init__.py
│
├── main.ipynb
├── pyproject.toml
├── uv.lock
├── .python-version
├── .env.example
└── .gitignore

---

## 🎯 Learning Goals

This project was built to explore practical implementation of:

- Large Language Models
- Text-to-SQL
- AI Agents
- Tool Calling
- LangChain
- LangGraph
- Database Schema Reasoning
- SQL Generation
- SQL Validation
- MySQL Integration
- Local LLM Inference
- Ollama
- Agent Evaluation
- LLM Benchmarking

---

## 💡 Key Learning

The goal of this project is not simply to convert natural language into SQL.

The goal is to build an agent capable of reasoning about a database, selecting the appropriate tools, generating SQL, validating the query, executing it, and interpreting the result.

The complete workflow is:

Natural Language
       ↓
Database Understanding
       ↓
Tool Selection
       ↓
SQL Generation
       ↓
SQL Validation
       ↓
SQL Execution
       ↓
Result Interpretation
       ↓
Natural Language Answer

This makes the project an exploration of agentic Text-to-SQL systems rather than a simple natural-language-to-SQL converter.

---

## 👨‍💻 Author

### Jaswinder Singh

This project is part of my journey toward building practical AI Engineering projects involving:

- LLMs
- AI Agents
- Tool Calling
- Databases
- Text-to-SQL
- Local LLMs
- LangChain
- LangGraph

---

## ⭐ Future Goal

The long-term goal is to evolve this project into a production-oriented Text-to-SQL application capable of reliably answering complex business questions across multiple relational database tables while maintaining safe, read-only database access.

# importing Database

import os

from dotenv import load_dotenv

from langchain_community.utilities import SQLDatabase

load_dotenv()

mysql_uri = (
    f"mysql+pymysql://"
    f"{os.getenv('MYSQL_USER')}:"
    f"{os.getenv('MYSQL_PASSWORD')}@"
    f"{os.getenv('MYSQL_HOST')}:"
    f"{os.getenv('MYSQL_PORT')}/"
    f"{os.getenv('MYSQL_DATABASE')}"
)

db = SQLDatabase.from_uri(mysql_uri)

print("Dialect:", db.dialect)
print("Tables:", db.get_usable_table_names())

# adding sqlite to save checkpoints

import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

conn = sqlite3.connect(
    'checkpoints.db',
    check_same_thread=False
)

checkpoint = SqliteSaver(conn)

# importing llm

# from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="openai/gpt-oss-20b",
)

# importing SQL Tools

from langchain_community.agent_toolkits import SQLDatabaseToolkit

toolkit = SQLDatabaseToolkit(
    db = db,
    llm = llm
)

tools = toolkit.get_tools()

system_prompt = f"""
You are an agent designed to interact with a MySQL database.

Given a user's question, determine the relevant tables and columns,
generate a syntactically correct MySQL SQL query, execute it, and
return a clear natural-language answer.

Rules:

1. Always inspect the available tables first.
2. Retrieve the schema of relevant tables before generating SQL.
3. Only query tables that are relevant to the user's question.
4. Only select columns that are necessary.
5. Always check the SQL query before executing it.
6. If the SQL query produces an error, analyze the error and fix the query.
7. NEVER execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE,
   CREATE, or other data-modifying statements.
8. Only perform read-only queries.
9. Do not expose unnecessary database details to the user.
10. Return the final answer in clear natural language.

11. After the SQL query has been checked and approved,
    ALWAYS execute the query using sql_db_query before producing
    the final answer.

12. NEVER infer numerical results from sample rows returned by
    sql_db_schema. Numerical answers must come from executing SQL.

13. Do not answer a database question using information from the
    schema sample rows when the answer can be obtained by executing SQL.

Database dialect: {db.dialect}
"""



from langchain.agents import create_agent

agent = create_agent(
    model = llm,
    tools=tools,
    system_prompt=system_prompt,
    checkpointer=checkpoint
)

def get_chat_history():
    rows = conn.execute(
        "SELECT DISTINCT thread_id FROM checkpoints"
    ).fetchall()

    chat_history = {
        "threads": {}
    }

    for (thread_id,) in rows:
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }

        state = agent.get_state(config)

        messages = []

        for msg in state.values["messages"]:
            if msg.type == "human" and msg.content:
                messages.append({
                    "role": "user",
                    "content": msg.content
                })

            elif msg.type == "ai" and msg.content:
                messages.append({
                    "role": "assistant",
                    "content": msg.content
                })

        chat_history["threads"][thread_id] = messages

    return chat_history

def delete_chat(config):
    """Delete all saved checkpoint data for a specific thread."""
    
    thread_id = config['config']['configurable']['thread_id']

    print(thread_id)

    conn.execute(
        "DELETE FROM checkpoints WHERE thread_id = ?",
        (thread_id,)
    )
    
    conn.execute(
        "DELETE FROM writes WHERE thread_id = ?",
        (thread_id,)
    )
    
    conn.commit()
    
    print(f"Thread '{thread_id}' deleted successfully.")

def invoke_Agent(config, question):
    agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": question
            }
        ]
    },
    config=config
    )

    return 'message sent succesfully'

    
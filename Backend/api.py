# command to run api server 
# uv run uvicorn api:app --reload

# link to open interactive interface 
# http://127.0.0.1:8000/docs

from fastapi import FastAPI

from functions import get_chat_history, delete_chat, invoke_Agent

app = FastAPI()


@app.get("/chat-history")
def chat_history():
    return get_chat_history()


@app.post("/invoke-Agent")

# input dic syntax :-
# {
#   "config": {
#     "configurable": {
#       "thread_id": "user_3"
#     }
#   },
#   "question": "Which product has the highest total sales?"
# }

def chat(data: dict):
    return invoke_Agent(
        data["config"],
        data["question"]
    )


@app.delete("/delete-chat")

# input dic syntax :-
# {
#   "config": {
#     "configurable": {
#       "thread_id": "user_3"
#     }
#   }
# }

def delete_chat_endpoint(config: dict):
    return delete_chat(config)
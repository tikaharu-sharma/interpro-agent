
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.errors import GraphRecursionError
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from adv_agent import graph


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class ChatRequest(BaseModel):
    query: str
    thread_id: str


@app.post("/chat")
def chat(request: ChatRequest):

    turn_input = {
    "query": request.query,
    "messages": [HumanMessage(content=request.query)],
    "proteins": None,
    "go_terms": None,
    "entities": None,
    "query_protein": None,
    "ortholog_results": [],
    }


    try:
        result = graph.invoke(
            turn_input,
            config={
                "recursion_limit": 40,
                "configurable": {"thread_id": request.thread_id},
                },
        )
    except GraphRecursionError:
        raise HTTPException(
            status_code=422,
            detail="This question needed too many steps. Try a more specific question."
        )
    except Exception:
        logging.exception("agent failed")
        raise HTTPException(
            status_code=500,
            detail="The agent hit an error. Please try again."
        )

    final_message = result["messages"][-1]

    answer = final_message.content

    if not isinstance(answer, str):
        answer = str(answer)

    return {
        "answer": answer,
        "query_protein": result.get("query_protein"),
        "proteins": result.get("proteins", []),
        "go_terms": result.get("go_terms", []),
        "entities": result.get("entities", []),
        "ortholog_results": result.get("ortholog_results", [])
    }

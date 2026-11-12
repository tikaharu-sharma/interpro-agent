
import logging
import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from langgraph.errors import GraphRecursionError
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from adv_agent import graph


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

LOG_PATH = Path(os.getenv("CHAT_LOG_PATH", Path(__file__).parent / "logs" / "chat.jsonl"))
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
_log_lock = threading.Lock()  # ponytail: one process, one file; move to a DB table if we run several workers


def log_turn(record: dict) -> None:
    try:
        line = json.dumps(record, ensure_ascii=False, default=str)
        with _log_lock, LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        logging.exception("could not write chat log")

def tool_calls_this_turn(messages: list) -> list[dict]:
    last_human = max(
        (i for i, m in enumerate(messages) if isinstance(m, HumanMessage)),
        default=0,
    )
    return [
        {"name": call["name"], "args": call["args"]}
        for m in messages[last_human:]
        if isinstance(m, AIMessage)
        for call in m.tool_calls
    ]




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


    started = time.monotonic()
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "thread_id": request.thread_id,
        "query": request.query,
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
        log_turn({**record, "error": "recursion_limit", "seconds": round(time.monotonic() - started, 1)})
        raise HTTPException(
            status_code=422,
            detail="This question needed too many steps. Try a more specific question."
        )
    except Exception as e:
        logging.exception("agent failed")
        log_turn({**record, "error": repr(e), "seconds": round(time.monotonic() - started, 1)})
        raise HTTPException(
            status_code=500,
            detail="The agent hit an error. Please try again."
        )

    answer = result["messages"][-1].content
    tool_calls = tool_calls_this_turn(result["messages"])
    if not isinstance(answer, str):
        answer = str(answer)

    log_turn({
        **record,
        "answer": answer,
        "tool_calls": tool_calls,
        "counts": {
            "proteins": len(result.get("proteins") or []),
            "go_terms": len(result.get("go_terms") or []),
            "entities": len(result.get("entities") or []),
            "ortholog_results": len(result.get("ortholog_results") or []),
        },
        "seconds": round(time.monotonic() - started, 1),
        "error": None,
    })

    return {
        "answer": answer,
        "query_protein": result.get("query_protein"),
        "proteins": result.get("proteins", []),
        "go_terms": result.get("go_terms", []),
        "entities": result.get("entities", []),
        "ortholog_results": result.get("ortholog_results", []),
        "tool_calls": tool_calls,
    }


# Serve the built frontend (frontend/dist) from the same origin, so the app calls /chat on this server.
# Mounted last: routes defined above (like /chat) take precedence over this catch-all.
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

"""Shared State feature."""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()
import json
from enum import Enum
from typing import Dict, List, Any, Optional
from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint

# ADK imports
from google.adk.agents import LlmAgent, Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.sessions import InMemorySessionService, Session
from google.adk.runners import Runner
from google.adk.events import Event, EventActions
from google.adk.tools import FunctionTool, ToolContext
from google.genai.types import Content, Part , FunctionDeclaration
from google.adk.models import LlmResponse, LlmRequest
from google.genai import types

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

from vacAI import prompt

from vacAI.sub_agents.vacAI_Keeper.agent import vacAI_Keeper
from vacAI.sub_agents.vacAI_Voyager.agent import vacAI_Voyager
from vacAI.sub_agents.vacAI_Spark.agent import vacAI_Spark
from vacAI.sub_agents.vacAI_Weaver.agent import vacAI_Weaver
from vacAI.sub_agents.vacAI_Echo.agent import vacAI_Echo
from vacAI.sub_agents.vacAI_Herald.agent import vacAI_Herald
from vacAI.sub_agents.vacAI_Companion.agent import vacAI_Companion

# from vacAI.tools.memory import _load_precreated_itinerary
from vacAI.tools.memory import _combined_before_agent_logic

from vacAI.tools.search import google_search_grounding

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


def get_weather(tool_context: ToolContext, location: str) -> Dict[str, str]:
    """Get the weather for a given location. Ensure location is fully spelled out."""
    return {"status": "success", "message": f"The weather in {location} is sunny."}

root_agent = Agent(
    model="gemini-2.5-flash",
    name="vacAI",
    description="A smart travel companion using the services of multiple sub-agents",
    instruction=prompt.ROOT_AGENT_INSTR,
    sub_agents=[
        vacAI_Spark,
        vacAI_Weaver,
        vacAI_Keeper,
        vacAI_Herald,
        vacAI_Voyager,
        vacAI_Echo,
        vacAI_Companion
    ],
    before_agent_callback=_combined_before_agent_logic,
    generate_content_config={"safety_settings":safety_settings}
    tools=[get_weather],
)

# Create ADK middleware agent instance
adk_middleware_agent = ADKAgent(
    adk_agent=root_agent,
    app_name="vacAI",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

# Create FastAPI app
app = FastAPI(title="vacAI")

# Add the ADK endpoint
add_adk_fastapi_endpoint(app, adk_middleware_agent, path="/")

if __name__ == "__main__":
    import os
    import uvicorn

    if not os.getenv("GOOGLE_API_KEY"):
        print("⚠️  Warning: GOOGLE_API_KEY environment variable not set!")
        print("   Set it with: export GOOGLE_API_KEY='your-key-here'")
        print("   Get a key from: https://makersuite.google.com/app/apikey")
        print()

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=8000)

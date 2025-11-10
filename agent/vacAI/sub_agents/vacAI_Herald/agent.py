from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from vacAI.shared_libraries import types
from vacAI.sub_agents.vacAI_Herald import prompt
from vacAI.tools.search import google_search_grounding

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


what_to_pack_agent = Agent(
    model="gemini-2.5-flash",
    name="what_to_pack_agent",
    description="Make suggestion on what to bring for the trip",
    instruction=prompt.WHATTOPACK_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_key="what_to_pack",
    output_schema=types.PackingList,
    generate_content_config= {"safety_settings": safety_settings},
)

vacAI_Herald = Agent(
    model="gemini-2.5-flash",
    name="vacAI_Herald",
    description="Given an itinerary, this agent keeps up to date and provides relevant travel information to the user before the trip.",
    instruction=prompt.PRETRIP_AGENT_INSTR,
    tools=[google_search_grounding, AgentTool(agent=what_to_pack_agent)],
    generate_content_config= {"safety_settings": safety_settings},
)

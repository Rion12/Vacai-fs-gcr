from google.adk.agents import Agent

from vacAI.sub_agents.vacAI_Echo import prompt
from vacAI.tools.memory import memorize

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


vacAI_Echo = Agent(
    model="gemini-2.5-flash",
    name="vacAI_Echo",
    description="A follow up agent to learn from user's experience; In turn improves the user's future trips planning and in-trip experience.",
    instruction=prompt.POSTTRIP_INSTR,
    tools=[memorize],
    generate_content_config= {"safety_settings": safety_settings},
)

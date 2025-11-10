from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from google.genai.types import GenerateContentConfig

from vacAI.sub_agents.vacAI_Keeper import prompt

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


create_reservation = Agent(
    model="gemini-2.5-flash",
    name="create_reservation",
    description="""Create a reservation for the selected item.""",
    instruction=prompt.CONFIRM_RESERVATION_INSTR,
    generate_content_config= {"safety_settings": safety_settings},
)


payment_choice = Agent(
    model="gemini-2.5-flash",
    name="payment_choice",
    description="""Show the users available payment choices.""",
    instruction=prompt.PAYMENT_CHOICE_INSTR,
    generate_content_config= {"safety_settings": safety_settings},
)

process_payment = Agent(
    model="gemini-2.5-flash",
    name="process_payment",
    description="""Given a selected payment choice, processes the payment, completing the transaction.""",
    instruction=prompt.PROCESS_PAYMENT_INSTR,
    generate_content_config= {"safety_settings": safety_settings},
)


vacAI_Keeper = Agent(
    model="gemini-2.5-flash",
    name="vacAI_Keeper",
    description="Given an itinerary, complete the bookings of items by handling payment choices and processing.",
    instruction=prompt.BOOKING_AGENT_INSTR,
    tools=[
        AgentTool(agent=create_reservation),
        AgentTool(agent=payment_choice),
        AgentTool(agent=process_payment),
    ],
    generate_content_config=GenerateContentConfig(
        temperature=0.0, top_p=0.5,safety_settings=safety_settings
    )
)

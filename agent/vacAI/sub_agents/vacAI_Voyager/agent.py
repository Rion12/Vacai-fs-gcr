from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

from vacAI.sub_agents.vacAI_Voyager import prompt
from vacAI.sub_agents.vacAI_Voyager.tools import (
    transit_coordination,
    flight_status_check,
    event_booking_check,
    weather_impact_check,
)

from vacAI.tools.memory import memorize

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]



# This sub-agent is expected to be called every day closer to the trip, and frequently several times a day during the trip.
day_of_agent = Agent(
    model="gemini-2.5-flash",
    name="day_of_agent",
    description="Day_of agent is the agent handling the travel logistics of a trip.",
    instruction=transit_coordination,
    generate_content_config= {"safety_settings": safety_settings},

)


trip_monitor_agent = Agent(
    model="gemini-2.5-flash",
    name="trip_monitor_agent",
    description="Monitor aspects of a itinerary and bring attention to items that necessitate changes",
    instruction=prompt.TRIP_MONITOR_INSTR,
    tools=[flight_status_check, event_booking_check, weather_impact_check],
    output_key="daily_checks",  # can be sent via email.
    generate_content_config= {"safety_settings": safety_settings},
)


vacAI_Voyager = Agent(
    model="gemini-2.5-flash",
    name="vacAI_Voyager",
    description="Provide information about what the users need as part of the tour.",
    instruction=prompt.INTRIP_INSTR,
    sub_agents=[
        trip_monitor_agent
    ],  # This can be run as an AgentTool. Illustrate as an Agent for demo purpose.
    tools=[
        AgentTool(agent=day_of_agent), 
        memorize
    ],
    generate_content_config= {"safety_settings": safety_settings},
)

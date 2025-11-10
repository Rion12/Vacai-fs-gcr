from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from google.genai.types import GenerateContentConfig
from vacAI.shared_libraries import types
from vacAI.sub_agents.vacAI_Weaver import prompt
from vacAI.tools.memory import memorize
from vacAI.tools.search import google_search_grounding

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]



itinerary_agent = Agent(
    model="gemini-2.5-flash",
    name="itinerary_agent",
    description="Create and persist a structured JSON representation of the itinerary",
    instruction=prompt.ITINERARY_AGENT_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.Itinerary,
    output_key="itinerary",
    generate_content_config=types.json_response_config,
)


hotel_room_selection_agent = Agent(
    model="gemini-2.5-flash",
    name="hotel_room_selection_agent",
    description="Help users with the room choices for a hotel",
    instruction=prompt.HOTEL_ROOM_SELECTION_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.RoomsSelection,
    output_key="room",
    generate_content_config=types.json_response_config,
)

hotel_search_agent = Agent(
    model="gemini-2.5-flash",
    name="hotel_search_agent",
    description="Help users find hotel around a specific geographic area",
    instruction=prompt.HOTEL_SEARCH_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.HotelsSelection,
    output_key="hotel",
    generate_content_config=types.json_response_config,
)


flight_seat_selection_agent = Agent(
    model="gemini-2.5-flash",
    name="flight_seat_selection_agent",
    description="Help users with the seat choices",
    instruction=prompt.FLIGHT_SEAT_SELECTION_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.SeatsSelection,
    output_key="flightSeat",
    generate_content_config=types.json_response_config,
)

flight_search_agent = Agent(
    model="gemini-2.5-flash",
    name="flight_search_agent",
    description="Help users find best flight deals",
    instruction=prompt.FLIGHT_SEARCH_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.FlightsSelection,
    output_key="flight",
    generate_content_config=types.json_response_config,
)

train_search_agent = Agent(
    model="gemini-2.5-flash",
    name="train_search_agent",
    description="Help users find best train deals",
    instruction=prompt.TRAIN_SEARCH_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.TrainsSelection,
    output_key="train",
    generate_content_config=types.json_response_config,
)

train_selection_agent = Agent(
    model="gemini-2.5-flash",
    name="train_selection_agent",
    description="Help users with the train choices",
    instruction=prompt.TRAIN_CLASS_SELECTION_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.TrainSeatsSelection,
    output_key="trainSeat",
    generate_content_config=types.json_response_config,
)

bus_search_agent = Agent(
    model="gemini-2.5-flash",
    name="bus_search_agent",
    description="Help users find best bus deals",
    instruction=prompt.BUS_SEARCH_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.BusSelection,
    output_key="bus",
    generate_content_config=types.json_response_config,
)

bus_seat_selection_agent = Agent(
    model="gemini-2.5-flash",
    name="bus_selection_agent",
    description="Help users with the bus seat choices",
    instruction=prompt.BUS_SEAT_SELECTION_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.BusSeatsSelection,
    output_key="busSeat",
    generate_content_config=types.json_response_config,
)    

cab_search_agent = Agent(
    model="gemini-2.5-flash",
    name="cab_search_agent",
    description="Help users find best cab deals",
    instruction=prompt.CAB_SEARCH_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.CabSelection,
    output_key="cab",
    generate_content_config=types.json_response_config,
)

cab_type_selection_agent = Agent(
    model="gemini-2.5-flash",
    name="cab_type_selection_agent",
    description="Help users with the train choices",
    instruction=prompt.CAB_SEAT_SELECTION_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.CabSeatsSelection,
    output_key="CabSeat",
    generate_content_config=types.json_response_config,
)

transport_mode_selector_agent = Agent(
    model="gemini-2.5-flash",
    name="transport_mode_selector_agent",
    description="Analyze user queries and select the most appropriate transport mode (Flight, Train, Bus, or Cab)",
    instruction=prompt.TRANSPORT_MODE_SELECTOR_INSTR,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
    output_schema=types.TransportModeSelection,
    output_key="transport_mode",
    generate_content_config=types.json_response_config,
    tools=[google_search_grounding]
)

vacAI_Weaver = Agent(
    model="gemini-2.5-flash",
    description="""Helps users with travel planning, complete a full itinerary for their vacation, finding best deals for flights and hotels.""",
    name="vacAI_Weaver",
    instruction=prompt.PLANNING_AGENT_INSTR,
    tools=[
        AgentTool(agent=train_search_agent),
        AgentTool(agent=train_selection_agent),
        AgentTool(agent=bus_search_agent),
        AgentTool(agent=bus_seat_selection_agent),
        AgentTool(agent=cab_search_agent),
        AgentTool(agent=cab_type_selection_agent),
        AgentTool(agent=flight_search_agent),
        AgentTool(agent=flight_seat_selection_agent),
        AgentTool(agent=hotel_search_agent),
        AgentTool(agent=hotel_room_selection_agent),
        AgentTool(agent=itinerary_agent),
        AgentTool(agent=transport_mode_selector_agent),
        memorize,
        google_search_grounding
    ],
    generate_content_config=GenerateContentConfig(
        temperature=0.1, top_p=0.5, safety_settings=safety_settings
    )
)

from typing import Optional, Union, Literal
from datetime import datetime 
from google.genai import types
from pydantic import BaseModel, Field

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


# Convenient declaration for controlled generation.
json_response_config = types.GenerateContentConfig(
    response_mime_type="application/json",
    safety_settings=safety_settings
)


class Room(BaseModel):
    """A room for selection."""
    is_available: bool = Field(
        description="Whether the room type is available for selection."
    )
    price_in_usd: int = Field(description="The cost of the room selection.")
    room_type: str = Field(
        description="Type of room, e.g. Twin with Balcon, King with Ocean View... etc."
    )


class RoomsSelection(BaseModel):
    """A list of rooms for selection."""
    rooms: list[Room]


class Hotel(BaseModel):
    """A hotel from the search."""
    name: str = Field(description="Name of the hotel")
    address: str = Field(description="Full address of the Hotel")
    check_in_time: str = Field(description="Time in HH:MM format, e.g. 16:00")
    check_out_time: str = Field(description="Time in HH:MM format, e.g. 15:30")
    thumbnail: str = Field(description="Hotel logo location")
    price: int = Field(description="Price of the room per night")


class HotelsSelection(BaseModel):
    """A list of hotels from the search."""
    hotels: list[Hotel]


class Seat(BaseModel):
    """A Seat from the search."""
    is_available: bool = Field(
        description="Whether the seat is available for selection."
    )
    price_in_usd: int = Field(description="The cost of the seat selection.")
    seat_number: str = Field(description="Seat number, e.g. 22A, 34F... etc.")


class SeatsSelection(BaseModel):
    """A list of seats from the search."""
    seats: list[list[Seat]]


class AirportEvent(BaseModel):
    """An Airport event."""
    city_name: str = Field(description="Name of the departure city")
    airport_code: str = Field(description="IATA code of the departure airport")
    timestamp: str = Field(description="ISO 8601 departure or arrival date and time")


class Flight(BaseModel):
    """A Flight search result."""
    flight_number: str = Field(
        description="Unique identifier for the flight, like BA123, AA31, etc."
    )
    departure: AirportEvent
    arrival: AirportEvent
    airlines: list[str] = Field(
        description="Airline names, e.g., American Airlines, Emirates"
    )
    airline_logo: str = Field(description="Airline logo location")
    price_in_usd: int = Field(description="Flight price in US dollars")
    number_of_stops: int = Field(description="Number of stops during the flight")


class FlightsSelection(BaseModel):
    """A list of flights from the search."""
    flights: list[Flight]


class Destination(BaseModel):
    """A destination recommendation."""
    name: str = Field(description="A Destination's Name")
    country: str = Field(description="The Destination's Country Name")
    image: str = Field(description="verified URL to an image of the destination")
    highlights: str = Field(description="Short description highlighting key features")
    rating: str = Field(description="Numerical rating (e.g., 4.5)")

class TrainEvent(BaseModel):
    """Details about train departure or arrival."""
    station_name: str = Field(description="Name of the station")
    station_code: str = Field(description="Station Code, e.g. NDLS")
    timestamp: str = Field(description="ISO 8601 departure/arrival date and time")


class Train(BaseModel):
    """A Train search result."""
    train_number: str = Field(description="Unique identifier for the train, e.g., 12028")
    train_name: str = Field(description="Name of the train, e.g., Shatabdi Express")
    departure: TrainEvent
    arrival: TrainEvent
    train_type: str = Field(description="Type of train, e.g., Superfast, Express, Rajdhani")
    price_in_inr: int = Field(description="Ticket price in Indian Rupees")
    number_of_stops: int = Field(description="Number of stops during the journey")


class TrainsSelection(BaseModel):
    """A list of trains from the search."""
    trains: list[Train]

class TrainClassOption(BaseModel):
    """Represents a class option on a train."""
    class_type: str = Field(description="Class type, e.g., Sleeper, 3AC, 2AC, 1AC, CC, 2S, 3E")
    is_available: bool = Field(description="Whether tickets are available for this class")
    price_in_inr: int = Field(description="Ticket price in Indian Rupees")


class TrainSeatsSelection(BaseModel):
    """A list of class options for a train."""
    classes: list[TrainClassOption]



class BusEvent(BaseModel):
    """Details about bus departure or arrival."""
    station_name: str = Field(description="Name of the bus station or stop")
    timestamp: str = Field(description="ISO 8601 departure/arrival date and time")


class Bus(BaseModel):
    """A Bus search result."""
    bus_number: str = Field(description="Unique identifier for the bus, e.g., KA-01-AB-1234")
    bus_name: str = Field(description="Name of the bus operator")
    departure: BusEvent
    arrival: BusEvent
    bus_type: str = Field(description="AC Sleeper, Non-AC Seater, Volvo, etc.")
    price_in_inr: int = Field(description="Ticket price in Indian Rupees")
    number_of_stops: int = Field(description="Number of stops en route")


class BusSelection(BaseModel):
    """A list of buses from the search."""
    buses: list[Bus]

class BusSeat(BaseModel):
    """Represents a seat on a bus."""
    seat_number: str = Field(description="Seat identifier, e.g., 1A, 2B")
    is_available: bool = Field(description="Whether the seat is available")
    seat_type: str = Field(description="Seat type, e.g., Sleeper, Seater, Window, Aisle")
    price_in_inr: int = Field(description="Price of the seat in Indian Rupees")


class BusSeatsSelection(BaseModel):
    """A list of seat options for a bus."""
    seats: list[BusSeat]


class CabEvent(BaseModel):
    """Details about cab pickup or drop."""
    location_name: str = Field(description="Name of the pickup/drop location")
    timestamp: str = Field(description="ISO 8601 pickup/drop date and time")


class Cab(BaseModel):
    """A Cab search result."""
    cab_id: str = Field(description="Unique identifier for the cab, e.g., CAB1234")
    cab_type: str = Field(description="Sedan, SUV, Hatchback, Mini, Luxury")
    operator_name: str = Field(description="Cab service operator name")
    pickup: CabEvent
    drop: CabEvent
    price_in_inr: int = Field(description="Fare in Indian Rupees")
    available_seats: int = Field(description="Number of seats available")


class CabSelection(BaseModel):
    """A list of cabs from the search."""
    cabs: list[Cab]


class CabOption(BaseModel):
    """Represents a cab option for selection."""
    cab_type: str = Field(description="Cab type, e.g., Sedan, SUV, Mini, Luxury")
    is_available: bool = Field(description="Whether this cab type is available")
    max_seats: int = Field(description="Maximum passenger capacity")
    price_in_inr: int = Field(description="Fare in Indian Rupees")


class CabSeatsSelection(BaseModel):
    """A list of cab options available."""
    cab_options: list[CabOption]



class DestinationIdeas(BaseModel):
    """Destinations recommendation."""
    places: list[Destination]


class POI(BaseModel):
    """A Point Of Interest suggested by the agent."""
    place_name: str = Field(description="Name of the attraction")
    address: str = Field(
        description="An address or sufficient information to geocode for a Lat/Lon"
    )
    lat: str = Field(
        description="Numerical representation of Latitude of the location (e.g., 20.6843)"
    )
    long: str = Field(
        description="Numerical representation of Longitude of the location (e.g., -88.5678)"
    )
    review_ratings: str = Field(
        description="Numerical representation of rating (e.g. 4.8 , 3.0 , 1.0 etc)"
    )
    highlights: str = Field(description="Short description highlighting key features")
    image_url: str = Field(description="verified URL to an image of the destination")
    map_url: Optional[str] = Field(description="Verified URL to Google Map")
    place_id: Optional[str] = Field(description="Google Map place_id")


class POISuggestions(BaseModel):
    """Points of interest recommendation."""
    places: list[POI]


class AttractionEvent(BaseModel):
    """An Attraction."""
    event_type: str = Field(default="visit")
    description: str = Field(
        description="A title or description of the activity or the attraction visit"
    )
    address: str = Field(description="Full address of the attraction")
    start_time: str = Field(description="Time in HH:MM format, e.g. 16:00")
    end_time: str = Field(description="Time in HH:MM format, e.g. 16:00")
    booking_required: bool = Field(default=False)
    price: Optional[str] = Field(description="Some events may cost money")


class FlightEvent(BaseModel):
    """A Flight Segment in the itinerary."""
    event_type: str = Field(default="flight")
    description: str = Field(description="A title or description of the Flight")
    booking_required: bool = Field(default=True)
    departure_airport: str = Field(description="Airport code, i.e. SEA")
    arrival_airport: str = Field(description="Airport code, i.e. SAN")
    flight_number: str = Field(description="Flight number, e.g. UA5678")
    boarding_time: str = Field(description="Time in HH:MM format, e.g. 15:30")
    seat_number: str = Field(description="Seat Row and Position, e.g. 32A")
    departure_time: str = Field(description="Time in HH:MM format, e.g. 16:00")
    arrival_time: str = Field(description="Time in HH:MM format, e.g. 20:00")
    price: Optional[str] = Field(description="Total air fare")
    booking_id: Optional[str] = Field(
        description="Booking Reference ID, e.g LMN-012-STU"
    )


class HotelEvent(BaseModel):
    """A Hotel Booking in the itinerary."""
    event_type: str = Field(default="hotel")
    description: str = Field(description="A name, title or a description of the hotel")
    address: str = Field(description="Full address of the attraction")
    check_in_time: str = Field(description="Time in HH:MM format, e.g. 16:00")
    check_out_time: str = Field(description="Time in HH:MM format, e.g. 15:30")
    room_selection: str = Field()
    booking_required: bool = Field(default=True)
    price: Optional[str] = Field(description="Total hotel price including all nights")
    booking_id: Optional[str] = Field(
        description="Booking Reference ID, e.g ABCD12345678"
    )


class ItineraryDay(BaseModel):
    """A single day of events in the itinerary."""
    day_number: int = Field(
        description="Identify which day of the trip this represents, e.g. 1, 2, 3... etc."
    )
    date: str = Field(description="The Date this day YYYY-MM-DD format")
    events: list[Union[FlightEvent, HotelEvent, AttractionEvent]] = Field(
        default=[], description="The list of events for the day"
    )


class Itinerary(BaseModel):
    """A multi-day itinerary."""
    trip_name: str = Field(
        description="Simple one liner to describe the trip. e.g. 'San Diego to Seattle Getaway'"
    )
    start_date: str = Field(description="Trip Start Date in YYYY-MM-DD format")
    end_date: str = Field(description="Trip End Date in YYYY-MM-DD format")
    origin: str = Field(description="Trip Origin, e.g. San Diego")
    destination: str = (Field(description="Trip Destination, e.g. Seattle"),)
    days: list[ItineraryDay] = Field(
        default_factory=list, description="The multi-days itinerary"
    )


# class UserProfile(BaseModel):
#     """An example user profile."""
#     allergies: list[str] = Field(
#         default=[], description="A list of food allergies to avoid"
#     )
#     diet_preference: list[str] = Field(
#         default=[], description="Vegetarian, Vegan... etc."
#     )
#     passport_nationality: str = Field(
#         description="Nationality of traveler, e.g. US Citizen"
#     )
#     home_address: str = Field(description="Home address of traveler")
#     home_transit_preference: str = Field(
#         description="Preferred mode of transport around home, e.g. drive"
#     )


class GroupMember(BaseModel):
    """Individual group member details."""
    relation: str = Field(description="Relationship to primary traveler (self/spouse/child/parent/friend)")
    age_group: Literal["child", "teen", "adult", "senior"] = Field(description="Age category for activity planning")
    special_notes: Optional[str] = Field(default="", description="Any special considerations for this member")

class ContactInfo(BaseModel):
    """Contact information structure."""
    email: Optional[str] = Field(default="", description="Primary email address")
    phone: Optional[str] = Field(default="", description="Primary phone number")
    emergency_contact: Optional[str] = Field(default="", description="Emergency contact information")

class HomeLocation(BaseModel):
    """Home location details."""
    address: str = Field(description="Full address for travel origin")
    city: str = Field(description="Home city")
    country: str = Field(description="Home country")
    local_prefer_mode: str = Field(description="Preferred local transportation")

class TravelStyle(BaseModel):
    """Travel style preferences."""
    pace: Literal["relaxed", "moderate", "adventure"] = Field(description="Preferred travel pace")
    experience_type: Literal["popular_attractions", "off_beaten_path", "mixed"] = Field(description="Type of experiences preferred")
    planning_style: Literal["structured", "flexible", "mixed"] = Field(description="Planning approach preference")

class AccommodationPreferences(BaseModel):
    """Accommodation preferences structure."""
    type: list[str] = Field(default=[], description="Preferred accommodation types")
    location_preference: str = Field(default="", description="Preferred location type")
    essential_amenities: list[str] = Field(default=[], description="Must-have amenities")
    preferred_amenities: list[str] = Field(default=[], description="Nice-to-have amenities")

class TransportationPreferences(BaseModel):
    """Transportation preferences structure."""
    seat_preference: Literal["window", "aisle", "middle"] = Field(description="Flight seat preference")
    flight_times: list[str] = Field(default=[], description="Preferred flight time ranges")
    local_transport: list[str] = Field(default=[], description="Preferred local transportation modes")

class ActivityInterests(BaseModel):
    """Activity and interest preferences."""
    preferred_activities: list[str] = Field(default=[], description="Preferred activity types")
    bucket_list_experiences: list[str] = Field(default=[], description="Must-do experiences")
    activities_to_avoid: list[str] = Field(default=[], description="Activities to avoid")

class CulinaryPreferences(BaseModel):
    """Culinary preferences and restrictions."""
    adventure_level: Literal["conservative", "moderate", "adventurous"] = Field(description="Food adventure level")
    dining_style: list[str] = Field(default=[], description="Preferred dining styles")
    preferred_cuisines: list[str] = Field(default=[], description="Favorite cuisine types")

class BehavioralPreferences(BaseModel):
    """Behavioral and social preferences."""
    social_preference: Literal["private", "small_group", "social", "mixed"] = Field(description="Social interaction preference")
    energy_level: Literal["early_riser", "night_owl", "flexible"] = Field(description="Daily energy pattern")
    environment_preference: Literal["quiet", "moderate", "energetic"] = Field(description="Preferred environment energy")

class UserPreferences(BaseModel):
    """Comprehensive user preferences structure."""
    travel_style: TravelStyle
    accommodation_preferences: AccommodationPreferences
    transportation_preferences: TransportationPreferences
    activity_interests: ActivityInterests
    culinary_preferences: CulinaryPreferences
    behavioral_preferences: BehavioralPreferences
    likes: list[str] = Field(default=[], description="General likes and interests")
    dislikes: list[str] = Field(default=[], description="General dislikes and aversions")
    must_have_experiences: list[str] = Field(default=[], description="Non-negotiable experiences")
    deal_breakers: list[str] = Field(default=[], description="Absolute deal breakers")

class TravelHistory(BaseModel):
    """Travel history and experience structure."""
    international_experience: bool = Field(description="Has international travel experience")
    visited_regions: list[str] = Field(default=[], description="Previously visited regions")
    visited_countries: list[str] = Field(default=[], description="Previously visited countries")
    longest_trip_duration: str = Field(default="", description="Duration of longest trip")
    most_recent_trip: dict = Field(default={}, description="Details of most recent significant trip")

class TravelExpertise(BaseModel):
    """Travel expertise and comfort levels."""
    booking_comfort: Literal["low", "medium", "high"] = Field(description="Comfort with booking travel")
    logistics_comfort: Literal["low", "medium", "high"] = Field(description="Comfort with travel logistics")
    technology_comfort: Literal["low", "medium", "high"] = Field(description="Comfort with travel technology")
    planning_style: Literal["detailed", "moderate", "spontaneous"] = Field(description="Preferred planning approach")

class ComfortLevels(BaseModel):
    """Comfort levels for various travel aspects."""
    airport_navigation: Literal["low", "medium", "high"] = Field(description="Airport navigation comfort")
    flight_connections: Literal["avoid", "acceptable", "comfortable"] = Field(description="Flight connection comfort")
    language_barriers: Literal["concerning", "manageable", "comfortable"] = Field(description="Language barrier comfort")
    public_transportation: Literal["avoid", "limited", "comfortable"] = Field(description="Public transport comfort")
    unknown_destinations: Literal["concerning", "exciting", "preferred"] = Field(description="Unknown destination comfort")

class SupportNeeds(BaseModel):
    """Support and assistance needs."""
    booking_assistance: Literal["high", "medium", "low"] = Field(description="Need for booking assistance")
    detailed_instructions: Literal["essential", "helpful", "unnecessary"] = Field(description="Need for detailed instructions")
    backup_planning: Literal["essential", "preferred", "optional"] = Field(description="Need for backup plans")
    local_support: Literal["essential", "helpful", "unnecessary"] = Field(description="Need for local support")

class UserExperience(BaseModel):
    """User travel experience structure."""
    travel_frequency: Literal["never", "rarely", "annually", "multiple_yearly", "frequently"] = Field(description="Travel frequency")
    travel_history: TravelHistory
    travel_expertise: TravelExpertise
    comfort_levels: ComfortLevels
    support_needs: SupportNeeds
    experience_insights: dict = Field(default={}, description="Insights from past travel experiences")

class BudgetBreakdown(BaseModel):
    """Budget breakdown for categories."""
    allocated: float = Field(description="Amount allocated to this category")
    spent: float = Field(default=0.0, description="Amount spent in this category")
    priority: Literal["high", "medium", "low"] = Field(description="Priority level for this category")

class BudgetDetails(BaseModel):
    """Detailed budget information."""
    total_budget: float = Field(description="Total trip budget")
    currency: str = Field(default="USD", description="Budget currency")
    budget_per_person: bool = Field(description="Whether budget is per person or total")
    includes_flights: bool = Field(description="Whether budget includes flights")
    remaining_budget: float = Field(description="Remaining available budget")
    spent_to_date: float = Field(default=0.0, description="Total spent so far")
    last_updated: Optional[datetime] = Field(default=None, description="Last budget update timestamp")

class BudgetPreferences(BaseModel):
    """Budget preferences and flexibility."""
    flexibility: Literal["strict", "moderate", "flexible"] = Field(description="Budget flexibility level")
    overage_comfort: float = Field(description="Comfortable overage percentage")
    splurge_categories: list[str] = Field(default=[], description="Categories willing to spend extra on")
    savings_categories: list[str] = Field(default=[], description="Categories to minimize spending on")
    price_sensitivity: Literal["low", "medium", "high"] = Field(description="Overall price sensitivity")

class TrackingSettings(BaseModel):
    """Budget tracking configuration."""
    alert_thresholds: list[int] = Field(default=[50, 75, 90], description="Budget alert thresholds")
    include_tips: bool = Field(default=True, description="Include tips in tracking")
    include_taxes: bool = Field(default=True, description="Include taxes in tracking")
    buffer_percentage: float = Field(default=10.0, description="Budget buffer percentage")

class UserBudget(BaseModel):
    """Comprehensive budget structure."""
    budget_details: BudgetDetails
    budget_breakdown: dict[str, BudgetBreakdown] = Field(default={}, description="Budget breakdown by category")
    budget_preferences: BudgetPreferences
    tracking_settings: TrackingSettings

class MedicalRequirement(BaseModel):
    """Medical requirement structure."""
    condition: str = Field(description="Medical condition description")
    severity: Literal["mild", "moderate", "severe"] = Field(description="Severity level")
    medications: list[str] = Field(default=[], description="Required medications")
    equipment_needed: list[str] = Field(default=[], description="Required medical equipment")
    special_accommodations: list[str] = Field(default=[], description="Needed accommodations")
    emergency_procedures: list[str] = Field(default=[], description="Emergency procedures")

class DietaryRestriction(BaseModel):
    """Dietary restriction structure."""
    type: Literal["allergy", "intolerance", "religious", "cultural", "personal"] = Field(description="Restriction type")
    restriction: str = Field(description="Specific dietary restriction")
    severity: Literal["mild", "moderate", "severe", "life-threatening"] = Field(description="Severity level")
    alternatives: list[str] = Field(default=[], description="Acceptable alternatives")
    special_handling: list[str] = Field(default=[], description="Special handling requirements")

class AccessibilityNeeds(BaseModel):
    """Accessibility requirements structure."""
    mobility: list[str] = Field(default=[], description="Mobility-related needs")
    vision: list[str] = Field(default=[], description="Vision-related needs")
    hearing: list[str] = Field(default=[], description="Hearing-related needs")
    cognitive: list[str] = Field(default=[], description="Cognitive-related needs")
    equipment: list[str] = Field(default=[], description="Required accessibility equipment")
    accommodation_requirements: list[str] = Field(default=[], description="Accommodation requirements")

class CulturalReligious(BaseModel):
    """Cultural and religious considerations."""
    religious_observances: list[str] = Field(default=[], description="Religious observances to consider")
    cultural_requirements: list[str] = Field(default=[], description="Cultural requirements")
    dress_codes: list[str] = Field(default=[], description="Dress code considerations")
    facility_needs: list[str] = Field(default=[], description="Required religious/cultural facilities")
    restrictions: list[str] = Field(default=[], description="Cultural/religious restrictions")

class EmergencyInformation(BaseModel):
    """Emergency contact and procedure information."""
    primary_contact: dict = Field(default={}, description="Primary emergency contact")
    medical_contacts: dict = Field(default={}, description="Medical emergency contacts")
    insurance_information: dict = Field(default={}, description="Travel insurance details")
    special_procedures: list[str] = Field(default=[], description="Special emergency procedures")

class UserSpecialConsiderations(BaseModel):
    """Comprehensive special considerations structure."""
    medical_requirements: list[MedicalRequirement] = Field(default=[], description="Medical requirements")
    dietary_restrictions: list[DietaryRestriction] = Field(default=[], description="Dietary restrictions")
    accessibility_needs: AccessibilityNeeds = Field(default_factory=AccessibilityNeeds, description="Accessibility needs")
    cultural_religious: CulturalReligious = Field(default_factory=CulturalReligious, description="Cultural/religious considerations")
    travel_restrictions: dict = Field(default={}, description="Travel document and legal restrictions")
    safety_security: dict = Field(default={}, description="Safety and security requirements")
    special_equipment: dict = Field(default={}, description="Special equipment needs")
    psychological_considerations: dict = Field(default={}, description="Psychological considerations")
    emergency_information: EmergencyInformation = Field(default_factory=EmergencyInformation, description="Emergency information")

# class EnhancedUserProfile(BaseModel):
class UserProfile(BaseModel):
    """An example user profile."""
    # Basic Information
    language: str = Field(description="Preferred conversation language")
    group_size: int = Field(description="Number of travelers in group")
    group_details: list[GroupMember] = Field(default=[], description="Details of each group member")
    passport_nationality: str = Field(description="Nationality of traveler")
    home: HomeLocation = Field(description="Home location details")
    contact_info: ContactInfo = Field(default_factory=ContactInfo, description="Contact information")
    
    # Detailed Preferences
    preferences: UserPreferences = Field(description="Comprehensive travel preferences")
    
    # Experience and Expertise
    experience: UserExperience = Field(description="Travel experience and expertise")
    
    # Budget Information
    budget: UserBudget = Field(description="Comprehensive budget information")
    
    # Special Considerations
    special_considerations: UserSpecialConsiderations = Field(
        default_factory=UserSpecialConsiderations, 
        description="Special requirements and considerations"
    )
    
    # Profile Metadata
    profile_created: Optional[datetime] = Field(default=None, description="Profile creation timestamp")
    last_updated: Optional[datetime] = Field(default=None, description="Last profile update")
    profile_completeness: dict = Field(default={}, description="Profile completion status")
    
    # Legacy fields for backward compatibility
    allergies: list[str] = Field(default=[], description="Food allergies (legacy field)")
    diet_preference: list[str] = Field(default=[], description="Diet preferences (legacy field)")
    home_address: str = Field(default="", description="Home address (legacy field)")
    home_transit_preference: str = Field(default="", description="Home transit preference (legacy field)")

class PackingList(BaseModel):
    """A list of things to pack for the trip."""
    items: list[str]

class TransportModeSelection(BaseModel):
    """Transport mode(s) chosen for the user’s query."""

    selected_modes: list[str] = Field(
        description="Chosen transport mode(s) from: ['Flight', 'Train', 'Bus', 'Cab']"
    )

    reasoning: str = Field(
        description="Explanation of why this mode/modes was selected, e.g., faster for long distance, cheaper option available, direct connectivity, etc."
    )

    ranking_factors: dict = Field(
        description="""Factors considered while ranking the transport modes, e.g.:
        {
          "cost": "Low",
          "time": "Medium",
          "comfort": "High",
          "availability": "Good"
          "real_time_conditions": "Reasoning based on real-time conditions"
        }"""
    )

    recommended_mode: str = Field(
        description="Single best recommended mode from ['Flight', 'Train', 'Bus', 'Cab']"
    )

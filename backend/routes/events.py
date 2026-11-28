"""
Calendar Events REST API routes (/api/events).
Handles listing, creating, updating, and deleting scheduled events.
"""

from flask import Blueprint, jsonify
from data.store import events_store
from routes.validation import (
    error_response,
    find_item_by_id,
    get_next_id,
    is_valid_date_string,
    is_valid_time_string,
    parse_json_body,
)

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

VALID_CATEGORIES = {"Personal", "Work", "Education", "Meeting", "Other"}
VALID_PRIORITIES = {"High", "Medium", "Low"}


@events_bp.route("", methods=["GET"])
def get_events():
    """Return all calendar events currently stored in memory."""
    return jsonify({"events": events_store, "count": len(events_store)}), 200


@events_bp.route("", methods=["POST"])
def create_event():
    """Create a new calendar event from JSON request body."""
    data, err = parse_json_body()
    if err:
        return err

    title = str(data.get("title", "")).strip()
    if not title:
        return error_response(
            "Event 'title' is required and cannot be empty.", 400
        )

    event_date = data.get("date", "")
    if not is_valid_date_string(event_date):
        return error_response("A valid 'date' (YYYY-MM-DD) is required.", 400)

    start_time = data.get("startTime", "")
    end_time = data.get("endTime", "")
    if start_time and not is_valid_time_string(start_time):
        return error_response("startTime must be in HH:MM format.", 400)
    if end_time and not is_valid_time_string(end_time):
        return error_response("endTime must be in HH:MM format.", 400)
    if start_time and end_time and end_time < start_time:
        return error_response(
            "endTime cannot be earlier than startTime.", 400
        )

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Personal, Work, Education, Meeting, Other.",
            400,
        )

    priority = data.get("priority", "Medium")
    if priority not in VALID_PRIORITIES:
        return error_response(
            "Priority must be one of: High, Medium, Low.", 400
        )

    new_event = {
        "id": get_next_id(events_store),
        "title": title,
        "description": str(data.get("description", "")).strip(),
        "date": event_date,
        "startTime": start_time,
        "endTime": end_time,
        "category": category,
        "priority": priority,
    }
    events_store.append(new_event)

    return (
        jsonify({"message": "Event created successfully.", "event": new_event}),
        201,
    )


@events_bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an existing calendar event by ID."""
    event_item = find_item_by_id(events_store, event_id)
    if not event_item:
        return error_response(f"Event with id {event_id} was not found.", 404)

    data, err = parse_json_body()
    if err:
        return err

    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return error_response("Event 'title' cannot be empty.", 400)
        event_item["title"] = title

    if "description" in data:
        event_item["description"] = str(data["description"]).strip()

    if "date" in data:
        if not is_valid_date_string(data["date"]):
            return error_response(
                "date must be a valid YYYY-MM-DD date.", 400
            )
        event_item["date"] = data["date"]

    next_start = data.get("startTime", event_item["startTime"])
    next_end = data.get("endTime", event_item["endTime"])
    if next_start and not is_valid_time_string(next_start):
        return error_response("startTime must be in HH:MM format.", 400)
    if next_end and not is_valid_time_string(next_end):
        return error_response("endTime must be in HH:MM format.", 400)
    if next_start and next_end and next_end < next_start:
        return error_response(
            "endTime cannot be earlier than startTime.", 400
        )
    event_item["startTime"] = next_start
    event_item["endTime"] = next_end

    if "category" in data:
        if data["category"] not in VALID_CATEGORIES:
            return error_response(
                "Category must be one of: Personal, Work, Education, Meeting, Other.",
                400,
            )
        event_item["category"] = data["category"]

    if "priority" in data:
        if data["priority"] not in VALID_PRIORITIES:
            return error_response(
                "Priority must be one of: High, Medium, Low.", 400
            )
        event_item["priority"] = data["priority"]

    return (
        jsonify({"message": "Event updated successfully.", "event": event_item}),
        200,
    )


@events_bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete a calendar event by ID."""
    event_item = find_item_by_id(events_store, event_id)
    if not event_item:
        return error_response(f"Event with id {event_id} was not found.", 404)

    events_store.remove(event_item)
    return (
        jsonify({"message": "Event deleted successfully.", "deletedId": event_id}),
        200,
    )

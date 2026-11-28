"""
Calendar Events REST API routes (/api/events) backed by SQLite.
All queries use parameterized SQL (?) to prevent SQL injection.
"""

from flask import Blueprint, jsonify
from database import get_utc_timestamp
from routes.validation import (
    error_response,
    is_valid_date_string,
    is_valid_time_string,
    open_db,
    parse_json_body,
)

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

VALID_CATEGORIES = {"Personal", "Work", "Education", "Meeting", "Other"}
VALID_PRIORITIES = {"High", "Medium", "Low"}


def row_to_event(row):
    """Converts a SQLite event row into the JSON shape expected by the API."""
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "date": row["date"],
        "startTime": row["start_time"],
        "endTime": row["end_time"],
        "category": row["category"],
        "priority": row["priority"],
        "createdAt": row["created_at"],
    }


@events_bp.route("", methods=["GET"])
def get_events():
    """Fetch all calendar events from the SQLite events table."""
    conn = open_db()
    try:
        rows = conn.execute(
            "SELECT * FROM events ORDER BY date ASC, start_time ASC, id DESC"
        ).fetchall()
        events = [row_to_event(row) for row in rows]
        return jsonify({"events": events, "count": len(events)}), 200
    finally:
        conn.close()


@events_bp.route("", methods=["POST"])
def create_event():
    """Insert a new calendar event into SQLite."""
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

    start_time = data.get("startTime", data.get("start_time", ""))
    end_time = data.get("endTime", data.get("end_time", ""))
    if start_time and not is_valid_time_string(start_time):
        return error_response("startTime must be in HH:MM format.", 400)
    if end_time and not is_valid_time_string(end_time):
        return error_response("endTime must be in HH:MM format.", 400)
    if start_time and end_time and end_time < start_time:
        return error_response("endTime cannot be earlier than startTime.", 400)

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Personal, Work, Education, Meeting, Other.",
            400,
        )

    priority = data.get("priority", "Medium")
    if priority not in VALID_PRIORITIES:
        return error_response("Priority must be one of: High, Medium, Low.", 400)

    description = str(data.get("description", "")).strip()
    created_at = get_utc_timestamp()

    conn = open_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO events (title, description, date, start_time, end_time, category, priority, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                title,
                description,
                event_date,
                start_time,
                end_time,
                category,
                priority,
                created_at,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM events WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Event created successfully.",
                    "event": row_to_event(row),
                }
            ),
            201,
        )
    finally:
        conn.close()


@events_bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an existing calendar event in SQLite by ID."""
    data, err = parse_json_body()
    if err:
        return err

    conn = open_db()
    try:
        existing = conn.execute(
            "SELECT * FROM events WHERE id = ?", (event_id,)
        ).fetchone()
        if not existing:
            return error_response(f"Event with id {event_id} was not found.", 404)

        title = existing["title"]
        if "title" in data:
            title = str(data["title"]).strip()
            if not title:
                return error_response("Event 'title' cannot be empty.", 400)

        description = (
            str(data["description"]).strip()
            if "description" in data
            else existing["description"]
        )

        event_date = existing["date"]
        if "date" in data:
            if not is_valid_date_string(data["date"]):
                return error_response(
                    "date must be a valid YYYY-MM-DD date.", 400
                )
            event_date = data["date"]

        next_start = data.get(
            "startTime", data.get("start_time", existing["start_time"])
        )
        next_end = data.get("endTime", data.get("end_time", existing["end_time"]))
        if next_start and not is_valid_time_string(next_start):
            return error_response("startTime must be in HH:MM format.", 400)
        if next_end and not is_valid_time_string(next_end):
            return error_response("endTime must be in HH:MM format.", 400)
        if next_start and next_end and next_end < next_start:
            return error_response(
                "endTime cannot be earlier than startTime.", 400
            )

        category = existing["category"]
        if "category" in data:
            if data["category"] not in VALID_CATEGORIES:
                return error_response(
                    "Category must be one of: Personal, Work, Education, Meeting, Other.",
                    400,
                )
            category = data["category"]

        priority = existing["priority"]
        if "priority" in data:
            if data["priority"] not in VALID_PRIORITIES:
                return error_response(
                    "Priority must be one of: High, Medium, Low.", 400
                )
            priority = data["priority"]

        conn.execute(
            """
            UPDATE events
            SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, category = ?, priority = ?
            WHERE id = ?
            """,
            (
                title,
                description,
                event_date,
                next_start,
                next_end,
                category,
                priority,
                event_id,
            ),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM events WHERE id = ?", (event_id,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Event updated successfully.",
                    "event": row_to_event(updated),
                }
            ),
            200,
        )
    finally:
        conn.close()


@events_bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete a calendar event from SQLite by ID."""
    conn = open_db()
    try:
        cursor = conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return error_response(f"Event with id {event_id} was not found.", 404)

        return (
            jsonify(
                {
                    "message": "Event deleted successfully.",
                    "deletedId": event_id,
                }
            ),
            200,
        )
    finally:
        conn.close()

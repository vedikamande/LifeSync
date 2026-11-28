"""
Habit Tracker REST API routes (/api/habits).
Handles creating, listing, updating, checking in, and deleting habits.
"""

from flask import Blueprint, jsonify
from data.store import habits_store
from routes.validation import (
    error_response,
    find_item_by_id,
    get_next_id,
    is_valid_date_string,
    parse_json_body,
)

habits_bp = Blueprint("habits", __name__, url_prefix="/api/habits")

VALID_CATEGORIES = {
    "Health",
    "Learning",
    "Mindfulness",
    "Productivity",
    "Personal",
}


@habits_bp.route("", methods=["GET"])
def get_habits():
    """Return all habits currently stored in memory."""
    return jsonify({"habits": habits_store, "count": len(habits_store)}), 200


@habits_bp.route("", methods=["POST"])
def create_habit():
    """Create a new habit from JSON request body."""
    data, err = parse_json_body()
    if err:
        return err

    name = str(data.get("name", "")).strip()
    if not name:
        return error_response("Habit 'name' is required and cannot be empty.", 400)

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Health, Learning, Mindfulness, Productivity, Personal.",
            400,
        )

    completed_dates = data.get("completedDates", [])
    if not isinstance(completed_dates, list) or not all(
        is_valid_date_string(d) for d in completed_dates
    ):
        return error_response(
            "completedDates must be a list of valid YYYY-MM-DD dates.", 400
        )

    streak_days = data.get("streakDays", 0)
    if not isinstance(streak_days, int) or isinstance(streak_days, bool) or streak_days < 0:
        return error_response("streakDays must be a non-negative integer.", 400)

    completed = data.get("completed", False)
    if not isinstance(completed, bool):
        return error_response("completed must be a boolean (true/false).", 400)

    new_habit = {
        "id": get_next_id(habits_store),
        "name": name,
        "description": str(data.get("description", "")).strip(),
        "category": category,
        "completedDates": sorted(set(completed_dates)),
        "streakDays": streak_days,
        "completed": completed,
    }
    habits_store.append(new_habit)

    return (
        jsonify({"message": "Habit created successfully.", "habit": new_habit}),
        201,
    )


@habits_bp.route("/<int:habit_id>", methods=["PUT"])
def update_habit(habit_id):
    """Update an existing habit's details or check-in dates by ID."""
    habit = find_item_by_id(habits_store, habit_id)
    if not habit:
        return error_response(f"Habit with id {habit_id} was not found.", 404)

    data, err = parse_json_body()
    if err:
        return err

    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return error_response("Habit 'name' cannot be empty.", 400)
        habit["name"] = name

    if "description" in data:
        habit["description"] = str(data["description"]).strip()

    if "category" in data:
        if data["category"] not in VALID_CATEGORIES:
            return error_response(
                "Category must be one of: Health, Learning, Mindfulness, Productivity, Personal.",
                400,
            )
        habit["category"] = data["category"]

    if "completedDates" in data:
        completed_dates = data["completedDates"]
        if not isinstance(completed_dates, list) or not all(
            is_valid_date_string(d) for d in completed_dates
        ):
            return error_response(
                "completedDates must be a list of valid YYYY-MM-DD dates.", 400
            )
        habit["completedDates"] = sorted(set(completed_dates))

    if "streakDays" in data:
        streak_days = data["streakDays"]
        if (
            not isinstance(streak_days, int)
            or isinstance(streak_days, bool)
            or streak_days < 0
        ):
            return error_response(
                "streakDays must be a non-negative integer.", 400
            )
        habit["streakDays"] = streak_days

    if "completed" in data:
        if not isinstance(data["completed"], bool):
            return error_response(
                "completed must be a boolean (true/false).", 400
            )
        habit["completed"] = data["completed"]

    return (
        jsonify({"message": "Habit updated successfully.", "habit": habit}),
        200,
    )


@habits_bp.route("/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    """Delete a habit by its ID."""
    habit = find_item_by_id(habits_store, habit_id)
    if not habit:
        return error_response(f"Habit with id {habit_id} was not found.", 404)

    habits_store.remove(habit)
    return (
        jsonify({"message": "Habit deleted successfully.", "deletedId": habit_id}),
        200,
    )

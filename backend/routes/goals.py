"""
Goal Management REST API routes (/api/goals).
Supports creating, listing, updating progress/status, and deleting goals.
"""

from datetime import date
from flask import Blueprint, jsonify
from data.store import goals_store
from routes.validation import (
    error_response,
    find_item_by_id,
    get_next_id,
    is_valid_date_string,
    parse_json_body,
)

goals_bp = Blueprint("goals", __name__, url_prefix="/api/goals")

VALID_CATEGORIES = {
    "Personal",
    "Education",
    "Career",
    "Health",
    "Fitness",
    "Finance",
    "Other",
}


def compute_goal_status(progress, target_date=""):
    """Derives goal status automatically from progress percentage and target date."""
    if progress == 100:
        return "Completed"
    if target_date and target_date < date.today().isoformat():
        return "Overdue"
    if progress == 0:
        return "Not Started"
    return "In Progress"


@goals_bp.route("", methods=["GET"])
def get_goals():
    """Return all goals currently stored in memory."""
    return jsonify({"goals": goals_store, "count": len(goals_store)}), 200


@goals_bp.route("", methods=["POST"])
def create_goal():
    """Create a new goal (defaulting progress to 0%)."""
    data, err = parse_json_body()
    if err:
        return err

    title = str(data.get("title", "")).strip()
    if not title:
        return error_response("Goal 'title' is required and cannot be empty.", 400)

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Personal, Education, Career, Health, Fitness, Finance, Other.",
            400,
        )

    start_date = data.get("startDate", "")
    target_date = data.get("targetDate", "")
    if start_date and not is_valid_date_string(start_date):
        return error_response("startDate must be a valid YYYY-MM-DD date.", 400)
    if target_date and not is_valid_date_string(target_date):
        return error_response("targetDate must be a valid YYYY-MM-DD date.", 400)
    if start_date and target_date and target_date < start_date:
        return error_response(
            "targetDate cannot be earlier than startDate.", 400
        )

    progress = data.get("progress", 0)
    if (
        not isinstance(progress, int)
        or isinstance(progress, bool)
        or not (0 <= progress <= 100)
    ):
        return error_response(
            "progress must be an integer between 0 and 100.", 400
        )

    new_goal = {
        "id": get_next_id(goals_store),
        "title": title,
        "description": str(data.get("description", "")).strip(),
        "category": category,
        "startDate": start_date,
        "targetDate": target_date,
        "progress": progress,
        "status": compute_goal_status(progress, target_date),
    }
    goals_store.append(new_goal)

    return jsonify({"message": "Goal created successfully.", "goal": new_goal}), 201


@goals_bp.route("/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    """Update an existing goal and recalculate its status automatically."""
    goal = find_item_by_id(goals_store, goal_id)
    if not goal:
        return error_response(f"Goal with id {goal_id} was not found.", 404)

    data, err = parse_json_body()
    if err:
        return err

    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return error_response("Goal 'title' cannot be empty.", 400)
        goal["title"] = title

    if "description" in data:
        goal["description"] = str(data["description"]).strip()

    if "category" in data:
        if data["category"] not in VALID_CATEGORIES:
            return error_response(
                "Category must be one of: Personal, Education, Career, Health, Fitness, Finance, Other.",
                400,
            )
        goal["category"] = data["category"]

    next_start = data.get("startDate", goal["startDate"])
    next_target = data.get("targetDate", goal["targetDate"])
    if next_start and not is_valid_date_string(next_start):
        return error_response("startDate must be a valid YYYY-MM-DD date.", 400)
    if next_target and not is_valid_date_string(next_target):
        return error_response("targetDate must be a valid YYYY-MM-DD date.", 400)
    if next_start and next_target and next_target < next_start:
        return error_response(
            "targetDate cannot be earlier than startDate.", 400
        )
    goal["startDate"] = next_start
    goal["targetDate"] = next_target

    if "progress" in data:
        progress = data["progress"]
        if (
            not isinstance(progress, int)
            or isinstance(progress, bool)
            or not (0 <= progress <= 100)
        ):
            return error_response(
                "progress must be an integer between 0 and 100.", 400
            )
        goal["progress"] = progress

    goal["status"] = compute_goal_status(goal["progress"], goal["targetDate"])

    return jsonify({"message": "Goal updated successfully.", "goal": goal}), 200


@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    """Delete a goal by its ID."""
    goal = find_item_by_id(goals_store, goal_id)
    if not goal:
        return error_response(f"Goal with id {goal_id} was not found.", 404)

    goals_store.remove(goal)
    return (
        jsonify({"message": "Goal deleted successfully.", "deletedId": goal_id}),
        200,
    )

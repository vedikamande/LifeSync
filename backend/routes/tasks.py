"""
Task Manager REST API routes (/api/tasks).
Uses Flask Blueprint so task routes stay neatly separated from other modules.
"""

from flask import Blueprint, jsonify
from data.store import tasks_store
from routes.validation import (
    error_response,
    find_item_by_id,
    get_next_id,
    is_valid_date_string,
    parse_json_body,
)

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

VALID_PRIORITIES = {"High", "Medium", "Low"}
VALID_CATEGORIES = {"Study", "Personal", "Work"}


@tasks_bp.route("", methods=["GET"])
def get_tasks():
    """Return all tasks currently stored in memory."""
    return jsonify({"tasks": tasks_store, "count": len(tasks_store)}), 200


@tasks_bp.route("", methods=["POST"])
def create_task():
    """Create a new task from JSON request body."""
    data, err = parse_json_body()
    if err:
        return err

    title = str(data.get("title", "")).strip()
    if not title:
        return error_response("Task 'title' is required and cannot be empty.", 400)

    priority = data.get("priority", "Medium")
    if priority not in VALID_PRIORITIES:
        return error_response(
            "Priority must be one of: High, Medium, Low.", 400
        )

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Study, Personal, Work.", 400
        )

    due_date = data.get("dueDate", "")
    if due_date and not is_valid_date_string(due_date):
        return error_response("dueDate must be a valid YYYY-MM-DD date.", 400)

    completed = data.get("completed", False)
    if not isinstance(completed, bool):
        return error_response("completed must be a boolean (true/false).", 400)

    new_task = {
        "id": get_next_id(tasks_store),
        "title": title,
        "description": str(data.get("description", "")).strip(),
        "priority": priority,
        "dueDate": due_date,
        "category": category,
        "completed": completed,
    }
    tasks_store.append(new_task)

    return jsonify({"message": "Task created successfully.", "task": new_task}), 201


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update an existing task by its ID."""
    task = find_item_by_id(tasks_store, task_id)
    if not task:
        return error_response(f"Task with id {task_id} was not found.", 404)

    data, err = parse_json_body()
    if err:
        return err

    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return error_response("Task 'title' cannot be empty.", 400)
        task["title"] = title

    if "description" in data:
        task["description"] = str(data["description"]).strip()

    if "priority" in data:
        if data["priority"] not in VALID_PRIORITIES:
            return error_response(
                "Priority must be one of: High, Medium, Low.", 400
            )
        task["priority"] = data["priority"]

    if "category" in data:
        if data["category"] not in VALID_CATEGORIES:
            return error_response(
                "Category must be one of: Study, Personal, Work.", 400
            )
        task["category"] = data["category"]

    if "dueDate" in data:
        due_date = data["dueDate"]
        if due_date and not is_valid_date_string(due_date):
            return error_response(
                "dueDate must be a valid YYYY-MM-DD date.", 400
            )
        task["dueDate"] = due_date

    if "completed" in data:
        if not isinstance(data["completed"], bool):
            return error_response(
                "completed must be a boolean (true/false).", 400
            )
        task["completed"] = data["completed"]

    return jsonify({"message": "Task updated successfully.", "task": task}), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task by its ID."""
    task = find_item_by_id(tasks_store, task_id)
    if not task:
        return error_response(f"Task with id {task_id} was not found.", 404)

    tasks_store.remove(task)
    return (
        jsonify({"message": "Task deleted successfully.", "deletedId": task_id}),
        200,
    )

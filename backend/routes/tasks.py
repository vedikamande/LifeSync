"""
Task Manager REST API routes (/api/tasks) backed by SQLite.
All queries use parameterized SQL (?) to prevent SQL injection.
"""

from flask import Blueprint, jsonify
from database import get_utc_timestamp
from routes.validation import (
    error_response,
    is_valid_date_string,
    open_db,
    parse_json_body,
)

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

VALID_PRIORITIES = {"High", "Medium", "Low"}
VALID_CATEGORIES = {"Study", "Personal", "Work"}
VALID_STATUSES = {"Pending", "Completed"}


def row_to_task(row):
    """Converts a SQLite task row into the JSON shape expected by the API."""
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "status": row["status"],
        "completed": row["status"] == "Completed",
        "priority": row["priority"],
        "dueDate": row["due_date"],
        "category": row["category"],
        "createdAt": row["created_at"],
    }


def resolve_task_status(data, current_status="Pending"):
    """Resolves task status from either 'status' or 'completed' in JSON payload."""
    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return None, "Status must be either 'Pending' or 'Completed'."
        return data["status"], None

    if "completed" in data:
        if not isinstance(data["completed"], bool):
            return None, "completed must be a boolean (true/false)."
        return ("Completed" if data["completed"] else "Pending"), None

    return current_status, None


@tasks_bp.route("", methods=["GET"])
def get_tasks():
    """Fetch all tasks from the SQLite tasks table."""
    conn = open_db()
    try:
        rows = conn.execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()
        tasks = [row_to_task(row) for row in rows]
        return jsonify({"tasks": tasks, "count": len(tasks)}), 200
    finally:
        conn.close()


@tasks_bp.route("", methods=["POST"])
def create_task():
    """Insert a new task into SQLite and return the created record."""
    data, err = parse_json_body()
    if err:
        return err

    title = str(data.get("title", "")).strip()
    if not title:
        return error_response("Task 'title' is required and cannot be empty.", 400)

    priority = data.get("priority", "Medium")
    if priority not in VALID_PRIORITIES:
        return error_response("Priority must be one of: High, Medium, Low.", 400)

    category = data.get("category", "Personal")
    if category not in VALID_CATEGORIES:
        return error_response(
            "Category must be one of: Study, Personal, Work.", 400
        )

    due_date = data.get("dueDate", data.get("due_date", ""))
    if due_date and not is_valid_date_string(due_date):
        return error_response("dueDate must be a valid YYYY-MM-DD date.", 400)

    status, status_err = resolve_task_status(data, "Pending")
    if status_err:
        return error_response(status_err, 400)

    description = str(data.get("description", "")).strip()
    created_at = get_utc_timestamp()

    conn = open_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO tasks (title, description, status, priority, due_date, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (title, description, status, priority, due_date, category, created_at),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Task created successfully.",
                    "task": row_to_task(row),
                }
            ),
            201,
        )
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update an existing task in SQLite by ID."""
    data, err = parse_json_body()
    if err:
        return err

    conn = open_db()
    try:
        existing = conn.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        if not existing:
            return error_response(f"Task with id {task_id} was not found.", 404)

        title = existing["title"]
        if "title" in data:
            title = str(data["title"]).strip()
            if not title:
                return error_response("Task 'title' cannot be empty.", 400)

        description = (
            str(data["description"]).strip()
            if "description" in data
            else existing["description"]
        )

        priority = existing["priority"]
        if "priority" in data:
            if data["priority"] not in VALID_PRIORITIES:
                return error_response(
                    "Priority must be one of: High, Medium, Low.", 400
                )
            priority = data["priority"]

        category = existing["category"]
        if "category" in data:
            if data["category"] not in VALID_CATEGORIES:
                return error_response(
                    "Category must be one of: Study, Personal, Work.", 400
                )
            category = data["category"]

        due_date = existing["due_date"]
        if "dueDate" in data or "due_date" in data:
            due_date = data.get("dueDate", data.get("due_date", ""))
            if due_date and not is_valid_date_string(due_date):
                return error_response(
                    "dueDate must be a valid YYYY-MM-DD date.", 400
                )

        status, status_err = resolve_task_status(data, existing["status"])
        if status_err:
            return error_response(status_err, 400)

        conn.execute(
            """
            UPDATE tasks
            SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category = ?
            WHERE id = ?
            """,
            (title, description, status, priority, due_date, category, task_id),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Task updated successfully.",
                    "task": row_to_task(updated),
                }
            ),
            200,
        )
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task from SQLite by ID."""
    conn = open_db()
    try:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return error_response(f"Task with id {task_id} was not found.", 404)

        return (
            jsonify(
                {"message": "Task deleted successfully.", "deletedId": task_id}
            ),
            200,
        )
    finally:
        conn.close()

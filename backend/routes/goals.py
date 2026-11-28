"""
Goal Management REST API routes (/api/goals) backed by SQLite.
All queries use parameterized SQL (?) to prevent SQL injection.
"""

from datetime import date
from flask import Blueprint, jsonify
from database import get_utc_timestamp
from routes.validation import (
    error_response,
    is_valid_date_string,
    open_db,
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


def row_to_goal(row):
    """Converts a SQLite goal row into the JSON shape expected by the API."""
    progress = row["progress"]
    target_date = row["target_date"]
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "startDate": row["start_date"],
        "targetDate": target_date,
        "progress": progress,
        "status": compute_goal_status(progress, target_date),
        "createdAt": row["created_at"],
    }


@goals_bp.route("", methods=["GET"])
def get_goals():
    """Fetch all goals from the SQLite goals table."""
    conn = open_db()
    try:
        rows = conn.execute("SELECT * FROM goals ORDER BY id DESC").fetchall()
        goals = [row_to_goal(row) for row in rows]
        return jsonify({"goals": goals, "count": len(goals)}), 200
    finally:
        conn.close()


@goals_bp.route("", methods=["POST"])
def create_goal():
    """Insert a new goal into SQLite (defaulting progress to 0%)."""
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

    start_date = data.get("startDate", data.get("start_date", ""))
    target_date = data.get("targetDate", data.get("target_date", ""))
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

    status = compute_goal_status(progress, target_date)
    description = str(data.get("description", "")).strip()
    created_at = get_utc_timestamp()

    conn = open_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO goals (title, description, category, start_date, target_date, progress, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                title,
                description,
                category,
                start_date,
                target_date,
                progress,
                status,
                created_at,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM goals WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Goal created successfully.",
                    "goal": row_to_goal(row),
                }
            ),
            201,
        )
    finally:
        conn.close()


@goals_bp.route("/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    """Update an existing goal in SQLite and recalculate its status."""
    data, err = parse_json_body()
    if err:
        return err

    conn = open_db()
    try:
        existing = conn.execute(
            "SELECT * FROM goals WHERE id = ?", (goal_id,)
        ).fetchone()
        if not existing:
            return error_response(f"Goal with id {goal_id} was not found.", 404)

        title = existing["title"]
        if "title" in data:
            title = str(data["title"]).strip()
            if not title:
                return error_response("Goal 'title' cannot be empty.", 400)

        description = (
            str(data["description"]).strip()
            if "description" in data
            else existing["description"]
        )

        category = existing["category"]
        if "category" in data:
            if data["category"] not in VALID_CATEGORIES:
                return error_response(
                    "Category must be one of: Personal, Education, Career, Health, Fitness, Finance, Other.",
                    400,
                )
            category = data["category"]

        next_start = data.get(
            "startDate", data.get("start_date", existing["start_date"])
        )
        next_target = data.get(
            "targetDate", data.get("target_date", existing["target_date"])
        )
        if next_start and not is_valid_date_string(next_start):
            return error_response(
                "startDate must be a valid YYYY-MM-DD date.", 400
            )
        if next_target and not is_valid_date_string(next_target):
            return error_response(
                "targetDate must be a valid YYYY-MM-DD date.", 400
            )
        if next_start and next_target and next_target < next_start:
            return error_response(
                "targetDate cannot be earlier than startDate.", 400
            )

        progress = existing["progress"]
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

        status = compute_goal_status(progress, next_target)

        conn.execute(
            """
            UPDATE goals
            SET title = ?, description = ?, category = ?, start_date = ?, target_date = ?, progress = ?, status = ?
            WHERE id = ?
            """,
            (
                title,
                description,
                category,
                next_start,
                next_target,
                progress,
                status,
                goal_id,
            ),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM goals WHERE id = ?", (goal_id,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Goal updated successfully.",
                    "goal": row_to_goal(updated),
                }
            ),
            200,
        )
    finally:
        conn.close()


@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    """Delete a goal from SQLite by ID."""
    conn = open_db()
    try:
        cursor = conn.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return error_response(f"Goal with id {goal_id} was not found.", 404)

        return (
            jsonify(
                {"message": "Goal deleted successfully.", "deletedId": goal_id}
            ),
            200,
        )
    finally:
        conn.close()

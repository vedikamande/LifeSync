"""
Habit Tracker REST API routes (/api/habits) backed by SQLite (habits + habit_logs tables).
Enforces unique daily check-ins per habit and computes consecutive streaks dynamically.
"""

from datetime import date, timedelta
import sqlite3
from flask import Blueprint, jsonify, request
from database import get_utc_timestamp
from routes.validation import (
    error_response,
    is_valid_date_string,
    open_db,
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


def calculate_consecutive_streak(completed_dates, reference_date=None):
    """
    Calculates consecutive completed days ending on reference_date
    (or yesterday if today is not yet completed).
    """
    today_obj = (
        date.fromisoformat(reference_date) if reference_date else date.today()
    )
    date_set = set(completed_dates)

    cursor_date = today_obj
    if cursor_date.isoformat() not in date_set:
        cursor_date = cursor_date - timedelta(days=1)

    streak = 0
    while cursor_date.isoformat() in date_set:
        streak += 1
        cursor_date = cursor_date - timedelta(days=1)

    return streak


def fetch_completed_dates(conn, habit_id):
    """Fetches sorted YYYY-MM-DD completion dates for a habit from habit_logs."""
    rows = conn.execute(
        """
        SELECT completion_date
        FROM habit_logs
        WHERE habit_id = ? AND completed = 1
        ORDER BY completion_date ASC
        """,
        (habit_id,),
    ).fetchall()
    return [row["completion_date"] for row in rows]


def build_habit_payload(conn, habit_row):
    """Builds the JSON representation of a habit including logs and streak."""
    today_str = date.today().isoformat()
    completed_dates = fetch_completed_dates(conn, habit_row["id"])
    streak_days = calculate_consecutive_streak(completed_dates, today_str)

    return {
        "id": habit_row["id"],
        "name": habit_row["name"],
        "description": habit_row["description"],
        "category": habit_row["category"],
        "completedDates": completed_dates,
        "streakDays": streak_days,
        "completed": today_str in completed_dates,
        "createdAt": habit_row["created_at"],
    }


@habits_bp.route("", methods=["GET"])
def get_habits():
    """Fetch all habits along with their completion logs and streak counts."""
    conn = open_db()
    try:
        rows = conn.execute("SELECT * FROM habits ORDER BY id DESC").fetchall()
        habits = [build_habit_payload(conn, row) for row in rows]
        return jsonify({"habits": habits, "count": len(habits)}), 200
    finally:
        conn.close()


@habits_bp.route("", methods=["POST"])
def create_habit():
    """Insert a new habit (and any initial completedDates) into SQLite."""
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

    description = str(data.get("description", "")).strip()
    created_at = get_utc_timestamp()

    conn = open_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO habits (name, description, category, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (name, description, category, created_at),
        )
        habit_id = cursor.lastrowid

        for date_str in sorted(set(completed_dates)):
            conn.execute(
                """
                INSERT INTO habit_logs (habit_id, completion_date, completed)
                VALUES (?, ?, 1)
                """,
                (habit_id, date_str),
            )

        conn.commit()
        row = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Habit created successfully.",
                    "habit": build_habit_payload(conn, row),
                }
            ),
            201,
        )
    finally:
        conn.close()


@habits_bp.route("/<int:habit_id>", methods=["PUT"])
def update_habit(habit_id):
    """Update an existing habit and optionally sync its completedDates in habit_logs."""
    data, err = parse_json_body()
    if err:
        return err

    conn = open_db()
    try:
        existing = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        if not existing:
            return error_response(f"Habit with id {habit_id} was not found.", 404)

        name = existing["name"]
        if "name" in data:
            name = str(data["name"]).strip()
            if not name:
                return error_response("Habit 'name' cannot be empty.", 400)

        description = (
            str(data["description"]).strip()
            if "description" in data
            else existing["description"]
        )

        category = existing["category"]
        if "category" in data:
            if data["category"] not in VALID_CATEGORIES:
                return error_response(
                    "Category must be one of: Health, Learning, Mindfulness, Productivity, Personal.",
                    400,
                )
            category = data["category"]

        if "completedDates" in data:
            completed_dates = data["completedDates"]
            if not isinstance(completed_dates, list) or not all(
                is_valid_date_string(d) for d in completed_dates
            ):
                return error_response(
                    "completedDates must be a list of valid YYYY-MM-DD dates.",
                    400,
                )

            conn.execute(
                "DELETE FROM habit_logs WHERE habit_id = ?", (habit_id,)
            )
            for date_str in sorted(set(completed_dates)):
                conn.execute(
                    """
                    INSERT INTO habit_logs (habit_id, completion_date, completed)
                    VALUES (?, ?, 1)
                    """,
                    (habit_id, date_str),
                )

        conn.execute(
            """
            UPDATE habits
            SET name = ?, description = ?, category = ?
            WHERE id = ?
            """,
            (name, description, category, habit_id),
        )
        conn.commit()

        updated = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        return (
            jsonify(
                {
                    "message": "Habit updated successfully.",
                    "habit": build_habit_payload(conn, updated),
                }
            ),
            200,
        )
    finally:
        conn.close()


@habits_bp.route("/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    """Delete a habit by ID (cascade deletes related habit_logs rows)."""
    conn = open_db()
    try:
        cursor = conn.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return error_response(f"Habit with id {habit_id} was not found.", 404)

        return (
            jsonify(
                {"message": "Habit deleted successfully.", "deletedId": habit_id}
            ),
            200,
        )
    finally:
        conn.close()


@habits_bp.route("/<int:habit_id>/complete", methods=["POST"])
def mark_habit_completed(habit_id):
    """
    Marks a habit completed for a given date (defaults to today).
    Prevents duplicate check-ins for the same habit on the same date using UNIQUE constraint.
    """
    data = request.get_json(silent=True)
    if data is None:
        data = {}
    elif not isinstance(data, dict):
        return error_response("Request body must be a valid JSON object.", 400)

    target_date = data.get("date", date.today().isoformat())
    if not is_valid_date_string(target_date):
        return error_response("date must be a valid YYYY-MM-DD date.", 400)

    conn = open_db()
    try:
        habit = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        if not habit:
            return error_response(f"Habit with id {habit_id} was not found.", 404)

        try:
            cursor = conn.execute(
                """
                INSERT INTO habit_logs (habit_id, completion_date, completed)
                VALUES (?, ?, 1)
                """,
                (habit_id, target_date),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return error_response(
                f"Habit is already marked completed for {target_date}.", 409
            )

        updated_payload = build_habit_payload(conn, habit)
        return (
            jsonify(
                {
                    "message": f"Habit marked completed for {target_date}.",
                    "log": {
                        "id": cursor.lastrowid,
                        "habitId": habit_id,
                        "completionDate": target_date,
                        "completed": True,
                    },
                    "habit": updated_payload,
                }
            ),
            201,
        )
    finally:
        conn.close()


@habits_bp.route("/<int:habit_id>/history", methods=["GET"])
def get_habit_history(habit_id):
    """Returns all completion log records for a habit ordered newest first."""
    conn = open_db()
    try:
        habit = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        if not habit:
            return error_response(f"Habit with id {habit_id} was not found.", 404)

        rows = conn.execute(
            """
            SELECT id, habit_id, completion_date, completed
            FROM habit_logs
            WHERE habit_id = ?
            ORDER BY completion_date DESC
            """,
            (habit_id,),
        ).fetchall()

        history = [
            {
                "id": row["id"],
                "habitId": row["habit_id"],
                "completionDate": row["completion_date"],
                "completed": bool(row["completed"]),
            }
            for row in rows
        ]
        completed_dates = [
            entry["completionDate"] for entry in history if entry["completed"]
        ]

        return (
            jsonify(
                {
                    "habitId": habit_id,
                    "habitName": habit["name"],
                    "history": history,
                    "totalCompletions": len(completed_dates),
                    "streakDays": calculate_consecutive_streak(completed_dates),
                }
            ),
            200,
        )
    finally:
        conn.close()


@habits_bp.route("/<int:habit_id>/status", methods=["GET"])
def get_habit_daily_status(habit_id):
    """Checks whether a habit is completed on ?date=YYYY-MM-DD (defaults to today)."""
    target_date = request.args.get("date", date.today().isoformat())
    if not is_valid_date_string(target_date):
        return error_response("date query parameter must be YYYY-MM-DD.", 400)

    conn = open_db()
    try:
        habit = conn.execute(
            "SELECT * FROM habits WHERE id = ?", (habit_id,)
        ).fetchone()
        if not habit:
            return error_response(f"Habit with id {habit_id} was not found.", 404)

        log = conn.execute(
            """
            SELECT completed
            FROM habit_logs
            WHERE habit_id = ? AND completion_date = ?
            """,
            (habit_id, target_date),
        ).fetchone()

        completed_dates = fetch_completed_dates(conn, habit_id)

        return (
            jsonify(
                {
                    "habitId": habit_id,
                    "habitName": habit["name"],
                    "date": target_date,
                    "completed": bool(log and log["completed"]),
                    "streakDays": calculate_consecutive_streak(completed_dates),
                }
            ),
            200,
        )
    finally:
        conn.close()

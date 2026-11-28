"""
Shared request parsing, database access, and validation helpers used across Flask route files.
Keeping validation and DB opening in one place avoids repeating code across routes.
"""

from datetime import date, datetime
from flask import current_app, jsonify, request
from database import get_db_connection


def open_db():
    """Opens a SQLite connection using the app's configured DATABASE_PATH."""
    return get_db_connection(current_app.config.get("DATABASE_PATH"))


def parse_json_body():
    """
    Reads the JSON body from an incoming request.
    Returns (data_dict, None) when valid, or (None, error_response) when invalid.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, (
            jsonify({"error": "Request body must be a valid JSON object."}),
            400,
        )
    return data, None


def is_valid_date_string(value):
    """Returns True if value is a valid YYYY-MM-DD calendar date."""
    if not isinstance(value, str) or len(value) != 10:
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def is_valid_time_string(value):
    """Returns True if value is a valid 24-hour HH:MM time string."""
    if not isinstance(value, str) or len(value) != 5:
        return False
    try:
        datetime.strptime(value, "%H:%M")
        return True
    except ValueError:
        return False


def error_response(message, status_code=400):
    """Builds a consistent JSON error response tuple."""
    return jsonify({"error": message}), status_code

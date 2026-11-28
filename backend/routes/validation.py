"""
Shared request parsing and validation helpers used across Flask route files.
Keeping validation in one place avoids repeating code across routes.
"""

from datetime import date, datetime
from flask import jsonify, request


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


def get_next_id(items):
    """Generates the next integer ID based on existing items in a list."""
    return max((item["id"] for item in items), default=0) + 1


def find_item_by_id(items, item_id):
    """Finds and returns the first dictionary whose 'id' matches item_id, or None."""
    for item in items:
        if item["id"] == item_id:
            return item
    return None


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

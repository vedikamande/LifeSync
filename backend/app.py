"""
Main entry point for the LifeSync Python Flask REST API backed by SQLite.
Run this file inside backend/venv to start the server on http://localhost:5000.
"""

from datetime import date
from flask import Flask, jsonify
from flask_cors import CORS

from database import DEFAULT_DB_PATH, get_db_connection, init_db
from routes.events import events_bp
from routes.goals import goals_bp
from routes.habits import habits_bp
from routes.tasks import tasks_bp


def create_app(db_path=None):
    """Creates, configures, and initializes the Flask + SQLite application."""
    app = Flask(__name__)

    target_db = str(db_path) if db_path else str(DEFAULT_DB_PATH)
    app.config["DATABASE_PATH"] = target_db

    # Create all SQLite tables automatically on startup (preserves existing data)
    init_db(target_db)

    # Allow cross-origin requests from the React + Vite frontend
    CORS(app)

    # Register modular Blueprint route files
    app.register_blueprint(tasks_bp)
    app.register_blueprint(habits_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(events_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health-check endpoint confirming both Flask and SQLite are working."""
        conn = get_db_connection(app.config["DATABASE_PATH"])
        try:
            conn.execute("SELECT 1").fetchone()
        finally:
            conn.close()

        return (
            jsonify(
                {
                    "status": "ok",
                    "message": "LifeSync Flask API is running",
                    "storage": "sqlite",
                }
            ),
            200,
        )

    @app.route("/api/dashboard/summary", methods=["GET"])
    def dashboard_summary():
        """Returns real-time aggregate statistics queried directly from SQLite."""
        today_str = date.today().isoformat()
        conn = get_db_connection(app.config["DATABASE_PATH"])
        try:
            total_tasks = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
            completed_tasks = conn.execute(
                "SELECT COUNT(*) FROM tasks WHERE status = 'Completed'"
            ).fetchone()[0]
            pending_tasks = total_tasks - completed_tasks

            total_habits = conn.execute("SELECT COUNT(*) FROM habits").fetchone()[0]
            completed_habits_today = conn.execute(
                """
                SELECT COUNT(DISTINCT habit_id)
                FROM habit_logs
                WHERE completion_date = ? AND completed = 1
                """,
                (today_str,),
            ).fetchone()[0]

            total_goals = conn.execute("SELECT COUNT(*) FROM goals").fetchone()[0]
            completed_goals = conn.execute(
                "SELECT COUNT(*) FROM goals WHERE progress = 100"
            ).fetchone()[0]

            upcoming_events = conn.execute(
                "SELECT COUNT(*) FROM events WHERE date >= ?",
                (today_str,),
            ).fetchone()[0]

            return (
                jsonify(
                    {
                        "totalTasks": total_tasks,
                        "completedTasks": completed_tasks,
                        "pendingTasks": pending_tasks,
                        "totalHabits": total_habits,
                        "completedHabitsToday": completed_habits_today,
                        "totalGoals": total_goals,
                        "completedGoals": completed_goals,
                        "upcomingEvents": upcoming_events,
                    }
                ),
                200,
            )
        finally:
            conn.close()

    @app.errorhandler(400)
    def handle_bad_request(_error):
        return jsonify({"error": "Bad request."}), 400

    @app.errorhandler(404)
    def handle_not_found(_error):
        return jsonify({"error": "Endpoint or resource not found."}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(_error):
        return jsonify({"error": "HTTP method is not allowed on this route."}), 405

    @app.errorhandler(500)
    def handle_server_error(_error):
        return jsonify({"error": "Internal server error."}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

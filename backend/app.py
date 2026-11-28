"""
Main entry point for the LifeSync Python Flask REST API.
Run this file inside backend/venv to start the server on http://localhost:5000.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from routes.events import events_bp
from routes.goals import goals_bp
from routes.habits import habits_bp
from routes.tasks import tasks_bp


def create_app():
    """Creates and configures the Flask application."""
    app = Flask(__name__)

    # Allow cross-origin requests from the React + Vite frontend (localhost:5173)
    CORS(app)

    # Register modular Blueprint route files
    app.register_blueprint(tasks_bp)
    app.register_blueprint(habits_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(events_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health-check endpoint to confirm the Flask server is running."""
        return (
            jsonify(
                {
                    "status": "ok",
                    "message": "LifeSync Flask API is running",
                    "storage": "in-memory",
                }
            ),
            200,
        )

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

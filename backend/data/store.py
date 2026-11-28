"""
Temporary in-memory data lists for Phase 7.
In Phase 8, these lists will be replaced with SQLite database tables.
"""

tasks_store = [
    {
        "id": 1,
        "title": "Review React component props and useState flow",
        "description": "Practice passing callbacks and state between parent and child components.",
        "priority": "High",
        "dueDate": "2026-11-26",
        "category": "Study",
        "completed": True,
    },
    {
        "id": 2,
        "title": "Design Today's Tasks layout for LifeSync",
        "description": "Refine task cards, priority badges, and responsive modal spacing.",
        "priority": "High",
        "dueDate": "2026-11-28",
        "category": "Work",
        "completed": False,
    },
]

habits_store = [
    {
        "id": 1,
        "name": "Reading",
        "description": "Read 20 pages of technical or personal growth books.",
        "category": "Learning",
        "completedDates": ["2026-11-27", "2026-11-28"],
        "streakDays": 2,
        "completed": True,
    },
    {
        "id": 2,
        "name": "Exercise",
        "description": "30 minutes of brisk walking or stretching.",
        "category": "Health",
        "completedDates": ["2026-11-27"],
        "streakDays": 1,
        "completed": False,
    },
]

goals_store = [
    {
        "id": 1,
        "title": "Learn React",
        "description": "Master React functional components, hooks, and reusable UI.",
        "category": "Education",
        "startDate": "2026-10-15",
        "targetDate": "2026-11-30",
        "progress": 65,
        "status": "In Progress",
    },
    {
        "id": 2,
        "title": "Improve Python Skills",
        "description": "Build REST APIs with Python Flask and SQLite.",
        "category": "Career",
        "startDate": "2026-11-01",
        "targetDate": "2026-12-15",
        "progress": 80,
        "status": "In Progress",
    },
]

events_store = [
    {
        "id": 1,
        "title": "Sprint Planning & Weekly Review",
        "description": "Review upcoming LifeSync milestones and tasks.",
        "date": "2026-11-28",
        "startTime": "10:00",
        "endTime": "10:45",
        "category": "Meeting",
        "priority": "High",
    },
    {
        "id": 2,
        "title": "Flask API Practice Session",
        "description": "Test REST endpoints in Postman.",
        "date": "2026-11-29",
        "startTime": "15:00",
        "endTime": "16:00",
        "category": "Education",
        "priority": "Medium",
    },
]

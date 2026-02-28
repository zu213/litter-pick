# Berko Litter Pick

A web application for organizing and tracking litter picking activities. It features a map-based interface for users to view, log, and manage litter pick events, user profiles, and related data.

## Technologies Used

- **Backend:** Python (FastAPI), Pydantic, SQLite, Tortoise, OverpassAPI
- **Frontend:** HTML, CSS, JavaScript, Leaflet, OpenStreetMap

## Setup Instructions

### Backend

1. Ensure you have Python 3.10+ installed.
2. Install dependencies:
   ```bash
   pip install fastapi pydantic uvicorn
   ```
3. Run the API server:
   ```bash
   uvicorn backend.api:app --reload
   ```

### Frontend

1. Open `frontend/public/index.html` in your browser to access the main page.
2. The frontend communicates with the backend API for data operations.

## Folder Structure

- `backend/` - Python API, authentication, database, and helper modules
- `frontend/` - Static HTML, CSS, JS files for the web interface

## Notes

- The backend uses SQLite for data storage.
- The frontend is a static site and does not require a build step.

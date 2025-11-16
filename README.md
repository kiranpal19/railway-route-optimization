# Railway Route Optimization System

A web application that finds optimal railway routes (shortest distance, fastest time, or lowest cost) using graph algorithms (Dijkstra) over a station/connection network.

## Tech Stack
- Backend: Python, Flask, flask-cors
- Frontend: React 19, Vite

## Features
- Stations module: CRUD for station id and name
- Connections module: CRUD (add/delete) directed edges with distance, speed, cost
- Routing: Dijkstra-based optimization by distance, time, or cost
- Frontend Admin UI for seeding data

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```
python -m venv backend/venv
backend/venv/Scripts/activate
python -m pip install -r backend/requirements.txt
python backend/app.py
```
Backend runs at http://127.0.0.1:5000/

### Frontend
```
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite (e.g., http://localhost:5173/). The dev server proxies API calls to the backend.

## Seeding Example
Use the Admin section in the frontend to add:
- Stations: A: Alpha, B: Beta, C: Gamma
- Connections:
  - A→B: distance 50, speed 60, cost 40
  - B→C: distance 70, speed 80, cost 55
  - A→C: distance 140, speed 100, cost 100
Then search for source=A, destination=C with different criteria.

## API (Summary)
- GET /stations → { stations: [{id,name}] }
- POST /stations → { station }
- PUT /stations/:id → { station }
- DELETE /stations/:id → { deleted }
- GET /connections → { connections: [{source_id,dest_id,distance_km,speed_kmh,cost}] }
- POST /connections → { connection }
- DELETE /connections (body {source_id,dest_id}) → { removed }
- POST /route (body {source,destination,criterion}) → { station_names, edges, totals, criterion }

## Notes
- Connections are directed. Add both directions if needed.
- Data is in-memory. Restarting the backend clears data. Replace with a DB for persistence.
- Dev proxy is configured in `frontend/vite.config.js`. For production, set a proper API base or serve both behind one domain.

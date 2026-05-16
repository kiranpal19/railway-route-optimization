# Railway Route Optimization System

A full-stack web app that finds optimal railway routes using Dijkstra's algorithm. Built with Python, Flask, React 19, and Vite."

## Tech Stack
- Backend: Python, Flask, flask-cors
- Frontend: React 19, Vite
  
## Topics 
python  flask  react  dijkstra  graph-algorithms  
full-stack  route-optimization  vite

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

<img width="1890" height="874" alt="Screenshot 2025-11-09 073651" src="https://github.com/user-attachments/assets/5f0b094d-f158-4e3c-bda2-b771caea207d" />

<img width="1650" height="885" alt="Screenshot 2025-11-09 074455" src="https://github.com/user-attachments/assets/571a785a-5b53-4894-bdc0-1b8140b2e90a" />

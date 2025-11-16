from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import Column, String, Float, Integer, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

app = Flask(__name__)
CORS(app)

# --- Database setup (SQLite + SQLAlchemy) ---
Base = declarative_base()

class Station(Base):
    __tablename__ = 'stations'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    outgoing = relationship('Connection', back_populates='source', cascade='all, delete-orphan', foreign_keys='Connection.source_id')
    incoming = relationship('Connection', back_populates='dest', cascade='all, delete-orphan', foreign_keys='Connection.dest_id')

class Connection(Base):
    __tablename__ = 'connections'
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, ForeignKey('stations.id', ondelete='CASCADE'), nullable=False)
    dest_id = Column(String, ForeignKey('stations.id', ondelete='CASCADE'), nullable=False)
    distance_km = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    source = relationship('Station', foreign_keys=[source_id], back_populates='outgoing')
    dest = relationship('Station', foreign_keys=[dest_id], back_populates='incoming')

engine = create_engine('sqlite:///database.db', echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(engine)

# Seed on startup if empty
def _seed_if_empty():
    session = SessionLocal()
    try:
        if session.query(Station).count() == 0:
            demo_stations = [
                {"id": "DEL", "name": "Delhi", "lat": 28.6139, "lon": 77.2090},
                {"id": "BOM", "name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
                {"id": "CCU", "name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
                {"id": "MAA", "name": "Chennai", "lat": 13.0827, "lon": 80.2707},
                {"id": "BLR", "name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
            ]
            for s in demo_stations:
                session.add(Station(id=s["id"], name=s["name"], lat=s.get("lat"), lon=s.get("lon")))
            session.commit()
            demo_edges = [
                {"source_id": "DEL", "dest_id": "BOM", "distance_km": 1415, "speed_kmh": 80, "cost": 1200},
                {"source_id": "BOM", "dest_id": "BLR", "distance_km": 984, "speed_kmh": 90, "cost": 900},
                {"source_id": "BLR", "dest_id": "MAA", "distance_km": 346, "speed_kmh": 100, "cost": 400},
                {"source_id": "DEL", "dest_id": "CCU", "distance_km": 1519, "speed_kmh": 85, "cost": 1300},
                {"source_id": "CCU", "dest_id": "MAA", "distance_km": 1660, "speed_kmh": 80, "cost": 1400},
                {"source_id": "BOM", "dest_id": "DEL", "distance_km": 1415, "speed_kmh": 80, "cost": 1200},
                {"source_id": "MAA", "dest_id": "BLR", "distance_km": 346, "speed_kmh": 100, "cost": 400},
            ]
            for e in demo_edges:
                session.add(Connection(
                    source_id=e["source_id"], dest_id=e["dest_id"],
                    distance_km=float(e.get("distance_km", 0.0)),
                    speed_kmh=float(e.get("speed_kmh", 0.0)),
                    cost=float(e.get("cost", 0.0)),
                ))
            session.commit()
    finally:
        session.close()

_seed_if_empty()

# Helper: build adjacency list from connections (DB)
def build_graph(session):
    graph = {}
    for e in session.query(Connection).all():
        edge = {
            "source_id": e.source_id,
            "dest_id": e.dest_id,
            "distance_km": float(e.distance_km or 0.0),
            "speed_kmh": float(e.speed_kmh or 0.0),
            "cost": float(e.cost or 0.0),
        }
        graph.setdefault(e.source_id, []).append(edge)
    return graph

# Helper: Dijkstra for different weights
def compute_weight(edge, criterion: str):
    if criterion == "distance":
        return float(edge.get("distance_km", 0.0))
    if criterion == "time":
        d = float(edge.get("distance_km", 0.0))
        v = float(edge.get("speed_kmh", 0.0)) or 1e-6
        return d / v
    if criterion == "cost":
        return float(edge.get("cost", 0.0))
    # default to distance
    return float(edge.get("distance_km", 0.0))

def dijkstra(session, source_id: str, dest_id: str, criterion: str):
    import heapq
    graph = build_graph(session)
    dist = {source_id: 0.0}
    prev = {}
    pq = [(0.0, source_id)]

    while pq:
        cur_cost, u = heapq.heappop(pq)
        if u == dest_id:
            break
        if cur_cost > dist.get(u, float("inf")):
            continue
        for edge in graph.get(u, []):
            v = edge["dest_id"]
            w = compute_weight(edge, criterion)
            new_cost = cur_cost + w
            if new_cost < dist.get(v, float("inf")):
                dist[v] = new_cost
                prev[v] = (u, edge)
                heapq.heappush(pq, (new_cost, v))

    if dest_id not in dist:
        return None

    # Reconstruct path of station ids and edges
    path_nodes = []
    path_edges = []
    cur = dest_id
    while cur != source_id:
        path_nodes.append(cur)
        u, edge = prev[cur]
        path_edges.append(edge)
        cur = u
    path_nodes.append(source_id)
    path_nodes.reverse()
    path_edges.reverse()
    return {
        "nodes": path_nodes,
        "edges": path_edges,
        "total_weight": dist[dest_id],
    }

@app.route('/')
def home():
    return jsonify({"message": "Railway Route Optimizing System backend is running!"})

@app.route('/stations', methods=['GET', 'POST'])
def stations_handler():
    session = SessionLocal()
    try:
        if request.method == 'GET':
            rows = session.query(Station).all()
            return jsonify({"stations": [
                {"id": s.id, "name": s.name, "lat": s.lat, "lon": s.lon} for s in rows
            ]})
        data = request.get_json(force=True, silent=True) or {}
        station_id = data.get("id")
        name = data.get("name")
        if not station_id or not name:
            return jsonify({"error": "id and name are required"}), 400
        if session.get(Station, station_id):
            return jsonify({"error": "station id already exists"}), 409
        lat = data.get("lat")
        lon = data.get("lon")
        try:
            lat = float(lat) if lat is not None and lat != "" else None
            lon = float(lon) if lon is not None and lon != "" else None
        except ValueError:
            return jsonify({"error": "lat/lon must be numeric"}), 400
        s = Station(id=station_id, name=name, lat=lat, lon=lon)
        session.add(s)
        session.commit()
        return jsonify({"station": {"id": s.id, "name": s.name, "lat": s.lat, "lon": s.lon}}), 201
    finally:
        session.close()

@app.route('/stations/<station_id>', methods=['PUT', 'DELETE'])
def station_modify(station_id):
    session = SessionLocal()
    try:
        s = session.get(Station, station_id)
        if not s:
            return jsonify({"error": "station not found"}), 404
        if request.method == 'DELETE':
            session.delete(s)
            session.commit()
            return jsonify({"deleted": {"id": station_id}})
        # PUT
        data = request.get_json(force=True, silent=True) or {}
        name = data.get("name")
        if name:
            s.name = name
        if "lat" in data or "lon" in data:
            try:
                lat = data.get("lat")
                lon = data.get("lon")
                s.lat = float(lat) if lat is not None and lat != "" else None
                s.lon = float(lon) if lon is not None and lon != "" else None
            except ValueError:
                return jsonify({"error": "lat/lon must be numeric"}), 400
        session.commit()
        return jsonify({"station": {"id": s.id, "name": s.name, "lat": s.lat, "lon": s.lon}})
    finally:
        session.close()

@app.route('/connections', methods=['GET', 'POST'])
def connections_handler():
    session = SessionLocal()
    try:
        if request.method == 'GET':
            rows = session.query(Connection).all()
            return jsonify({"connections": [
                {
                    "source_id": r.source_id,
                    "dest_id": r.dest_id,
                    "distance_km": float(r.distance_km or 0.0),
                    "speed_kmh": float(r.speed_kmh or 0.0),
                    "cost": float(r.cost or 0.0),
                } for r in rows
            ]})
        data = request.get_json(force=True, silent=True) or {}
        required = ["source_id", "dest_id", "distance_km"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
        src = data["source_id"]
        dst = data["dest_id"]
        if not session.get(Station, src) or not session.get(Station, dst):
            return jsonify({"error": "source_id and dest_id must be valid station ids"}), 400
        # prevent duplicates
        exists = session.query(Connection).filter(Connection.source_id == src, Connection.dest_id == dst).first()
        if exists:
            return jsonify({"error": "connection already exists"}), 409
        r = Connection(
            source_id=src,
            dest_id=dst,
            distance_km=float(data.get("distance_km", 0.0)),
            speed_kmh=float(data.get("speed_kmh", 0.0)),
            cost=float(data.get("cost", 0.0)),
        )
        session.add(r)
        session.commit()
        return jsonify({"connection": {
            "source_id": r.source_id,
            "dest_id": r.dest_id,
            "distance_km": r.distance_km,
            "speed_kmh": r.speed_kmh,
            "cost": r.cost,
        }}), 201
    finally:
        session.close()

@app.route('/connections', methods=['DELETE'])
def connections_delete():
    session = SessionLocal()
    try:
        data = request.get_json(force=True, silent=True) or {}
        src = data.get("source_id")
        dst = data.get("dest_id")
        if not src or not dst:
            return jsonify({"error": "source_id and dest_id are required"}), 400
        q = session.query(Connection).filter(Connection.source_id == src, Connection.dest_id == dst)
        removed = q.count()
        q.delete(synchronize_session=False)
        session.commit()
        return jsonify({"removed": removed})
    finally:
        session.close()

@app.route('/seed', methods=['POST'])
def seed_demo():
    session = SessionLocal()
    # Major Indian cities with approximate coordinates
    demo_stations = [
        {"id": "DEL", "name": "Delhi", "lat": 28.6139, "lon": 77.2090},
        {"id": "BOM", "name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"id": "CCU", "name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
        {"id": "MAA", "name": "Chennai", "lat": 13.0827, "lon": 80.2707},
        {"id": "BLR", "name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    ]
    demo_edges = [
        {"source_id": "DEL", "dest_id": "BOM", "distance_km": 1415, "speed_kmh": 80, "cost": 1200},
        {"source_id": "BOM", "dest_id": "BLR", "distance_km": 984, "speed_kmh": 90, "cost": 900},
        {"source_id": "BLR", "dest_id": "MAA", "distance_km": 346, "speed_kmh": 100, "cost": 400},
        {"source_id": "DEL", "dest_id": "CCU", "distance_km": 1519, "speed_kmh": 85, "cost": 1300},
        {"source_id": "CCU", "dest_id": "MAA", "distance_km": 1660, "speed_kmh": 80, "cost": 1400},
        {"source_id": "BOM", "dest_id": "DEL", "distance_km": 1415, "speed_kmh": 80, "cost": 1200},
        {"source_id": "MAA", "dest_id": "BLR", "distance_km": 346, "speed_kmh": 100, "cost": 400},
    ]
    try:
        # Insert stations (upsert by id)
        for s in demo_stations:
            if not session.get(Station, s["id"]):
                session.add(Station(id=s["id"], name=s["name"], lat=s.get("lat"), lon=s.get("lon")))
        session.commit()
        # Insert edges if missing
        for e in demo_edges:
            exists = session.query(Connection).filter(Connection.source_id == e["source_id"], Connection.dest_id == e["dest_id"]).first()
            if not exists:
                session.add(Connection(
                    source_id=e["source_id"], dest_id=e["dest_id"],
                    distance_km=float(e.get("distance_km", 0.0)),
                    speed_kmh=float(e.get("speed_kmh", 0.0)),
                    cost=float(e.get("cost", 0.0)),
                ))
        session.commit()
        total_conn = session.query(Connection).count()
        return jsonify({"seeded_stations": len(demo_stations), "connections": total_conn})
    finally:
        session.close()

@app.route('/dump', methods=['GET'])
def dump_data():
    session = SessionLocal()
    try:
        sts = [{"id": s.id, "name": s.name, "lat": s.lat, "lon": s.lon} for s in session.query(Station).all()]
        conns = [{
            "source_id": c.source_id, "dest_id": c.dest_id,
            "distance_km": float(c.distance_km or 0.0),
            "speed_kmh": float(c.speed_kmh or 0.0),
            "cost": float(c.cost or 0.0),
        } for c in session.query(Connection).all()]
        return jsonify({"stations": sts, "connections": conns})
    finally:
        session.close()

@app.route('/load', methods=['POST'])
def load_data():
    session = SessionLocal()
    try:
        data = request.get_json(force=True, silent=True) or {}
        new_stations = data.get("stations")
        new_connections = data.get("connections")
        if not isinstance(new_stations, list) or not isinstance(new_connections, list):
            return jsonify({"error": "payload must include lists: stations, connections"}), 400
        # validate
        sdict = {}
        for s in new_stations:
            sid = (s or {}).get("id")
            name = (s or {}).get("name")
            if not sid or not name:
                return jsonify({"error": "each station requires id and name"}), 400
            lat = s.get("lat")
            lon = s.get("lon")
            try:
                lat = float(lat) if lat is not None and lat != "" else None
                lon = float(lon) if lon is not None and lon != "" else None
            except ValueError:
                return jsonify({"error": f"invalid lat/lon for station {sid}"}), 400
            sdict[sid] = {"id": sid, "name": name, "lat": lat, "lon": lon}
        cvalidated = []
        for e in new_connections:
            src = (e or {}).get("source_id")
            dst = (e or {}).get("dest_id")
            if not src or not dst:
                return jsonify({"error": "each connection requires source_id and dest_id"}), 400
            if src not in sdict or dst not in sdict:
                return jsonify({"error": f"connection refers to unknown station(s): {src}->{dst}"}), 400
            cvalidated.append({
                "source_id": src,
                "dest_id": dst,
                "distance_km": float((e or {}).get("distance_km", 0.0)),
                "speed_kmh": float((e or {}).get("speed_kmh", 0.0)),
                "cost": float((e or {}).get("cost", 0.0)),
            })
        # replace DB contents
        session.query(Connection).delete()
        session.query(Station).delete()
        session.commit()
        for v in sdict.values():
            session.add(Station(id=v['id'], name=v['name'], lat=v['lat'], lon=v['lon']))
        session.commit()
        for e in cvalidated:
            session.add(Connection(**e))
        session.commit()
        return jsonify({"ok": True, "stations": len(sdict), "connections": len(cvalidated)})
    finally:
        session.close()

@app.route('/route', methods=['POST'])
def get_route():
    session = SessionLocal()
    try:
        data = request.get_json(force=True, silent=True) or {}
        source = data.get('source')
        destination = data.get('destination')
        criterion = (data.get('criterion') or 'distance').lower()
        if criterion not in {"distance", "time", "cost"}:
            return jsonify({"error": "invalid criterion; use distance|time|cost"}), 400
        if not source or not destination:
            return jsonify({"error": "source and destination are required"}), 400
        if not session.get(Station, source) or not session.get(Station, destination):
            return jsonify({"error": "unknown station id(s)"}), 400

        result = dijkstra(session, source, destination, criterion)
        if not result:
            return jsonify({"error": "no route found"}), 404

        # Compute totals
        total_distance = sum(float(e.get("distance_km", 0.0)) for e in result["edges"])
        total_time_h = sum((float(e.get("distance_km", 0.0)) / (float(e.get("speed_kmh", 0.0)) or 1e-6)) for e in result["edges"]) if result["edges"] else 0.0
        total_cost = sum(float(e.get("cost", 0.0)) for e in result["edges"])
        # Fetch station names from DB with fallback to id
        station_names = []
        for sid in result["nodes"]:
            s = session.get(Station, sid)
            station_names.append(s.name if s else sid)

        return jsonify({
            "source": source,
            "destination": destination,
            "criterion": criterion,
            "station_ids": result["nodes"],
            "station_names": station_names,
            "edges": result["edges"],
            "totals": {
                "distance_km": total_distance,
                "time_hours": total_time_h,
                "cost": total_cost
            }
        })
    finally:
        session.close()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

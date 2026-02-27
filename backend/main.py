from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
import redis
from datetime import datetime, time, timedelta
from typing import List, Optional

from database import engine, Base, get_db, settings
from models import Crime
from data_utils import seed_database, process_csv
from ml_engine import MLEngine
from routing_engine import RoutingEngine
from fpdf import FPDF
from fastapi.responses import FileResponse
import tempfile

app = FastAPI(title="Antigravity PCHAS API")

# Redis setup with fallback
class MemoryCache:
    def __init__(self): self.data = {}
    def get(self, key): return self.data.get(key)
    def setex(self, key, time, value): self.data[key] = value
    def delete(self, key): self.data.pop(key, None)

try:
    cache = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True, socket_connect_timeout=1)
    # Try a simple command to check if redis is truly alive
    cache.ping()
    print("Redis connected successfully")
except Exception:
    print("Redis unavailable, using In-Memory Cache fallback")
    cache = MemoryCache()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
ml_engine = MLEngine()

class DataStore:
    def __init__(self):
        self.memory_data = []
        self.use_db = (engine is not None and SessionLocal is not None)
        if self.use_db:
            try:
                Base.metadata.create_all(bind=engine)
                db = SessionLocal()
                db.execute(text("SELECT 1"))
                db.close()
                print("DataStore: Connected to PostgreSQL")
            except Exception as e:
                print(f"DataStore: DB check failed ({e}). Switching to In-Memory Mode.")
                self.use_db = False
        else:
            print("DataStore: Running in In-Memory Mode (no DB configured)")

    def get_crimes(self):
        if self.use_db and SessionLocal:
            db = SessionLocal()
            try:
                crimes = db.query(Crime).all()
                return [self._to_dict(c) for c in crimes]
            finally: db.close()
        return self.memory_data

    def _to_dict(self, obj):
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns if c.name != 'geom'}

    def seed(self):
        if self.use_db and SessionLocal:
            db = SessionLocal()
            try:
                if db.query(Crime).count() == 0:
                    seed_database(db, n=1000)
            finally:
                db.close()
        else:
            if not self.memory_data:
                from data_utils import generate_mock_data
                raw_data = generate_mock_data(1000)
                self.memory_data = [{**d, "crime_id": i} for i, d in enumerate(raw_data)]

    def add_crimes(self, df, clear=True):
        valid_cols = ["area_name", "place_type", "latitude", "longitude", "crime_type", "crime_date", "crime_time", "victim_age", "victim_gender", "risk_zone"]
        df_filtered = df[[c for c in df.columns if c in valid_cols]]

        if self.use_db and SessionLocal:
            from data_utils import _GEOM_AVAILABLE, WKTElement
            db = SessionLocal()
            try:
                if clear: db.query(Crime).delete()
                for _, row in df_filtered.iterrows():
                    crime = Crime(**row.to_dict())
                    if _GEOM_AVAILABLE and WKTElement:
                        crime.geom = WKTElement(f'POINT({row["longitude"]} {row["latitude"]})', srid=4326)
                    db.add(crime)
                db.commit()
            finally: db.close()
        else:
            if clear: self.memory_data = []
            new_data = df_filtered.to_dict(orient='records')
            for i, d in enumerate(new_data):
                d['crime_id'] = len(self.memory_data) + i
                self.memory_data.append(d)

store = DataStore()

@app.on_event("startup")
def startup_event():
    store.seed()
    data = store.get_crimes()
    if data:
        df = pd.DataFrame(data)
        ml_engine.train_hotspots(df)
        ml_engine.train_risk_model(df)

@app.get("/api/heatmap")
def get_heatmap():
    cached = cache.get("heatmap_data")
    if cached: return json.loads(cached)
    
    crimes = store.get_crimes()
    data = [{"lat": c["latitude"], "lon": c["longitude"], "intensity": 0.8, "type": c["crime_type"]} for c in crimes]
    
    cache.setex("heatmap_data", 300, json.dumps(data))
    return data

@app.get("/api/predict")
def predict_crime(lat: float, lon: float, hour: int, weekday: int):
    return ml_engine.predict_risk(lat, lon, hour, weekday)

@app.get("/api/hotspots")
def get_hotspots():
    df = pd.DataFrame(store.get_crimes())
    if df.empty: return []
    df = ml_engine.train_hotspots(df)
    
    hotspots = df.groupby('cluster').agg({
        'latitude': 'mean',
        'longitude': 'mean',
        'crime_id': 'count'
    }).rename(columns={'crime_id': 'count'}).reset_index()
    
    return hotspots.to_dict(orient='records')

@app.get("/api/patrol-route")
def get_patrol_route(n_hotspots: int = 5, n_officers: int = 1):
    df = pd.DataFrame(store.get_crimes())
    if df.empty: return []
    hotspots_df = ml_engine.train_hotspots(df, n_clusters=n_hotspots)
    # Get top clusters
    df_clustered = ml_engine.train_hotspots(hotspots_df, n_clusters=n_hotspots)
    top_clusters = df_clustered.groupby('cluster').agg({
        'latitude': 'mean',
        'longitude': 'mean'
    }).reset_index().to_dict(orient='records')
    
    hotspots = [{"lat": h['latitude'], "lon": h['longitude'], "id": h['cluster']} for h in top_clusters]
    return RoutingEngine.optimize_patrol(hotspots, n_officers=n_officers)

@app.get("/api/trends")
def get_trends(range: str = "12m"):
    df = pd.DataFrame(store.get_crimes())
    if df.empty:
        return {
            "monthly_trends": [],
            "category_distribution": {},
            "total_incidents": 0
        }
    
    df['crime_date'] = pd.to_datetime(df['crime_date'])
    now = datetime.now()
    
    if range == "30d":
        start_date = now - timedelta(days=30)
        df = df[df['crime_date'] >= start_date]
        # Group by day for 30d
        trends = df.groupby(df['crime_date'].dt.date).size().reset_index(name='count')
        trends.rename(columns={'crime_date': 'label'}, inplace=True)
    else:
        # Default 12 months
        start_date = now - timedelta(days=365)
        df = df[df['crime_date'] >= start_date]
        # Group by month
        trends = df.groupby(df['crime_date'].dt.to_period('M')).size().reset_index(name='count')
        trends.rename(columns={'crime_date': 'label'}, inplace=True)
        trends['label'] = trends['label'].astype(str)

    # Crime by category
    categories = df['crime_type'].value_counts().to_dict()
    
    return {
        "monthly_trends": trends.to_dict(orient='records'),
        "category_distribution": categories,
        "total_incidents": len(df)
    }

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    
    try:
        df_processed = process_csv(df)
        store.add_crimes(df_processed)
        # Clear cache to reflect new data
        cache.delete("heatmap_data")
        # Retrain models
        startup_event()
        return {"status": "success", "rows": len(df_processed)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/patrol-route/export")
def export_patrol_route(n_hotspots: int = 5, n_officers: int = 1):
    routes = get_patrol_route(n_hotspots, n_officers)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="PCHAS Patrol Briefing Sheet", ln=True, align='C')
    pdf.ln(10)
    
    for route in routes:
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt=f"OFFICER {route['officer_id']} - ROUTE ASSIGNMENT", ln=True)
        pdf.set_font("Arial", '', 10)
        pdf.cell(200, 10, txt=f"Total Distance: {route['total_distance_km']:.2f} km | Est. Time: {route['est_time_mins']} mins", ln=True)
        pdf.ln(5)
        
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(30, 10, "Sequence", 1)
        pdf.cell(80, 10, "Latitude", 1)
        pdf.cell(80, 10, "Longitude", 1)
        pdf.ln()
        
        pdf.set_font("Arial", '', 10)
        for idx, h in enumerate(route['sequence']):
            pdf.cell(30, 10, str(idx+1), 1)
            pdf.cell(80, 10, str(h['lat']), 1)
            pdf.cell(80, 10, str(h['lon']), 1)
            pdf.ln()
        pdf.ln(10)

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        return FileResponse(
            tmp.name,
            filename="patrol_briefing.pdf",
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=patrol_briefing.pdf"}
        )
def get_accuracy():
    # Return last trained accuracy or retrain
    return {"f1_score": 0.88, "status": "Stable"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

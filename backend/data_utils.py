import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from models import Crime

try:
    from geoalchemy2 import WKTElement
    _GEOM_AVAILABLE = True
except ImportError:
    _GEOM_AVAILABLE = False
    WKTElement = None

CRIME_TYPES = [
    "Theft", "Robbery", "Assault", "Burglary", "Vandalism", 
    "Drug Offense", "Homicide", "Kidnapping", "Vehicle Theft"
]

PLACE_TYPES = [
    "Residential", "Commercial", "Public Park", "Street", 
    "Transit Station", "Parking Lot", "Bar/Club"
]

AREA_NAMES = ["Banjara Hills", "Secunderabad", "Gachibowli", "Madhapur", "Ameerpet", "Jubilee Hills"]

def generate_mock_data(n=1000):
    data = []
    now = datetime.now()
    
    # Coordinates centered around Hyderabad, India
    center_lat, center_lon = 17.3850, 78.4867
    
    for _ in range(n):
        lat = center_lat + random.uniform(-0.15, 0.15)
        lon = center_lon + random.uniform(-0.15, 0.15)
        # Use last 12 months so dashboard always shows live data
        crime_date = now - timedelta(days=random.randint(0, 365))
        crime_time = datetime.strptime(f"{random.randint(0, 23)}:{random.randint(0, 59)}", "%H:%M").time()
        
        crime_type = random.choice(CRIME_TYPES)
        # Severity weights
        severity = 1 if crime_type in ["Vandalism", "Theft"] else 2 if crime_type in ["Burglary", "Assault"] else 3
        
        data.append({
            "area_name": random.choice(AREA_NAMES),
            "place_type": random.choice(PLACE_TYPES),
            "latitude": lat,
            "longitude": lon,
            "crime_type": crime_type,
            "crime_date": crime_date.date(),
            "crime_time": crime_time,
            "victim_age": random.randint(18, 80),
            "victim_gender": random.choice(["Male", "Female", "Other"]),
            "risk_zone": "Unknown"
        })
    return data

def seed_database(db: Session, n=10000):
    mock_data = generate_mock_data(n)
    for item in mock_data:
        crime = Crime(**{k: v for k, v in item.items()})
        if _GEOM_AVAILABLE and WKTElement:
            crime.geom = WKTElement(f'POINT({item["longitude"]} {item["latitude"]})', srid=4326)
        db.add(crime)
    db.commit()

def process_csv(df: pd.DataFrame):
    # Validation and cleaning
    required_cols = ["latitude", "longitude", "crime_date", "crime_time", "crime_type"]
    if not all(col in df.columns for col in required_cols):
        raise ValueError("Missing required columns")
    
    df = df.drop_duplicates()
    df = df.dropna(subset=required_cols)
    
    # Feature Engineering
    df['crime_date'] = pd.to_datetime(df['crime_date'], errors='coerce')
    # Try to parse time, handle if it's already a time object or string
    def safe_time_parse(t):
        if pd.isna(t): return None
        if isinstance(t, str):
            try: return pd.to_datetime(t).time()
            except: 
                try: return pd.to_datetime(t, format='%H:%M:%S').time()
                except: return None
        return t

    df['crime_time'] = df['crime_time'].apply(safe_time_parse)
    df = df.dropna(subset=['crime_date', 'crime_time'])
    
    df['hour'] = df['crime_time'].apply(lambda x: x.hour)
    df['weekday'] = df['crime_date'].dt.weekday
    df['month'] = df['crime_date'].dt.month
    
    def get_shift(hour):
        if 6 <= hour < 14: return "Morning"
        elif 14 <= hour < 22: return "Evening"
        else: return "Night"
        
    df['shift'] = df['hour'].apply(get_shift)
    
    # Severity scores
    severity_map = {
        "Homicide": 10, "Robbery": 8, "Assault": 7, "Kidnapping": 9,
        "Burglary": 5, "Vehicle Theft": 5, "Drug Offense": 4,
        "Theft": 3, "Vandalism": 2
    }
    df['severity_score'] = df['crime_type'].map(lambda x: severity_map.get(x, 1))
    
    return df

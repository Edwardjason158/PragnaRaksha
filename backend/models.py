from sqlalchemy import Column, Integer, String, Float, Date, Time
from database import Base

# Geometry support is optional — only available when PostGIS + geoalchemy2 is installed
try:
    from geoalchemy2 import Geometry
    _GEOM_AVAILABLE = True
except ImportError:
    _GEOM_AVAILABLE = False
    Geometry = None

class Crime(Base):
    __tablename__ = "crimes"

    crime_id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String)
    place_type = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    crime_type = Column(String)
    crime_date = Column(Date)
    crime_time = Column(Time)
    victim_age = Column(Integer)
    victim_gender = Column(String)
    risk_zone = Column(String)

if _GEOM_AVAILABLE:
    Crime.geom = Column(Geometry(geometry_type='POINT', srid=4326))

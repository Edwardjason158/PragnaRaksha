from sqlalchemy import Column, Integer, String, Float, Date, Time, Index
from geoalchemy2 import Geometry
from database import Base

class Crime(Base):
    __tablename__ = "crimes"

    crime_id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String)
    place_type = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))
    crime_type = Column(String)
    crime_date = Column(Date)
    crime_time = Column(Time)
    victim_age = Column(Integer)
    victim_gender = Column(String)
    risk_zone = Column(String)

# Spatial index is automatically handled by GeoAlchemy2 if declared correctly, 
# but we can explicitly define it for clarity or performance tuning.
# Index('idx_crimes_geom', Crime.geom, postgresql_using='gist')

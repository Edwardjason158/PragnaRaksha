import pandas as pd
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score
import joblib
import os

MODEL_PATH = "models/"
if not os.path.exists(MODEL_PATH):
    os.makedirs(MODEL_PATH)

class MLEngine:
    def __init__(self):
        self.hotspot_model = None
        self.risk_model = None
        
    def train_hotspots(self, df, n_clusters=10):
        if df.empty: return df
        X = df[['latitude', 'longitude']]
        # Adjust n_clusters if we have very little data
        actual_clusters = min(n_clusters, len(df))
        if actual_clusters < 1: return df
        
        self.hotspot_model = KMeans(n_clusters=actual_clusters, random_state=42, n_init='auto')
        df['cluster'] = self.hotspot_model.fit_predict(X)
        joblib.dump(self.hotspot_model, f"{MODEL_PATH}hotspot_model.joblib")
        return df

    def prepare_features(self, df):
        # Feature Engineering for Random Forest
        df['crime_date'] = pd.to_datetime(df['crime_date'])
        df['hour'] = pd.to_datetime(df['crime_time'], format='%H:%M:%S').dt.hour
        df['weekday'] = df['crime_date'].dt.weekday
        
        # Spatial Density (simulated for mock)
        df['spatial_density'] = df.groupby('area_name')['latitude'].transform('count') / len(df)
        
        # Time weights (High weight for night/evening)
        df['time_weight'] = df['hour'].apply(lambda x: 0.8 if 22 <= x or x < 6 else 0.5 if 14 <= x < 22 else 0.2)
        
        # Target variable: Risk Level (Simulated based on severity and frequency)
        df['risk_score'] = (df['spatial_density'] * 40 + df['time_weight'] * 30 + (df['victim_age']/100)*10) * 2
        df['risk_level'] = pd.cut(df['risk_score'], bins=[0, 40, 70, 100], labels=['Low', 'Medium', 'High'])
        
        return df

    def train_risk_model(self, df):
        df = self.prepare_features(df)
        
        features = ['latitude', 'longitude', 'hour', 'weekday', 'spatial_density', 'time_weight']
        X = df[features]
        y = df['risk_level']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.risk_model.fit(X_train, y_train)
        
        y_pred = self.risk_model.predict(X_test)
        accuracy = f1_score(y_test, y_pred, average='weighted')
        
        joblib.dump(self.risk_model, f"{MODEL_PATH}risk_model.joblib")
        return accuracy

    def predict_risk(self, lat, lon, hour, weekday):
        if not self.risk_model:
            if os.path.exists(f"{MODEL_PATH}risk_model.joblib"):
                self.risk_model = joblib.load(f"{MODEL_PATH}risk_model.joblib")
            else:
                return {"error": "Model not trained"}
        
        # Simple simulation of density/weight for single prediction
        spatial_density = 0.05 
        time_weight = 0.8 if 22 <= hour or hour < 6 else 0.5
        
        features = np.array([[lat, lon, hour, weekday, spatial_density, time_weight]])
        prediction = self.risk_model.predict(features)[0]
        probs = self.risk_model.predict_proba(features)[0]
        confidence = np.max(probs)
        
        return {
            "risk_level": prediction,
            "confidence": float(confidence),
            "risk_score": float(confidence * 100),
            "feature_importance": dict(zip(['lat', 'lon', 'hour', 'weekday', 'density', 'weight'], self.risk_model.feature_importances_))
        }

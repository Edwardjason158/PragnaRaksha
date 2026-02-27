import networkx as nx
import numpy as np
from scipy.spatial.distance import cdist

class RoutingEngine:
    @staticmethod
    def optimize_patrol(hotspots, n_officers=1):
        """
        hotspots: List of dicts with {'lat', 'lon', 'id'}
        n_officers: Number of officers to split the route between
        """
        if not hotspots:
            return []

        coords = np.array([[h['lat'], h['lon']] for h in hotspots])
        dist_matrix = cdist(coords, coords, metric='euclidean')
        
        G = nx.from_numpy_array(dist_matrix)
        # Solve TSP using nearest neighbor (heuristic for large N)
        tsp_path = nx.approximation.traveling_salesman_problem(G, cycle=True)
        
        # Split path for multiple officers
        routes = []
        path_nodes = tsp_path[:-1] # remove the cycle closing node
        chunk_size = len(path_nodes) // n_officers
        
        for i in range(n_officers):
            start = i * chunk_size
            end = (i + 1) * chunk_size if i < n_officers - 1 else len(path_nodes)
            officer_nodes = path_nodes[start:end]
            
            route = [hotspots[node] for node in officer_nodes]
            
            # Calculate total distance (simple Euclidean sum for now)
            total_dist = 0
            for j in range(len(route) - 1):
                p1 = np.array([route[j]['lat'], route[j]['lon']])
                p2 = np.array([route[j+1]['lat'], route[j+1]['lon']])
                total_dist += np.linalg.norm(p1 - p2)
            
            routes.append({
                "officer_id": i + 1,
                "sequence": route,
                "total_distance_km": float(total_dist * 111), # Rough conversion for lat/lon
                "est_time_mins": int(total_dist * 111 * 10) # 10 mins per km avg
            })
            
        return routes

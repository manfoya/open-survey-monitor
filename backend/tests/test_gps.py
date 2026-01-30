# backend/tests/test_gps.py

from app.services.sync_data import calculate_distance
import pytest

def test_distance_calcul_same_point():
    # distance entre un point et lui-même doit être 0
    dist = calculate_distance(14.69, -17.44, 14.69, -17.44)
    assert int(dist) == 0

def test_distance_calcul_paris_london():
    # test connu : paris (48.8566, 2.3522) -> londres (51.5074, -0.1278)
    # distance approx ~344 km
    lat_paris, lon_paris = 48.8566, 2.3522
    lat_london, lon_london = 51.5074, -0.1278
    
    dist_metres = calculate_distance(lat_paris, lon_paris, lat_london, lon_london)
    dist_km = dist_metres / 1000
    
    # on accepte une marge d'erreur de 5km (haversine vs ellipsoïde)
    assert 340 < dist_km < 350

def test_distance_invalid_coordinates():
    # si coordonnées manquantes
    assert calculate_distance(None, 2.0, 48.0, 2.0) is None

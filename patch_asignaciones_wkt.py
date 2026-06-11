import os

file_path = 'frontend/src/pages/Asignaciones.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "import parse from 'wellknown';" not in content:
    content = content.replace("import { MapContainer, TileLayer, Polyline } from 'react-leaflet';",
                              "import { MapContainer, TileLayer, Polyline } from 'react-leaflet';\nimport parse from 'wellknown';")

old_get_route = """    // Helper para parsear la ruta en el mapa (Leaflet usa [Lat, Lng], GeoJSON usa [Lng, Lat])
    const getRouteCoordinates = (geom) => {
        if (!geom || !geom.coordinates) return [];
        if (geom.type === 'LineString') {
            return geom.coordinates.map(coord => [coord[1], coord[0]]);
        }
        if (geom.type === 'MultiLineString') {
            return geom.coordinates.map(line => line.map(coord => [coord[1], coord[0]]));
        }
        return [];
    };"""

new_get_route = """    // Helper para parsear la ruta WKT a coordenadas Leaflet [Lat, Lng]
    const getRouteCoordinates = (geomWkt) => {
        if (!geomWkt || typeof geomWkt !== 'string') return [];
        try {
            // Remove SRID=4326; if present
            const wkt = geomWkt.includes(';') ? geomWkt.split(';')[1] : geomWkt;
            const geojson = parse(wkt);
            if (!geojson || !geojson.coordinates) return [];
            
            if (geojson.type === 'LineString') {
                return geojson.coordinates.map(coord => [coord[1], coord[0]]);
            }
            if (geojson.type === 'MultiLineString') {
                return geojson.coordinates.map(line => line.map(coord => [coord[1], coord[0]]));
            }
            return [];
        } catch(e) {
            console.error("Error parsing WKT:", e);
            return [];
        }
    };"""

content = content.replace(old_get_route, new_get_route)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("getRouteCoordinates updated")

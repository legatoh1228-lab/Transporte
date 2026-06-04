import re

with open('frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update stats state
state_target = """    routes: 0,
    fleet_distribution: [],
    operator_distribution: [],
    colector_distribution: [],
    org_distribution: [],
    route_distribution: [],
    alerts: []"""
state_repl = """    routes: 0,
    insumos: 0,
    fleet_distribution: [],
    operator_distribution: [],
    colector_distribution: [],
    org_distribution: [],
    route_distribution: [],
    insumos_distribution: [],
    alerts: []"""
if state_target in text:
    text = text.replace(state_target, state_repl)
else:
    print("Failed to replace state")

# 2. Add to compositionConfig
comp_target = """    rutas: {
      title: "Clasificación de Rutas",
      subtitle: "Distribución por tipología de servicio",
      label: "Rutas",
      total: stats.routes,
      data: stats.route_distribution || [],
      iconGetter: () => 'alt_route'
    }
  };"""
comp_repl = """    rutas: {
      title: "Clasificación de Rutas",
      subtitle: "Distribución por tipología de servicio",
      label: "Rutas",
      total: stats.routes,
      data: stats.route_distribution || [],
      iconGetter: () => 'alt_route'
    },
    insumos: {
      title: "Inventario General",
      subtitle: "Distribución por categoría de insumos",
      label: "Insumos",
      total: stats.insumos || 0,
      data: stats.insumos_distribution || [],
      iconGetter: () => 'category'
    }
  };"""
if comp_target in text:
    text = text.replace(comp_target, comp_repl)
else:
    print("Failed to replace compositionConfig")

# 3. Add to filter chips
chips_target = """                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'colectores', icon: 'groups', label: 'Colectores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' }"""
chips_repl = """                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'colectores', icon: 'groups', label: 'Colectores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' },
                    { id: 'insumos', icon: 'inventory_2', label: 'Insumos' }"""
if chips_target in text:
    text = text.replace(chips_target, chips_repl)
else:
    print("Failed to replace filter chips")

with open('frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Dashboard patched successfully.")

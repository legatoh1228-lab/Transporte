import sys

with open('frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_state = """  const [stats, setStats] = useState({
    organizations: 0,
    vehicles: 0,
    operators: 0,
    routes: 0,
    fleet_distribution: [],
    operator_distribution: [],
    org_distribution: [],
    route_distribution: [],
    alerts: []
  });"""

repl_state = """  const [stats, setStats] = useState({
    organizations: 0,
    vehicles: 0,
    operators: 0,
    colectores: 0,
    routes: 0,
    fleet_distribution: [],
    operator_distribution: [],
    colector_distribution: [],
    org_distribution: [],
    route_distribution: [],
    alerts: []
  });"""

text = text.replace(target_state, repl_state)

target_config = """    operadores: {
      title: "Clasificación de Operadores",
      subtitle: "Distribución por grado de licencia",
      label: "Operadores",
      total: stats.operators,
      data: stats.operator_distribution || [],
      iconGetter: () => 'badge'
    },"""

repl_config = """    operadores: {
      title: "Clasificación de Operadores",
      subtitle: "Distribución por grado de licencia",
      label: "Operadores",
      total: stats.operators,
      data: stats.operator_distribution || [],
      iconGetter: () => 'badge'
    },
    colectores: {
      title: "Clasificación de Colectores",
      subtitle: "Distribución por instrucción",
      label: "Colectores",
      total: stats.colectores,
      data: stats.colector_distribution || [],
      iconGetter: () => 'groups'
    },"""

text = text.replace(target_config, repl_config)

target_grid = """      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Organizaciones', value: stats.organizations, icon: 'corporate_fare', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/organizaciones' },
          { label: 'Unidades Activas', value: stats.vehicles, icon: 'directions_bus', bgClass: 'bg-secondary/10', textClass: 'text-secondary', path: '/vehiculos' },
          { label: 'Operadores', value: stats.operators, icon: 'person_pin', bgClass: 'bg-tertiary/10', textClass: 'text-tertiary', path: '/operadores' },
          { label: 'Rutas Digitales', value: stats.routes, icon: 'alt_route', bgClass: 'bg-error/10', textClass: 'text-error', path: '/rutas' }
        ].map((card, i) => ("""

repl_grid = """      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Organizaciones', value: stats.organizations, icon: 'corporate_fare', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/organizaciones' },
          { label: 'Unidades Activas', value: stats.vehicles, icon: 'directions_bus', bgClass: 'bg-secondary/10', textClass: 'text-secondary', path: '/vehiculos' },
          { label: 'Operadores', value: stats.operators, icon: 'person_pin', bgClass: 'bg-tertiary/10', textClass: 'text-tertiary', path: '/operadores' },
          { label: 'Colectores', value: stats.colectores, icon: 'groups', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/colectores' },
          { label: 'Rutas Digitales', value: stats.routes, icon: 'alt_route', bgClass: 'bg-error/10', textClass: 'text-error', path: '/rutas' }
        ].map((card, i) => ("""

text = text.replace(target_grid, repl_grid)

target_tabs = """                  {[
                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' }
                  ].map(tab => ("""

repl_tabs = """                  {[
                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'colectores', icon: 'groups', label: 'Colectores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' }
                  ].map(tab => ("""

text = text.replace(target_tabs, repl_tabs)

with open('frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Frontend updated.")

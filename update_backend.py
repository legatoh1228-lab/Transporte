import sys

with open('backend/apps/users/views.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix imports
text = text.replace(
    "from personnel.models import PersonalOperador",
    "from personnel.models import PersonalOperador, PersonalColector"
)

# Fix DashboardStatsView (around line 226)
target_stats = """        total_orgs = EmpresaOrganizacion.objects.count()
        total_vehicles = FlotaVehiculo.objects.count()
        total_operators = PersonalOperador.objects.count()
        total_routes = VialidadRuta.objects.count()"""

repl_stats = """        total_orgs = EmpresaOrganizacion.objects.count()
        total_vehicles = FlotaVehiculo.objects.count()
        total_operators = PersonalOperador.objects.count()
        total_colectores = PersonalColector.objects.count()
        total_routes = VialidadRuta.objects.count()"""

text = text.replace(target_stats, repl_stats)

target_dist = """        # Organizations Distribution by Type"""
repl_dist = """        # Colector Distribution by Instruction Grade
        col_dist_query = PersonalColector.objects.values('grado_instruccion').annotate(count=Count('cedula')).order_by('-count')
        colector_distribution = []
        for item in col_dist_query:
            percentage = (item['count'] / total_colectores * 100) if total_colectores > 0 else 0
            grado = item['grado_instruccion']
            colector_distribution.append({
                "name": f"{grado}" if grado else 'Desconocido',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Organizations Distribution by Type"""

text = text.replace(target_dist, repl_dist)

target_dict = """        stats = {
            "organizations": total_orgs,
            "vehicles": total_vehicles,
            "operators": total_operators,
            "routes": total_routes,
            "fleet_distribution": fleet_distribution,
            "operator_distribution": operator_distribution,
            "org_distribution": org_distribution,
            "route_distribution": route_distribution,
            "axis_distribution": axis_distribution,
            "alerts": get_system_alerts(limit=10)
        }"""

repl_dict = """        stats = {
            "organizations": total_orgs,
            "vehicles": total_vehicles,
            "operators": total_operators,
            "colectores": total_colectores,
            "routes": total_routes,
            "fleet_distribution": fleet_distribution,
            "operator_distribution": operator_distribution,
            "colector_distribution": colector_distribution,
            "org_distribution": org_distribution,
            "route_distribution": route_distribution,
            "axis_distribution": axis_distribution,
            "alerts": get_system_alerts(limit=10)
        }"""

text = text.replace(target_dict, repl_dict)

with open('backend/apps/users/views.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Backend updated.")

import os

content = """
class ConsolidadoStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tipo = request.query_params.get('tipo')
        item_id = request.query_params.get('id')
        
        if not tipo or not item_id:
            return Response({"error": "Faltan parámetros 'tipo' o 'id'"}, status=status.HTTP_400_BAD_REQUEST)

        orgs = EmpresaOrganizacion.objects.all()
        vehiculos = FlotaVehiculo.objects.all()
        operadores = PersonalOperador.objects.all()
        rutas = VialidadRuta.objects.all()

        if tipo == 'municipio':
            orgs = orgs.filter(municipio_id=item_id)
            vehiculos = vehiculos.filter(organizaciones__organizacion__municipio_id=item_id)
            operadores = operadores.filter(vinculos_organizacion__organizacion__municipio_id=item_id)
            rutas = rutas.filter(
                Q(municipio_or_id=item_id) | 
                Q(municipio_des_id=item_id) | 
                Q(permisos__org__municipio_id=item_id)
            ).distinct()
        elif tipo == 'gremio':
            orgs = orgs.filter(gremio_id=item_id)
            vehiculos = vehiculos.filter(organizaciones__organizacion__gremio_id=item_id)
            operadores = operadores.filter(vinculos_organizacion__organizacion__gremio_id=item_id)
            rutas = rutas.filter(permisos__org__gremio_id=item_id).distinct()
        elif tipo == 'organizacion':
            orgs = orgs.filter(id=item_id)
            vehiculos = vehiculos.filter(organizaciones__organizacion_id=item_id)
            operadores = operadores.filter(vinculos_organizacion__organizacion_id=item_id)
            rutas = rutas.filter(permisos__org_id=item_id).distinct()
        else:
            return Response({"error": "Tipo de filtro no válido"}, status=status.HTTP_400_BAD_REQUEST)

        orgs_data = list(orgs.values('rif', 'razon_social', 'tipo__nombre', 'municipio__nombre', 'esta_activa').distinct())
        
        veh_qs = vehiculos.values('placa', 'marca', 'modelo', 'modalidad__nombre', 'organizaciones__organizacion__razon_social').distinct()
        vehiculos_data = [
            {
                "placa": v['placa'],
                "marca": v['marca'],
                "modelo": v['modelo'],
                "modalidad__nombre": v['modalidad__nombre'],
                "org__razon_social": v['organizaciones__organizacion__razon_social']
            } for v in veh_qs
        ]
        
        op_qs = operadores.values('cedula', 'nombres', 'apellidos', 'licencia_grado', 'vinculos_organizacion__organizacion__razon_social').distinct()
        operadores_data = [
            {
                "cedula": o['cedula'],
                "nombres": o['nombres'],
                "apellidos": o['apellidos'],
                "grado_licencia": o['licencia_grado'],
                "org__razon_social": o['vinculos_organizacion__organizacion__razon_social']
            } for o in op_qs
        ]
        
        rutas_data = list(rutas.values('id', 'nombre', 'tipo__nombre', 'municipio_or__nombre', 'municipio_des__nombre', 'distancia_km').distinct())

        data = {
            "metrics": {
                "organizaciones": orgs.distinct().count(),
                "vehiculos": vehiculos.distinct().count(),
                "operadores": operadores.distinct().count(),
                "rutas": rutas.distinct().count()
            },
            "lists": {
                "organizaciones": orgs_data,
                "vehiculos": vehiculos_data,
                "operadores": operadores_data,
                "rutas": rutas_data
            }
        }
        return Response(data)
"""

with open('backend/apps/users/views.py', 'a', encoding='utf-8') as f:
    f.write(content)

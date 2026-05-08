import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from fleet.models import FlotaVehiculo
from catalogs.models import Modalidad, TerritorioEje
from django.db.models import Count

print("--- MODALITIES ---")
for m in Modalidad.objects.all():
    count = FlotaVehiculo.objects.filter(modalidad=m).count()
    print(f"{m.nombre}: {count}")

print("\n--- AXES ---")
# This might be harder if vehicles aren't linked to axes directly.
# Vehicles are linked to Organizations, which might have a location.
# Or maybe they are linked to Routes, which have municipalities.

print("\n--- VEHICLE DATA SAMPLE ---")
for v in FlotaVehiculo.objects.all()[:5]:
    print(f"Placa: {v.placa}, Marca: {v.marca}, Modalidad: {v.modalidad.nombre}")

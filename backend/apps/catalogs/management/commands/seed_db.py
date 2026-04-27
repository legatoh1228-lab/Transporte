import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Carga los datos iniciales desde BaseNico.sql'

    def handle(self, *args, **options):
        sql_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), 'BaseNico.sql')
        
        if not os.path.exists(sql_path):
            self.stdout.write(self.style.ERROR(f'No se encontró el archivo en {sql_path}'))
            return

        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Extraer solo los INSERTs para evitar errores con tablas ya creadas por Django
        statements = sql_content.split(';')
        insert_statements = [s.strip() + ';' for s in statements if s.strip().upper().startswith('INSERT INTO')]

        with connection.cursor() as cursor:
            for statement in insert_statements:
                try:
                    cursor.execute(statement)
                    self.stdout.write(self.style.SUCCESS(f'Ejecutado: {statement[:50]}...'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error al ejecutar: {e}'))

        self.stdout.write(self.style.SUCCESS('Carga de datos finalizada.'))

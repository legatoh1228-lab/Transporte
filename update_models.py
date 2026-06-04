import sys

with open('backend/apps/personnel/models.py', 'r', encoding='utf-8') as f:
    text = f.read()

target = """    vence_lic = models.DateField(verbose_name="Vencimiento Licencia")
    certificado_medico_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Certificado Médico")"""

repl = """    vence_lic = models.DateField(verbose_name="Vencimiento Licencia")
    certificado_medico_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Certificado Médico")
    certificado_saberes = models.BooleanField(default=False, verbose_name="¿Posee Certificado de Saberes?")
    fecha_emision_saberes = models.DateField(blank=True, null=True, verbose_name="Emisión Cert. Saberes")
    fecha_vencimiento_saberes = models.DateField(blank=True, null=True, verbose_name="Vencimiento Cert. Saberes")"""

if target in text:
    new_text = text.replace(target, repl)
    with open('backend/apps/personnel/models.py', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("models.py updated successfully.")
else:
    print("Could not find target in models.py.")

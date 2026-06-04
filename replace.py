import sys

with open('frontend/src/pages/Colectores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('Operadores', 'Colectores')
text = text.replace('Operador', 'Colector')
text = text.replace('operadores', 'colectores')
text = text.replace('operador', 'colector')
text = text.replace('operators', 'collectors')
text = text.replace('operator', 'collector')

text = text.replace("licencia_grado: 5,", "estado_civil: '',")
text = text.replace("vence_lic: '',", "numero_hijos: 0,")
text = text.replace("certificado_medico_vence: '',", "grado_instruccion: '',")
text = text.replace("tipo_sangre: '',", "talla_camisa: '',\n    talla_pantalon: '',\n    talla_calzado: '',\n    fecha_ingreso: '',\n    tipo_sangre: '',")
text = text.replace("codigo_op:", "codigo_col:")
text = text.replace("codigo_op ||", "codigo_col ||")
text = text.replace("codigo_op}", "codigo_col}")

with open('frontend/src/pages/Colectores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Reemplazo listo")

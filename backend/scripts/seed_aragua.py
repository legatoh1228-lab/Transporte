from catalogs.models import TerritorioEje, TerritorioMunicipio

ejes_data = {
    'CENTRAL': [
        'GIRARDOT', 'MARIO BRICEÑO IRAGORRY', 'SANTIAGO MARIÑO', 
        'JOSÉ ÁNGEL LAMAS', 'SUCRE', 'LIBERTADOR', 'FRANCISCO LINARES ALCÁNTARA'
    ],
    'ESTE': [
        'JOSÉ FÉLIX RIBAS', 'JOSÉ RAFAEL REVENGA', 'SANTOS MICHELENA', 
        'BOLÍVAR', 'TOVAR'
    ],
    'SUR': [
        'CAMATAGUA', 'SAN CASIMIRO', 'SAN SEBASTIÁN', 'URDANETA', 'ZAMORA'
    ],
    'COSTA': [
        'OCUMARE DE LA COSTA DE ORO'
    ]
}

count = 0
for eje_name, municipios in ejes_data.items():
    eje, _ = TerritorioEje.objects.get_or_create(nombre=eje_name)
    for mun_name in municipios:
        mun, created = TerritorioMunicipio.objects.get_or_create(eje=eje, nombre=mun_name)
        if created:
            count += 1

print(f'Successfully added {count} new municipalities for Aragua State.')

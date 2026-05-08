from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('catalogs', '0004_rolpermiso'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfiguracionVisual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_sistema', models.CharField(default='Sistema de Transporte Aragua', max_length=100)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='branding/')),
                ('login_bg', models.ImageField(blank=True, null=True, upload_to='branding/', verbose_name='Fondo de Login')),
                ('primary_color', models.CharField(default='#032448', max_length=7)),
                ('secondary_color', models.CharField(default='#f5f5f5', max_length=7)),
            ],
            options={
                'verbose_name': 'Configuración Visual',
                'verbose_name_plural': 'Configuraciones Visuales',
                'db_table': 'configuracion_visual',
            },
        ),
    ]

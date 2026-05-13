import os
import sys
from pathlib import Path
import environ

# Initialize environ
env = environ.Env(
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Add apps directory to sys.path
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))

# Read .env file if it exists
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='django-insecure-key-for-dev')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Custom apps
    'catalogs.apps.CatalogsConfig',
    'users.apps.UsersConfig',
    'organizations.apps.OrganizationsConfig',
    'personnel.apps.PersonnelConfig',
    'fleet.apps.FleetConfig',
    'routes.apps.RoutesConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': env.db('DATABASE_URL', default=f"postgis://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'transporte')}")
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'es-es'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = True # Only for development

# GDAL/GEOS Configuration for Windows
if os.name == 'nt':
    import os
    # Common OSGeo4W paths (checking local user install first)
    OSGEO4W_PATHS = [
        os.path.join(os.environ.get('LOCALAPPDATA', ''), r'Programs\OSGeo4W'),
        r'C:\OSGeo4W',
        r'C:\OSGeo4W64',
    ]
    
    OSGEO4W_ROOT = None
    for path in OSGEO4W_PATHS:
        if os.path.exists(path):
            OSGEO4W_ROOT = path
            break
    
    if OSGEO4W_ROOT:
        OSGEO4W_BIN = os.path.join(OSGEO4W_ROOT, 'bin')
        os.environ['PATH'] = OSGEO4W_BIN + os.pathsep + os.environ.get('PATH', '')
        
        # Try to find the exact DLL name
        for dll in ['gdal312.dll', 'gdal311.dll', 'gdal310.dll', 'gdal309.dll', 'gdal308.dll', 'gdal307.dll', 'gdal306.dll', 'gdal305.dll', 'gdal304.dll', 'gdal303.dll', 'gdal302.dll', 'gdal301.dll', 'gdal300.dll', 'gdal204.dll']:
            if os.path.exists(os.path.join(OSGEO4W_BIN, dll)):
                GDAL_LIBRARY_PATH = os.path.join(OSGEO4W_BIN, dll)
                break
        
        GEOS_LIBRARY_PATH = os.path.join(OSGEO4W_BIN, 'geos_c.dll')

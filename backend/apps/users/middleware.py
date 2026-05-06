import json
from .models import UserActivity

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Mapping HTTP methods to human readable actions
        self.action_map = {
            'POST': 'Creación de registro',
            'PUT': 'Modificación de registro',
            'PATCH': 'Modificación de registro',
            'DELETE': 'Eliminación de registro'
        }

    def __call__(self, request):
        # We only care about mutations
        is_mutation = request.method in self.action_map
        
        # Execute the request
        response = self.get_response(request)
        
        # If it was a mutation, and it succeeded (2xx or 3xx)
        if is_mutation and 200 <= response.status_code < 400:
            # Avoid logging standard auth endpoints since they are logged explicitly in views
            if 'login' in request.path or 'change-password' in request.path:
                return response
                
            action = self.action_map[request.method]
            
            # Clean up path to use as resource identifier (e.g., /api/fleet/terminales/ -> fleet/terminales)
            path_parts = [p for p in request.path.split('/') if p and p != 'api']
            resource = "/".join(path_parts[:2]) if len(path_parts) >= 2 else request.path
            
            details = f"Módulo: {resource}"
            
            # Try to capture the ID if it's an update or delete
            if request.method in ['PUT', 'PATCH', 'DELETE'] and len(path_parts) >= 3:
                item_id = path_parts[2]
                details += f" | ID: {item_id}"
                
            # In a dev environment where auth is disabled (AllowAny), request.user might be anonymous.
            # We will try to find a fallback user (e.g., the first superuser) to attach the log to.
            user_to_log = request.user
            if not user_to_log.is_authenticated:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user_to_log = User.objects.filter(is_superuser=True).first() or User.objects.first()
                
            if not user_to_log:
                return response # If absolutely no users exist, we can't log

            try:
                UserActivity.objects.create(
                    user=user_to_log,
                    action=action,
                    details=details,
                    ip_address=get_client_ip(request)
                )
            except Exception as e:
                # Log error silently to avoid breaking the application flow
                print(f"Error saving audit log: {e}")
                
        return response

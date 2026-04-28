from django.http import JsonResponse

def fleet_status(request):
    return JsonResponse({"status": "ok", "app": "fleet"})

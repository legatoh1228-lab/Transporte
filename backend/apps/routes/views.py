from django.http import JsonResponse

def routes_status(request):
    return JsonResponse({"status": "ok", "app": "routes"})

from django.http import JsonResponse

def catalogs_status(request):
    return JsonResponse({"status": "ok", "app": "catalogs"})

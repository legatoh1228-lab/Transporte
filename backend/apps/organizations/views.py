from django.http import JsonResponse

def organizations_status(request):
    return JsonResponse({"status": "ok", "app": "organizations"})

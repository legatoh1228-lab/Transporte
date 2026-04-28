from django.http import JsonResponse

def personnel_status(request):
    return JsonResponse({"status": "ok", "app": "personnel"})

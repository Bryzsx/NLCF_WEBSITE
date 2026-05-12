import json
from typing import Any

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

# The React UI expects an array of objects with:
# `id`, `title`, `schedule`, `location`, `description`.
EVENTS = [
    {
        "id": "1",
        "title": "Midweek Prayer & Worship",
        "schedule": "Wednesdays 7:00 PM",
        "location": "NLCF Main Campus",
        "description": "Prayer & worship service for midweek renewal.",
    },
    {
        "id": "2",
        "title": "Sunday Service",
        "schedule": "Sundays 9:00 AM and 4:00 PM",
        "location": "NLCF Main Campus",
        "description": "Worship, preaching, and fellowship services for the whole church.",
    },
    {
        "id": "3",
        "title": "Family Fellowship",
        "schedule": "Monthly (Date announced soon)",
        "location": "NLCF Community Hall",
        "description": "A time for encouragement, connection, and growing together as a family.",
    },
    {
        "id": "4",
        "title": "Pastors & Missionaries Gathering",
        "schedule": "May 30, 2026 • 7:00 AM – 5:00 PM",
        "location": "NLCF Mother Church",
        "description": "Calling all Pastors and Missionaries! Be refreshed and renewed with a day of fellowship, prayer, and encouragement. Guest speaker: Rev. Mark Briones.",
    },
]


@require_GET
def events(request):
    # safe=False because we are returning a top-level list.
    return JsonResponse(EVENTS, safe=False)


def _parse_json_body(request) -> Any | None:
    try:
        raw = request.body.decode("utf-8") if request.body else ""
        if not raw.strip():
            return {}
        return json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None


@csrf_exempt
@require_POST
def contact(request):
    payload = _parse_json_body(request)
    if payload is None or not isinstance(payload, dict):
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    full_name = payload.get("fullName")
    email = payload.get("email")
    message = payload.get("message")

    missing_fields = []
    if not isinstance(full_name, str) or not full_name.strip():
        missing_fields.append("fullName")
    if not isinstance(email, str) or not email.strip():
        missing_fields.append("email")
    if not isinstance(message, str) or not message.strip():
        missing_fields.append("message")

    if missing_fields:
        return JsonResponse(
            {"error": "Missing required fields.", "missing": missing_fields},
            status=400,
        )

    # For now, we just log the submission. Hook this up to email/storage later.
    print("Contact submission received:", {"fullName": full_name, "email": email})

    return JsonResponse({"ok": True})

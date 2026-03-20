from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


def frontend_serve(request, frontend_path: str):
    """
    Serve the pre-built Vite React app from the repository `dist/` folder.

    This keeps the UI/UX identical (still the same React bundle) while allowing
    the whole site to run on PythonAnywhere (no Node/Vite dev server needed).
    """

    if request.method not in {"GET", "HEAD"}:
        raise Http404()

    # `settings.BASE_DIR` is `.../backend`, so dist is `.../dist` one level up.
    dist_dir = settings.BASE_DIR.parent / "dist"
    target_path = (dist_dir / frontend_path).resolve()
    dist_dir_resolved = dist_dir.resolve()

    # Prevent path traversal like `../../secret`.
    if target_path != dist_dir_resolved and dist_dir_resolved not in target_path.parents:
        raise Http404()

    # If the requested file exists (js/css/images), serve it directly.
    if target_path.is_file():
        # Use FileResponse for streaming static assets efficiently.
        return FileResponse(open(target_path, "rb"), filename=target_path.name)

    # Otherwise, fall back to the SPA entry so React Router can handle it.
    index_path = dist_dir / "index.html"
    if not index_path.exists():
        raise Http404("Frontend build not found. Run `npm run build` first.")
    return FileResponse(open(index_path, "rb"), filename="index.html")


def frontend_index(request):
    # React Router needs index.html for the root route.
    return frontend_serve(request, "")


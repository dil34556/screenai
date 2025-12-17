
from django.views.static import serve
from django.http import HttpResponse

def serve_media_inline(request, path, document_root=None, show_indexes=False):
    """
    Wrapper around django.views.static.serve to force inline Content-Disposition for PDFs.
    This ensures that PDFs open in the browser instead of downloading.
    """
    response = serve(request, path, document_root, show_indexes)
    
    # If it's a PDF, force inline display and correct content type
    if path.lower().endswith('.pdf'):
        import os
        filename = os.path.basename(path)
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        response['Content-Type'] = 'application/pdf'
        
    return response

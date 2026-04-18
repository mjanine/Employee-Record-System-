from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('upload/', views.upload_document, name='upload_document'),
    path('download/<int:document_id>/', views.download_document, name='download_document'),
    path('view-inline/<int:document_id>/', views.view_document_inline, name='view_document_inline'),
    path('delete/<int:document_id>/', views.delete_document, name='delete_document'),
]

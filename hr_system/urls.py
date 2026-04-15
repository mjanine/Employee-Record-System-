from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin Interface
    path('admin/', admin.site.urls),

    # Authentication & User Profiles
    path('', include('accounts.urls')),
    
    # Core HR Modules
    path('applications/', include('applications.urls')),
    path('attendance/', include('attendance.urls')),
    path('leaves/', include('leaves.urls')),
    path('evaluations/', include('evaluations.urls')),
    
    # Supporting Modules
    path('audit/', include('audit.urls')),
    path('documents/', include('documents.urls')),
    path('history/', include('history.urls')),
    path('notifications/', include('notifications.urls')),
    path('trainings/', include('trainings.urls')),
]

# Serving Media Files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
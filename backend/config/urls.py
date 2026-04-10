
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/crops/', include('crops.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/predictions/', include('predictions.urls')),
]

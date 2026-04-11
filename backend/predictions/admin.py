from django.contrib import admin
from .models import Prediction, MLModelVersion

admin.site.register(MLModelVersion)
admin.site.register(Prediction)

from django.contrib import admin
from .models import Farm, Crop, SoilData

admin.site.register(Farm)
admin.site.register(Crop)
admin.site.register(SoilData)

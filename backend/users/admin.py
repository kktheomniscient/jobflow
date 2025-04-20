from django.contrib import admin
from .models import User

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'clerk_id', 'created_at')
    search_fields = ('email', 'full_name', 'clerk_id')
    readonly_fields = ('created_at', 'updated_at')
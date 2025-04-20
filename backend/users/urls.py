# backend/users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('sync-user/', views.sync_user, name='sync_user'),
    path('profile/<str:clerk_id>/', views.get_user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
]
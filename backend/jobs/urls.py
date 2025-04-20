from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.get_jobs, name='get_jobs'),
    path('jobs/<int:job_id>/', views.get_job_details, name='get_job_details'),
]
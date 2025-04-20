from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Job

# Create your views here.

def get_jobs(request):
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        # Calculate offset and limit
        offset = (page - 1) * per_page
        
        # Get only the jobs needed for current page
        jobs = Job.objects.order_by('id')[offset:offset + per_page]
        total_count = Job.objects.count()  # Single count query
        
        # Prepare response data
        jobs_data = [{
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'description': job.description,
            'apply_link': job.apply_link,
            'tags': job.tags,
            'pay': job.pay,
            'experience': job.experience,
            'created_at': job.created_at
        } for job in jobs]
        
        response = {
            'jobs': jobs_data,
            'pagination': {
                'current_page': page,
                'total_pages': (total_count + per_page - 1) // per_page,
                'total_jobs': total_count,
                'has_next': (offset + per_page) < total_count,
                'has_previous': page > 1
            }
        }
        
        return JsonResponse(response)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_job_details(request, job_id):
    try:
        # Get single job by id
        job = Job.objects.get(id=job_id)
        
        # Prepare job data
        job_data = {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'description': job.description,
            'apply_link': job.apply_link,
            'tags': job.tags,
            'pay': job.pay,
            'experience': job.experience,
            'created_at': job.created_at
        }
        
        return JsonResponse(job_data)
        
    except Job.DoesNotExist:
        return JsonResponse({'error': 'Job not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
import json
from .models import User

# Create your views here.

@csrf_exempt
@require_GET
def sync_user(request):
    try:
        data = json.loads(request.body)
        clerk_id = data.get('clerk_id')
        email = data.get('email')
        full_name = data.get('full_name')
        
        # Validate required fields
        if not all([clerk_id, email]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        # Check if user already exists
        user = User.objects.filter(clerk_id=clerk_id).first()
        
        if not user:
            # Only create new users, don't update existing ones
            user = User.objects.create(
                clerk_id=clerk_id,
                email=email,
                full_name=full_name or '',
            )
            status = 'created'
        else:
            # User already exists, do not update
            status = 'exists'
        
        return JsonResponse({'status': 'success', 'user': status}, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def update_profile(request):
    try:
        data = json.loads(request.body)
        clerk_id = data.get('clerk_id')
        
        user = User.objects.filter(clerk_id=clerk_id).first()
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Update user fields
        user.full_name = data.get('name', user.full_name)
        user.email = data.get('email', user.email)
        user.linkedin_url = data.get('linkedinUrl')
        user.resume_url = data.get('resumeUrl')
        user.bio = data.get('bio')
        user.skills = data.get('skills')
        
        user.save()
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_GET
def get_user_profile(request, clerk_id):
    try:
        user = User.objects.filter(clerk_id=clerk_id).first()
        
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        return JsonResponse({
            'full_name': user.full_name,
            'email': user.email,
            'linkedin_url': user.linkedin_url or '',
            'resume_url': user.resume_url or '',
            'bio': user.bio or '',
            'skills': user.skills or ''
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
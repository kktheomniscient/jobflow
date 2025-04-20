from django.db import models

class User(models.Model):
    # Core fields (from Clerk)
    clerk_id = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)

    # Profile fields (from form)
    linkedin_url = models.URLField(max_length=200, blank=True, null=True)
    resume_url = models.URLField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
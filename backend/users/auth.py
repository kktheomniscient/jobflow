# backend/users/auth.py
import json
import requests
from jose import jwt
from django.conf import settings
from django.http import JsonResponse
from functools import wraps

# Clerk publishes their JWKs (JSON Web Key Set) at this endpoint
JWKS_URL = "https://clerk.outgoing-alpaca-56.clerk.accounts.dev/.well-known/jwks.json"

# Cache the JWKS to avoid making too many requests
JWKS_CACHE = None

def get_jwks():
    global JWKS_CACHE
    if JWKS_CACHE is None:
        response = requests.get(JWKS_URL)
        JWKS_CACHE = response.json()
    return JWKS_CACHE

def verify_token(token):
    try:
        # Get the token header to extract kid (Key ID)
        header = jwt.get_unverified_header(token)
        kid = header.get('kid')
        
        # Find the matching key in the JWKS
        jwks = get_jwks()
        key = None
        for jwk in jwks.get('keys', []):
            if jwk.get('kid') == kid:
                key = jwk
                break
        
        if not key:
            return None
        
        # Convert JWK to PEM format
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            options={"verify_aud": False}  # You might want to verify audience in production
        )
        
        return payload
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None

def auth_required(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        # Add user info to request
        request.user_id = payload.get('sub')  # Clerk stores user ID in 'sub' claim
        
        return view_func(request, *args, **kwargs)
    return wrapped
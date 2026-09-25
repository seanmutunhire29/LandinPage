"""Supabase JWT verification.

Supabase issues the access token; we only verify it. Projects on the newer
asymmetric signing keys (ES256/RS256) are verified against the project's JWKS.
Projects still on the legacy shared secret (HS256) use SUPABASE_JWT_SECRET.
"""

import asyncio
from dataclasses import dataclass, field

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app import config

_jwks = jwt.PyJWKClient(f"{config.SUPABASE_URL}/auth/v1/.well-known/jwks.json", cache_keys=True) if config.SUPABASE_URL else None
_bearer = HTTPBearer(auto_error=False)


@dataclass
class User:
    id: str
    email: str | None
    metadata: dict = field(default_factory=dict)  # Supabase user_metadata (full_name, avatar_url, ...)


class AuthError(Exception):
    pass


def _decode(token: str) -> dict:
    try:
        alg = jwt.get_unverified_header(token).get("alg")
        if alg == "HS256":
            if not config.SUPABASE_JWT_SECRET:
                raise AuthError("HS256 token but SUPABASE_JWT_SECRET is not set")
            key = config.SUPABASE_JWT_SECRET
        else:
            if _jwks is None:
                raise AuthError("SUPABASE_URL is not set")
            key = _jwks.get_signing_key_from_jwt(token).key
        return jwt.decode(token, key, algorithms=[alg], audience="authenticated")
    except jwt.PyJWTError as e:
        raise AuthError(str(e)) from e


async def verify_token(token: str) -> User:
    # JWKS lookup may do a blocking HTTP fetch on first use / key rotation.
    claims = await asyncio.to_thread(_decode, token)
    if not claims.get("sub"):
        raise AuthError("token has no subject")
    return User(id=claims["sub"], email=claims.get("email"), metadata=claims.get("user_metadata") or {})


async def current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        return await verify_token(creds.credentials)
    except AuthError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {e}") from e

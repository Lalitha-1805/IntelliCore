import pytest
from httpx import AsyncClient, ASGITransport
from main import app
import os

@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Enterprise AI KMS Online", "version": "v8.1"}

@pytest.mark.asyncio
async def test_get_documents():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_auth_login_fail():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/auth/login", json={
            "email": "wrong@company.com",
            "password": "wrongpassword"
        })
    assert response.status_code == 401


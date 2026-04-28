import uvicorn
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api import router as api_router
from logger import logger

app = FastAPI(title="Enterprise AI HR KMS")

# Configure CORS for React UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start_time
    logger.info(f"Request: {request.method} {request.url.path} | Status: {response.status_code} | Duration: {duration:.4f}s")
    return response

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "Enterprise AI KMS Online", "version": "v8.1"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)


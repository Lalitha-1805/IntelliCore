import logging
import sys
import time
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("IntelliCore")

def trace_performance(func):
    """Decorator to trace performance of functions."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        duration = end_time - start_time
        logger.info(f"Performance: {func.__name__} took {duration:.4f} seconds")
        return result
    return wrapper

def log_event(event_type, details):
    """Log specific business events."""
    logger.info(f"Event: {event_type} | Details: {details}")

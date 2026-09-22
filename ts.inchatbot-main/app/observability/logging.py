import time
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("chatbot")

def log_latency(operation_name: str, start_time: float):
    elapsed = (time.time() - start_time) * 1000
    logger.info(f"{operation_name} latency: {elapsed:.2f} ms")

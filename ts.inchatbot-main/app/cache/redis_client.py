import redis
from app.config import REDIS_URL

class CacheClient:
    def __init__(self):
        try:
            self.r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
            self.r.ping() # test connection
            self.connected = True
        except Exception as e:
            print(f"Redis connection failed: {e}. Running without cache.")
            self.connected = False
        
    def get(self, key: str):
        if not self.connected: return None
        try:
            return self.r.get(key)
        except:
            return None
        
    def set(self, key: str, value: str, ttl: int = 3600):
        if not self.connected: return
        try:
            self.r.setex(key, ttl, value)
        except:
            pass

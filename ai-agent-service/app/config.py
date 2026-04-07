import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


def _get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

# ====== LLM CONFIG ======
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-8b-8192"
ENABLE_RERANKER = _get_bool_env("ENABLE_RERANKER", False)
RERANK_TOP_K = int(os.getenv("RERANK_TOP_K", "8"))
ENABLE_MEMORY_SUMMARY = _get_bool_env("ENABLE_MEMORY_SUMMARY", False)
SUMMARY_TIMEOUT_S = float(os.getenv("SUMMARY_TIMEOUT_S", "3.0"))

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment")

# ====== EMBEDDINGS CONFIG ======
# Environment-based embedding selection
USE_LOCAL_EMBEDDING = _get_bool_env("USE_LOCAL_EMBEDDING", False)  # Default: Cohere API
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COHERE_MODEL = os.getenv("COHERE_MODEL", "embed-v4.0")
HF_TOKEN = os.getenv('HF_TOKEN')  # Only needed if USE_LOCAL_EMBEDDING=true

# Validate embedding configuration
if not USE_LOCAL_EMBEDDING and not COHERE_API_KEY:
    raise RuntimeError("COHERE_API_KEY not found in environment (required for production embeddings)")

if USE_LOCAL_EMBEDDING and not HF_TOKEN:
    print("⚠️ HF_TOKEN not set (required for local sentence-transformers embeddings)")

# ====== TWILIO CONFIG ======
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

# Optional: fail fast only if WhatsApp is required
if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER]):
    print("⚠️ Twilio credentials not fully set (WhatsApp features disabled)")

# ====== MONGODB CONFIG ======
# env var names differ between deploy environments, so we accept both.
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME") or os.getenv("MONGO_DB_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGODB_URI (or MONGO_URI) not found in environment")

if not DB_NAME:
    raise RuntimeError("DB_NAME (or MONGO_DB_NAME) not found in environment")

_mongo_client = None
_mongo_db = None


def get_mongo_client():
    global _mongo_client

    if _mongo_client is None:
        _mongo_client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connect=False,
        )

    return _mongo_client


def get_mongo_db():
    global _mongo_db

    if _mongo_db is None:
        _mongo_db = get_mongo_client()[DB_NAME]

    return _mongo_db


class LazyMongoDatabase:
    def __getitem__(self, name):
        return get_mongo_db()[name]

    def __getattr__(self, name):
        return getattr(get_mongo_db(), name)


mongo_db = LazyMongoDatabase()

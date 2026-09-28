from pymongo import MongoClient

from app.core.config import settings


client = MongoClient(
    settings.MONGO_URI
)

db = client[
    settings.MONGO_DB_NAME
]

def test_connection():

    client.admin.command("ping")

    return True

users_collection = db["users"]

documents_collection = db["documents"]

conversations_collection = db["conversations"]

messages_collection = db["messages"]

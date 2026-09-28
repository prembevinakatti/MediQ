from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import (
    conversations_collection,
    messages_collection,
)


def get_conversation_messages(
    conversation_id: str,
    limit: int = 10,
):
    if not ObjectId.is_valid(conversation_id):
        return []

    messages = messages_collection.find(
        {
            "conversation_id": ObjectId(
                conversation_id
            )
        }
    ).sort(
        "created_at",
        1
    ).limit(limit)

    return list(messages)

    
def format_conversation_history(
    messages: list,
) -> str:

    history = []

    for message in messages:

        history.append(
            f"{message['role'].upper()}: "
            f"{message['content']}"
        )

    return "\n".join(history)


def create_conversation(user_id: str):

    conversation = {
        "user_id": ObjectId(user_id),
        "title": "New conversation",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = conversations_collection.insert_one(
        conversation
    )

    return str(result.inserted_id)


def save_message(
    conversation_id: str,
    role: str,
    content: str,
    sources: list | None = None,
):

    message = {
        "conversation_id": ObjectId(conversation_id),
        "role": role,
        "content": content,
        "sources": sources or [],
        "created_at": datetime.now(timezone.utc),
    }

    result = messages_collection.insert_one(message)

    return str(result.inserted_id)


def get_user_conversation(
    conversation_id: str,
    user_id: str,
):
    if not ObjectId.is_valid(conversation_id) or not ObjectId.is_valid(user_id):
        return None

    return conversations_collection.find_one(
        {
            "_id": ObjectId(conversation_id),
            "user_id": ObjectId(user_id),
        }
    )

def get_user_conversations(
    user_id: str,
):
    if not ObjectId.is_valid(user_id):
        return []

    conversations = conversations_collection.find(
        {
            "user_id": ObjectId(user_id)
        }
    ).sort(
        "updated_at",
        -1
    )

    return list(conversations)
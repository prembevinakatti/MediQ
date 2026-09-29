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


def extract_clinical_title(question: str) -> str:
    cleaned = question.strip().rstrip("?.! ")
    if not cleaned:
        return "Clinical Consultation"

    lower = cleaned.lower()

    # Filter out conversational greetings
    greetings = {"hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings", "test", "help"}
    if lower in greetings or len(lower) <= 3:
        return "Clinical Consultation"
    prefixes = [
        "can you please tell me what are the symptoms of",
        "can you tell me what are the symptoms of",
        "what are the common symptoms of",
        "what are the clinical symptoms of",
        "what are the symptoms of",
        "what are the signs and symptoms of",
        "what are the diagnostic criteria for",
        "what is the recommended treatment for",
        "what is the standard treatment for",
        "what is the clinical management of",
        "what is the mechanism of action of",
        "what are the contraindications for",
        "what are the contraindications of",
        "what is the renal dosage for",
        "what is the dosage of",
        "what are the side effects of",
        "what is the difference between",
        "can you explain the mechanism of",
        "can you explain",
        "tell me about",
        "summarize the findings of",
        "summarize",
        "explain",
        "what are the",
        "what is the",
        "what is",
        "what are",
        "how to treat",
        "how do you treat",
        "how does",
        "why does",
    ]
    matched = False
    for p in prefixes:
        if lower.startswith(p):
            remainder = cleaned[len(p):].strip(" :,-?")
            if remainder:
                if "symptom" in p:
                    cleaned = f"{remainder.capitalize()} Symptoms"
                elif "treatment" in p or "treat" in p:
                    cleaned = f"{remainder.capitalize()} Treatment"
                elif "contraindication" in p:
                    cleaned = f"{remainder.capitalize()} Contraindications"
                elif "dosage" in p:
                    cleaned = f"{remainder.capitalize()} Dosage"
                elif "difference" in p:
                    cleaned = f"{remainder.capitalize()} Comparison"
                else:
                    cleaned = remainder.capitalize()
                matched = True
                break

    if not matched:
        cleaned = cleaned[0].upper() + cleaned[1:] if len(cleaned) > 1 else cleaned.upper()

    words = cleaned.split()
    if len(words) > 6:
        cleaned = " ".join(words[:6])
    if len(cleaned) > 42:
        cleaned = cleaned[:39].rstrip() + "..."

    return cleaned if cleaned else "Clinical Consultation"


def update_conversation_title(conversation_id: str, title: str):
    if not ObjectId.is_valid(conversation_id):
        return
    conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$set": {
                "title": title,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )


def create_conversation(user_id: str, title: str | None = None):
    conversation = {
        "user_id": ObjectId(user_id),
        "title": title or "New consultation",
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

    conversations = list(
        conversations_collection.find(
            {
                "user_id": ObjectId(user_id)
            }
        ).sort(
            "updated_at",
            -1
        )
    )

    for c in conversations:
        if c.get("title") in ["New conversation", "New consultation", None]:
            first_msg = messages_collection.find_one(
                {"conversation_id": c["_id"], "role": "user"},
                sort=[("created_at", 1)],
            )
            if first_msg and first_msg.get("content"):
                derived_title = extract_clinical_title(first_msg["content"])
                conversations_collection.update_one(
                    {"_id": c["_id"]},
                    {"$set": {"title": derived_title}},
                )
                c["title"] = derived_title

    return conversations
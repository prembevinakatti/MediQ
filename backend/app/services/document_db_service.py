from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import documents_collection


def save_document(
    user_id: str,
    document_name: str,
    pages: int,
    chunks: int,
):
    document = {
        "user_id": ObjectId(user_id),
        "document_name": document_name,
        "pages": pages,
        "chunks": chunks,
        "created_at": datetime.now(timezone.utc),
    }

    result = documents_collection.insert_one(document)

    return {
        "id": str(result.inserted_id),
        "document_name": document_name,
        "pages": pages,
        "chunks": chunks,
    }


def get_user_documents(user_id: str):

    documents = documents_collection.find(
        {
            "user_id": ObjectId(user_id)
        }
    ).sort(
        "created_at",
        -1
    )

    return list(documents)
import  shutil
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
)
from fastapi import Depends

from app.core.security import get_current_user

from app.services.document_service import (
    process_document,
)

from app.services.document_db_service import (
    get_user_documents,
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_DIR = Path("data/uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is required",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are allowed.",
        )

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer :

        shutil.copyfileobj(
            file.file,
            buffer
        )

    user_id = str(current_user["_id"])

    result = process_document(
        pdf_path=str(file_path),
        user_id=user_id,
    )

    return {
        "message" : "Document processed successfully",
        "data" : result
    }


@router.get("/")
def list_documents(
    current_user=Depends(get_current_user),
):

    user_id = str(current_user["_id"])

    documents = get_user_documents(
        user_id
    )

    return [
        {
            "id": str(document["_id"]),
            "document_name": document[
                "document_name"
            ],
            "pages": document["pages"],
            "chunks": document["chunks"],
            "created_at": document[
                "created_at"
            ],
        }
        for document in documents
    ]
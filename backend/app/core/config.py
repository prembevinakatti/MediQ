from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    GEMINI_API_KEY: str
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    GEMINI_EMBEDDING_DIMENSION: int = 768
    GEMINI_LLM_MODEL: str = "gemini-2.0-flash"


    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "medical-rag"

    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 120

    MONGODB_URI: str  | None = None
    MONGODB_DATABASE: str = "medical_rag"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()
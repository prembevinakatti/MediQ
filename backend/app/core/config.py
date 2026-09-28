from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    GEMINI_API_KEY: str
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    GEMINI_EMBEDDING_DIMENSION: int = 768
    GEMINI_LLM_MODEL: str = "gemini-3-flash-preview"


    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "medical-rag"

    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 120

    MONGO_URI: str  | None = None
    MONGO_DB_NAME: str = "medical_rag"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()
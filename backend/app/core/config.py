"""Application configuration using Pydantic Settings"""

from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "LearnFi"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str

    # API
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "RS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # File Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None

    # Blockchain
    ALCHEMY_API_KEY: str
    BASE_SEPOLIA_RPC_URL: str
    BASE_MAINNET_RPC_URL: str
    ETHEREUM_RPC_URL: str

    # Contract Addresses
    LEARN_TOKEN_ADDRESS: Optional[str] = None
    BADGE_NFT_ADDRESS: Optional[str] = None
    STAKING_POOL_ADDRESS: Optional[str] = None
    NFT_STAKING_POOL_ADDRESS: Optional[str] = None

    # Admin Wallet
    ADMIN_PRIVATE_KEY: Optional[str] = None
    ADMIN_WALLET_ADDRESS: Optional[str] = None

    # Email
    EMAIL_ENABLED: bool = False
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@learnfi.com"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    AUTH_RATE_LIMIT_PER_MINUTE: int = 5

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"

    # Feature Flags
    ENABLE_AUTO_VERIFICATION: bool = True
    ENABLE_NFT_MINTING: bool = False
    ENABLE_STAKING: bool = False
    ENABLE_EMAIL_NOTIFICATIONS: bool = False


# Create settings instance
settings = Settings()

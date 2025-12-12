"""User endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.services.user_service import UserService
from app.schemas.user import UserResponse, UserUpdate, UserPublic
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get current authenticated user profile.

    Returns complete user information including:
    - Profile details
    - Total XP
    - Role
    - Account creation date
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update current user's profile.

    Updatable fields:
    - username
    - email
    - bio
    - profile_picture_url
    """
    user_service = UserService(db)

    try:
        updated_user = await user_service.update_user(current_user.id, user_update)
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{user_id}/xp")
async def get_user_xp_history(
    user_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's XP history.

    Returns a chronological list of XP changes:
    - XP earned from tasks
    - XP from course completions
    - Admin grants
    - Bounty rewards
    """
    user_service = UserService(db)
    xp_history = await user_service.get_user_xp_history(user_id, limit)

    return {
        "success": True,
        "data": [
            {
                "id": entry.id,
                "source_type": entry.source_type,
                "source_id": str(entry.source_id) if entry.source_id else None,
                "xp_change": entry.xp_change,
                "balance_after": entry.balance_after,
                "reason": entry.reason,
                "created_at": entry.created_at.isoformat(),
            }
            for entry in xp_history
        ],
    }


@router.get("/{user_id}/badges")
async def get_user_badges(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's earned badges.

    Returns all badges earned by the user including:
    - Badge details
    - Earn date
    - NFT minting status
    - Token ID (if minted)
    """
    user_service = UserService(db)
    badges = await user_service.get_user_badges(user_id)

    return {
        "success": True,
        "data": [
            {
                "id": str(badge.id),
                "badge_id": str(badge.badge_id),
                "earned_at": badge.earned_at.isoformat(),
                "nft_minted": badge.nft_minted,
                "nft_token_id": str(badge.nft_token_id) if badge.nft_token_id else None,
                "nft_tx_hash": badge.nft_tx_hash,
                "ipfs_metadata_uri": badge.ipfs_metadata_uri,
            }
            for badge in badges
        ],
    }


@router.get("/leaderboard", response_model=List[dict])
async def get_leaderboard(
    limit: int = 100,
    offset: int = 0,
    time_period: str = "all_time",
    db: AsyncSession = Depends(get_db),
):
    """
    Get platform leaderboard.

    Query parameters:
    - limit: Number of users to return (default: 100)
    - offset: Pagination offset (default: 0)
    - time_period: 'all_time', 'weekly', 'monthly' (default: all_time)

    Returns ranked list of users with:
    - Rank
    - User info (username, wallet, profile pic)
    - Total XP
    """
    user_service = UserService(db)
    leaderboard = await user_service.get_leaderboard(limit, offset, time_period)

    return [
        {
            "rank": entry["rank"],
            "user": {
                "id": str(entry["user"].id),
                "wallet_address": entry["user"].wallet_address,
                "username": entry["user"].username,
                "profile_picture_url": entry["user"].profile_picture_url,
            },
            "xp_total": entry["xp_total"],
        }
        for entry in leaderboard
    ]

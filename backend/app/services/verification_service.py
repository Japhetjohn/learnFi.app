"""Verification service for auto-verifying task submissions"""

from typing import Optional
from app.models.task import Task, Submission, TaskType


class VerificationService:
    """Service for auto-verifying task submissions"""

    def __init__(self):
        pass

    async def verify_submission(self, submission: Submission, task: Task) -> tuple[bool, Optional[str]]:
        """
        Verify submission based on task type and rules.

        Returns:
            (is_valid, error_message)
        """
        rules = task.verification_rules or {}

        try:
            if task.task_type == TaskType.TRANSACTION_PROOF:
                return await self._verify_transaction(submission, rules)

            elif task.task_type == TaskType.LINK_SUBMISSION:
                return await self._verify_link(submission, rules)

            elif task.task_type == TaskType.TEXT_SUBMISSION:
                return await self._verify_text(submission, rules)

            elif task.task_type == TaskType.QUIZ:
                return await self._verify_quiz(submission, rules)

            elif task.task_type == TaskType.FILE_UPLOAD:
                return await self._verify_file(submission, rules)

            return False, "Unsupported task type for auto-verification"

        except Exception as e:
            return False, f"Verification failed: {str(e)}"

    async def _verify_transaction(self, submission: Submission, rules: dict) -> tuple[bool, Optional[str]]:
        """Verify blockchain transaction"""
        if not submission.transaction_hash:
            return False, "Transaction hash is required"

        # Check format
        if not submission.transaction_hash.startswith("0x"):
            return False, "Invalid transaction hash format"

        if len(submission.transaction_hash) != 66:
            return False, "Invalid transaction hash length"

        # Check required chain if specified
        required_chain = rules.get("chain_id")
        if required_chain:
            # TODO: Verify transaction on specific chain
            pass

        # Check minimum value if specified
        min_value = rules.get("min_value")
        if min_value:
            # TODO: Verify transaction value
            pass

        return True, None

    async def _verify_link(self, submission: Submission, rules: dict) -> tuple[bool, Optional[str]]:
        """Verify submitted link"""
        if not submission.links or len(submission.links) == 0:
            return False, "At least one link is required"

        # Check required domain
        required_domain = rules.get("required_domain")
        if required_domain:
            has_domain = any(required_domain in link for link in submission.links)
            if not has_domain:
                return False, f"Link must be from domain: {required_domain}"

        # Check URL format
        for link in submission.links:
            if not link.startswith(("http://", "https://")):
                return False, f"Invalid URL format: {link}"

        return True, None

    async def _verify_text(self, submission: Submission, rules: dict) -> tuple[bool, Optional[str]]:
        """Verify text submission contains required keywords"""
        if not submission.submission_text:
            return False, "Text submission is required"

        text_lower = submission.submission_text.lower()

        # Check minimum length
        min_length = rules.get("min_length", 0)
        if len(submission.submission_text) < min_length:
            return False, f"Text must be at least {min_length} characters"

        # Check required keywords
        required_keywords = rules.get("required_keywords", [])
        if required_keywords:
            missing_keywords = [
                kw for kw in required_keywords if kw.lower() not in text_lower
            ]
            if missing_keywords:
                return False, f"Missing required keywords: {', '.join(missing_keywords)}"

        # Check forbidden keywords
        forbidden_keywords = rules.get("forbidden_keywords", [])
        if forbidden_keywords:
            found_forbidden = [
                kw for kw in forbidden_keywords if kw.lower() in text_lower
            ]
            if found_forbidden:
                return False, f"Contains forbidden keywords: {', '.join(found_forbidden)}"

        return True, None

    async def _verify_quiz(self, submission: Submission, rules: dict) -> tuple[bool, Optional[str]]:
        """Verify quiz answers"""
        if not submission.submission_text:
            return False, "Quiz answers are required"

        # TODO: Implement proper quiz verification
        # Expected format: JSON with question_id: answer pairs
        # Compare with correct_answers in rules

        correct_answers = rules.get("correct_answers", {})
        if not correct_answers:
            return False, "Quiz has no correct answers configured"

        # For now, just check that submission is not empty
        return True, None

    async def _verify_file(self, submission: Submission, rules: dict) -> tuple[bool, Optional[str]]:
        """Verify file upload"""
        if not submission.files:
            return False, "File upload is required"

        # Check file count
        min_files = rules.get("min_files", 1)
        max_files = rules.get("max_files", 10)

        file_count = len(submission.files.get("files", []))
        if file_count < min_files:
            return False, f"At least {min_files} file(s) required"
        if file_count > max_files:
            return False, f"Maximum {max_files} file(s) allowed"

        # Check file types if specified
        allowed_types = rules.get("allowed_types", [])
        if allowed_types:
            for file_info in submission.files.get("files", []):
                file_ext = file_info.get("name", "").split(".")[-1].lower()
                if file_ext not in allowed_types:
                    return False, f"File type .{file_ext} not allowed. Allowed: {', '.join(allowed_types)}"

        return True, None

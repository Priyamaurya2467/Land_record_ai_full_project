import hashlib
from pathlib import Path


CHUNK_SIZE = 1024 * 1024  # 1 MB


def sha256_file(path: str) -> str:
    """
    Calculate SHA-256 hash of a file.

    Used for:
    - duplicate document detection
    - file integrity verification
    - audit/reference tracking
    """

    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    if not file_path.is_file():
        raise ValueError(
            f"Path is not a file: {file_path}"
        )

    hasher = hashlib.sha256()

    with file_path.open("rb") as file:

        while True:
            chunk = file.read(CHUNK_SIZE)

            if not chunk:
                break

            hasher.update(chunk)

    return hasher.hexdigest()


def sha256_bytes(data: bytes) -> str:
    """
    Calculate SHA-256 hash directly from bytes.

    Useful when a file is already loaded in memory.
    """

    return hashlib.sha256(data).hexdigest()


def verify_file_hash(
    path: str,
    expected_hash: str,
) -> bool:
    """
    Verify whether a file matches an expected SHA-256 hash.
    """

    actual_hash = sha256_file(path)

    return actual_hash.lower() == expected_hash.lower()
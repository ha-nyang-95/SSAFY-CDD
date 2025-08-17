from pydantic import BaseModel, field_validator

class InferenceRequest(BaseModel):
    """API 요청 본문의 유효성을 검사"""
    file_name: str

    @field_validator('file_name')
    def validate_file_name(cls, v: str) -> str:
        if not v or not v.endswith('/'):
            raise ValueError("file_name must not be empty and must end with a '/'.")
        return v

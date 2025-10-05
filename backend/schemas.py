from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, EmailStr


DEFAULT_PROJECT_IMAGE_URL = "/volunteer-project.jpg"


class ProjectTypeEnum(str, Enum):
    ONLINE = "Online"
    ONSITE = "Onsite"
    HYBRID = "Hybrid"


class ApplicationStatusEnum(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class VolunteerStatusEnum(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class NotificationTypeEnum(str, Enum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    PROJECT_MATCH = "project_match"
    VOLUNTEER_JOINED = "volunteer_joined"
    EVENT_REMINDER = "event_reminder"


class UserBase(BaseModel):
    name: str
    email: str
    phonenumber: str = Field(..., max_length=32, description="Phone number (max 32 characters)")
    city: Optional[str] = None
    country: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    story: Optional[str] = None

    @field_validator("skills", "interests", mode="before")
    @classmethod
    def ensure_list(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []


class UserCreate(UserBase):
    password: str = Field(..., max_length=200, description="Password (max 200 characters)")


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phonenumber: Optional[str] = Field(None, max_length=32, description="Phone number (max 32 characters)")
    city: Optional[str] = None
    country: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    story: Optional[str] = None

    @field_validator("skills", "interests", mode="before")
    @classmethod
    def ensure_optional_list(cls, value):
        if value is None:
            return None
        if isinstance(value, list):
            return value
        return []


class User(UserBase):
    id: str = Field(..., min_length=1, max_length=36, description="User identifier (UUID or short id)")
    profile_image_url: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class ProjectEventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: date
    time: str = Field(..., max_length=16)
    slots_available: int = Field(default=0, ge=0)


class ProjectEvent(ProjectEventCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=255)
    short_description: str = Field(..., max_length=512)
    detailed_description: str
    category: str = Field(..., max_length=128)
    project_type: ProjectTypeEnum
    location: Optional[str] = Field(default=None, max_length=255)
    image_url: Optional[str] = Field(default=None, max_length=512)
    skills_needed: List[str] = Field(default_factory=list)
    start_date: date
    end_date: date

    @field_validator("skills_needed", mode="before")
    @classmethod
    def ensure_skills_list(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []

    @field_validator("image_url", mode="before")
    @classmethod
    def default_image_if_missing(cls, value):
        if value is None:
            return DEFAULT_PROJECT_IMAGE_URL
        if isinstance(value, str) and value.strip() == "":
            return DEFAULT_PROJECT_IMAGE_URL
        return value


class ProjectCreate(ProjectBase):
    events: List[ProjectEventCreate] = Field(default_factory=list)


class ProjectOwnerSummary(BaseModel):
    id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phonenumber: Optional[str] = Field(default=None, max_length=32)

    class Config:
        from_attributes = True


class Project(ProjectBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    events: List[ProjectEvent] = Field(default_factory=list)
    owner: Optional[ProjectOwnerSummary] = None

    class Config:
        from_attributes = True


# -----------------------------
# Project Application Schemas
# -----------------------------

class ProjectApplicationBase(BaseModel):
    volunteer_name: str = Field(..., max_length=255)
    volunteer_email: EmailStr
    volunteer_phone: Optional[str] = Field(default=None, max_length=32)
    skills: List[str] = Field(default_factory=list)
    message: Optional[str] = None

    @field_validator("skills", mode="before")
    @classmethod
    def ensure_skills_list(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []


class ProjectApplicationCreate(ProjectApplicationBase):
    project_id: str
    volunteer_id: Optional[str] = None


class ProjectApplication(ProjectApplicationBase):
    id: str
    project_id: str
    volunteer_id: Optional[str] = None
    status: ApplicationStatusEnum = ApplicationStatusEnum.PENDING
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum


# Lightweight request for authenticated volunteers applying to a project
class ProjectApplicationApply(BaseModel):
    skills: List[str] = Field(default_factory=list)
    message: Optional[str] = None


# -----------------------------
# Project Volunteer Schemas
# -----------------------------

class ProjectVolunteer(BaseModel):
    id: str
    project_id: str
    volunteer_id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    skills: List[str] = Field(default_factory=list)
    status: VolunteerStatusEnum
    joined_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# Analytics Schemas
# -----------------------------


class AnalyticsOverview(BaseModel):
    total_projects: int = 0
    total_events: int = 0
    total_volunteers: int = 0
    total_hours: int = 0
    total_applications: int = 0
    total_impact: int = 0


class AnalyticsCategoryMetric(BaseModel):
    name: str
    value: int


class AnalyticsSkillMetric(BaseModel):
    name: str
    value: int


class AnalyticsMonthlyHoursPoint(BaseModel):
    month: str
    hours: int


class AnalyticsApplicationStats(BaseModel):
    total: int = 0
    pending: int = 0
    accepted: int = 0
    rejected: int = 0
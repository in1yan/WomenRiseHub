from __future__ import annotations

import enum

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ProjectType(enum.Enum):
    ONLINE = "Online"
    ONSITE = "Onsite"
    HYBRID = "Hybrid"


class ApplicationStatus(enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class VolunteerStatus(enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class NotificationType(enum.Enum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    PROJECT_MATCH = "project_match"
    VOLUNTEER_JOINED = "volunteer_joined"
    EVENT_REMINDER = "event_reminder"


class Users(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phonenumber = Column(String(32), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    city = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)
    skills = Column(JSON, default=list)
    interests = Column(JSON, default=list)
    story = Column(Text, nullable=True)
    profile_image_url = Column(String(512), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("ProjectApplication", back_populates="volunteer", cascade="all, delete-orphan")
    volunteer_roles = relationship("ProjectVolunteer", back_populates="volunteer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    short_description = Column(String(512), nullable=False)
    detailed_description = Column(Text, nullable=False)
    category = Column(String(128), nullable=False, index=True)
    project_type = Column(SAEnum(ProjectType), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    image_url = Column(String(512), nullable=True)
    skills_needed = Column(JSON, default=list)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("Users", back_populates="projects")
    events = relationship("ProjectEvent", back_populates="project", cascade="all, delete-orphan")
    applications = relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan")
    volunteers = relationship("ProjectVolunteer", back_populates="project", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="project", cascade="all, delete-orphan")


class ProjectEvent(Base):
    __tablename__ = "project_events"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(String(16), nullable=False)
    slots_available = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", back_populates="events")


class ProjectApplication(Base):
    __tablename__ = "project_applications"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    volunteer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    volunteer_name = Column(String(255), nullable=False)
    volunteer_email = Column(String(255), nullable=False)
    volunteer_phone = Column(String(32), nullable=True)
    skills = Column(JSON, default=list)
    message = Column(Text, nullable=True)
    status = Column(SAEnum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", back_populates="applications")
    volunteer = relationship("Users", back_populates="applications")


class ProjectVolunteer(Base):
    __tablename__ = "project_volunteers"

    id = Column(String(36), primary_key=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    volunteer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(128), nullable=True)
    status = Column(SAEnum(VolunteerStatus), nullable=False, default=VolunteerStatus.ACTIVE)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    hours_contributed = Column(Integer, nullable=True)

    project = relationship("Project", back_populates="volunteers")
    volunteer = relationship("Users", back_populates="volunteer_roles")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(SAEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    project_title = Column(String(255), nullable=True)
    read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("Users", back_populates="notifications")
    project = relationship("Project", back_populates="notifications")

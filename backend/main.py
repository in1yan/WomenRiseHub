import os
import random
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from auth import authenticate_user, create_access_token, get_current_user
from database import Base, SessionLocal, engine
from models import Project as ProjectModel
from models import ProjectEvent as ProjectEventModel
from models import ProjectType, Users
from models import ProjectApplication as ProjectApplicationModel
from models import ApplicationStatus
from models import ProjectVolunteer as ProjectVolunteerModel
from models import VolunteerStatus
from schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectApplication as ProjectApplicationSchema,
    ProjectApplicationCreate,
    ProjectApplicationApply,
    ProjectApplicationStatusUpdate,
    ProjectVolunteer as ProjectVolunteerSchema,
    VolunteerStatusEnum,
    Token,
    User,
    UserCreate,
    UserLogin,
    UserUpdate,
    AnalyticsOverview,
    AnalyticsCategoryMetric,
    AnalyticsSkillMetric,
    AnalyticsMonthlyHoursPoint,
    AnalyticsApplicationStats,
)
from utils import hash_pwd

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_ROOT = BASE_DIR / "uploads"
PROJECT_IMAGE_DIR = UPLOAD_ROOT / "project_images"
PROJECT_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_PROJECT_IMAGE_URL = "/volunteer-project.jpg"

ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
}

CONTENT_TYPE_EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}

ALLOWED_IMAGE_EXTENSIONS = set(CONTENT_TYPE_EXTENSION_MAP.values())
MAX_IMAGE_SIZE_MB = 5
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024


def _validate_root_relative_path(path: str) -> str:
    parts = path.split("/")
    if ".." in parts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image URL path.")
    suffix = Path(path).suffix.lower()
    if suffix and suffix in ALLOWED_IMAGE_EXTENSIONS:
        return path
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported image path format.")

TOKEN_EXPIRATION = int(os.getenv("TOKEN_EXPIRATION"))

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


def _get_date_threshold(days: int) -> datetime:
    clamped_days = max(1, min(days, 365))
    return datetime.utcnow() - timedelta(days=clamped_days)


def generate_user_id(db: Session) -> str:
    for _ in range(1000):
        candidate = f"{random.randint(0, 999):03}"
        if not db.query(Users).filter(Users.id == candidate).first():
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate a unique user ID"
    )


def _resolve_image_extension(file: UploadFile) -> str:
    candidate = (Path(file.filename or "").suffix or "").lower()
    if candidate in ALLOWED_IMAGE_EXTENSIONS:
        return candidate

    content_type = (file.content_type or "").lower()
    mapped = CONTENT_TYPE_EXTENSION_MAP.get(content_type)
    if mapped:
        return mapped

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported image format. Please upload a JPEG, PNG, GIF, or WebP file.",
    )


def _normalize_image_url_for_storage(raw: str) -> str:
    cleaned = raw.strip()
    if not cleaned:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image URL cannot be empty.")

    lowered = cleaned.lower()
    if lowered.startswith("data:"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inline image data is not supported. Upload the image first and provide the returned URL.",
        )

    if cleaned == DEFAULT_PROJECT_IMAGE_URL:
        return cleaned

    # Allow absolute URLs that use http/https
    if lowered.startswith("http://") or lowered.startswith("https://"):
        return cleaned

    # Allow relative URLs that point to the uploads directory
    if cleaned.startswith("/uploads/project_images/"):
        parts = cleaned.split("/")
        if ".." in parts or "" in parts[1:-1]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image URL path.")
        return cleaned

    # Allow other root-relative static assets (e.g., frontend public directory)
    if cleaned.startswith("/"):
        return _validate_root_relative_path(cleaned)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid image URL. Upload the image first and provide the returned URL.",
    )

@app.get('/')
async def root():
    return {"message": "Hello World"}

@app.post('/login', response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(weeks=TOKEN_EXPIRATION)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get('/users/')
async def get_users(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)) -> List[User]:
    users = db.query(Users).all()
    return users 

@app.get('/me', response_model=User)
async def get_current_user_info(current_user: Users = Depends(get_current_user)):
    return current_user

@app.post('/create/user')
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Users).filter(Users.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = hash_pwd(user.password)
    new_user = Users(
        id=generate_user_id(db),
        name=user.name,
        email=user.email,
        hashed_password = hashed_pwd,
        phonenumber = user.phonenumber
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post('/projects/upload-image', status_code=status.HTTP_201_CREATED)
async def upload_project_image(
    file: UploadFile = File(...),
    current_user: Users = Depends(get_current_user),
):
    if file.content_type is None or file.content_type.lower() not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Allowed types: JPEG, PNG, GIF, WebP.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty.")
    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image is too large. Maximum size is {MAX_IMAGE_SIZE_MB}MB.",
        )

    extension = _resolve_image_extension(file)
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = PROJECT_IMAGE_DIR / filename

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
    finally:
        await file.close()

    relative_url = f"/uploads/project_images/{filename}"
    return {"image_url": relative_url}

@app.put('/update/user', response_model=User)
def update_user(updated_user: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if updated_user.name is not None:
        user.name = updated_user.name
    if updated_user.email is not None:
        user.email = updated_user.email
    if updated_user.phonenumber is not None:
        user.phonenumber = updated_user.phonenumber
    if updated_user.city is not None:
        user.city = updated_user.city
    if updated_user.country is not None:
        user.country = updated_user.country
    if updated_user.skills is not None:
        user.skills = updated_user.skills
    if updated_user.interests is not None:
        user.interests = updated_user.interests
    if updated_user.story is not None:
        user.story = updated_user.story 
    db.commit()
    db.refresh(user)
    return user

@app.post('/create/project', response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    details: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    if details.end_date < details.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be on or after the start date",
        )

    normalized_image_url = _normalize_image_url_for_storage(details.image_url)

    project = ProjectModel(
        id=str(uuid.uuid4()),
        owner_id=current_user.id,
        title=details.title,
        short_description=details.short_description,
        detailed_description=details.detailed_description,
        category=details.category,
        project_type=ProjectType(details.project_type.value),
        location=details.location,
        image_url=normalized_image_url,
        skills_needed=details.skills_needed,
        start_date=details.start_date,
        end_date=details.end_date,
    )

    for event_data in details.events:
        project.events.append(
            ProjectEventModel(
                id=str(uuid.uuid4()),
                name=event_data.name,
                description=event_data.description,
                date=event_data.date,
                time=event_data.time,
                slots_available=event_data.slots_available,
            )
        )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project
@app.get('/projects', response_model=List[ProjectSchema])
def get_projects(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    projects = (
        db.query(ProjectModel)
        .options(selectinload(ProjectModel.owner), selectinload(ProjectModel.events))
        .all()
    )
    return projects
@app.post('/projects/{project_id}/apply', response_model=ProjectApplicationSchema, status_code=status.HTTP_201_CREATED)
def apply_to_project(
    project_id: str,
    details: ProjectApplicationApply,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check for duplicate application by the same volunteer
    existing_application = db.query(ProjectApplicationModel).filter(
        ProjectApplicationModel.project_id == project_id,
        ProjectApplicationModel.volunteer_id == current_user.id
    ).first()
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this project"
        )
    
    application = ProjectApplicationModel(
        id=str(uuid.uuid4()),
        project_id=project_id,
        volunteer_id=current_user.id,
        volunteer_name=current_user.name or current_user.email,
        volunteer_email=current_user.email,
        volunteer_phone=current_user.phonenumber,
        skills=details.skills,
        message=details.message,
        status=ApplicationStatus.PENDING,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
@app.get('/projects/{project_id}/applications', response_model=List[ProjectApplicationSchema])
def get_project_applications(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view applications for this project"
        )
    
    applications = (
        db.query(ProjectApplicationModel)
        .filter(ProjectApplicationModel.project_id == project_id)
        .order_by(ProjectApplicationModel.applied_at.desc())
        .offset(max(skip, 0))
        .limit(max(min(limit, 200), 1))
        .all()
    )
    return applications


@app.get('/projects/{project_id}/volunteers', response_model=List[ProjectVolunteerSchema])
def list_project_volunteers(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view volunteers")

    volunteers = (
        db.query(ProjectVolunteerModel)
        .filter(ProjectVolunteerModel.project_id == project_id)
        .all()
    )

    # Enrich with user info where available
    result = []
    for v in volunteers:
        user = db.query(Users).filter(Users.id == v.volunteer_id).first()
        try:
            status_enum = VolunteerStatusEnum[v.status.name] if hasattr(v.status, "name") else VolunteerStatusEnum(v.status)
        except (KeyError, ValueError):
            status_enum = VolunteerStatusEnum.ACTIVE

        result.append(
            ProjectVolunteerSchema(
                id=v.id,
                project_id=v.project_id,
                volunteer_id=v.volunteer_id,
                name=user.name if user else None,
                email=user.email if user else None,
                skills=user.skills if user and user.skills else [],
                status=status_enum,
                joined_at=v.joined_at,
            )
        )
    return result


# -----------------------------
# Analytics Endpoints
# -----------------------------


def _volunteer_within_range(volunteer: ProjectVolunteerModel, *, threshold: datetime) -> bool:
    if volunteer.joined_at and volunteer.joined_at >= threshold:
        return True
    project = volunteer.project
    if project and project.created_at and project.created_at >= threshold:
        return True
    return False


@app.get('/analytics/overview', response_model=AnalyticsOverview)
def get_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    threshold = _get_date_threshold(days)
    threshold_date = threshold.date()

    project_query = (
        db.query(ProjectModel)
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectModel.created_at >= threshold)
    )
    total_projects = project_query.count()

    total_events = (
        db.query(ProjectEventModel)
        .join(ProjectModel, ProjectEventModel.project_id == ProjectModel.id)
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectEventModel.date >= threshold_date)
        .count()
    )

    volunteer_query = (
        db.query(ProjectVolunteerModel)
        .options(selectinload(ProjectVolunteerModel.project))
        .join(ProjectModel, ProjectVolunteerModel.project_id == ProjectModel.id)
        .filter(ProjectModel.owner_id == current_user.id)
    )
    volunteers = [v for v in volunteer_query.all() if _volunteer_within_range(v, threshold=threshold)]
    total_volunteers = len(volunteers)
    total_hours = sum((v.hours_contributed if v.hours_contributed is not None else 15) for v in volunteers)

    total_applications = (
        db.query(ProjectApplicationModel)
        .join(ProjectModel, ProjectApplicationModel.project_id == ProjectModel.id)
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectApplicationModel.applied_at >= threshold)
        .count()
    )

    total_impact = total_volunteers * 50

    return AnalyticsOverview(
        total_projects=total_projects,
        total_events=total_events,
        total_volunteers=total_volunteers,
        total_hours=total_hours,
        total_applications=total_applications,
        total_impact=total_impact,
    )


@app.get('/analytics/projects-by-category', response_model=List[AnalyticsCategoryMetric])
def get_projects_by_category(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    threshold = _get_date_threshold(days)

    category_counts = (
        db.query(ProjectModel.category, func.count(ProjectModel.id))
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectModel.created_at >= threshold)
        .group_by(ProjectModel.category)
        .all()
    )

    return [AnalyticsCategoryMetric(name=category or "Uncategorized", value=count) for category, count in category_counts]


@app.get('/analytics/skills-distribution', response_model=List[AnalyticsSkillMetric])
def get_skills_distribution(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    threshold = _get_date_threshold(days)

    projects = (
        db.query(ProjectModel)
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectModel.created_at >= threshold)
        .all()
    )

    skill_counter: Counter[str] = Counter()
    for project in projects:
        if not project.skills_needed:
            continue
        for skill in project.skills_needed:
            normalized = str(skill).strip()
            if normalized:
                skill_counter[normalized] += 1

    top_skills = skill_counter.most_common(5)
    return [AnalyticsSkillMetric(name=name, value=value) for name, value in top_skills]


@app.get('/analytics/monthly-hours', response_model=List[AnalyticsMonthlyHoursPoint])
def get_monthly_hours(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    threshold = _get_date_threshold(days)

    volunteers = (
        db.query(ProjectVolunteerModel)
        .options(selectinload(ProjectVolunteerModel.project))
        .join(ProjectModel, ProjectVolunteerModel.project_id == ProjectModel.id)
        .filter(ProjectModel.owner_id == current_user.id)
        .all()
    )

    monthly_hours: defaultdict[str, int] = defaultdict(int)
    for volunteer in volunteers:
        reference_date = volunteer.joined_at or (volunteer.project.created_at if volunteer.project else None)
        if not reference_date or reference_date < threshold:
            continue
        month_key = reference_date.strftime('%Y-%m')
        monthly_hours[month_key] += volunteer.hours_contributed if volunteer.hours_contributed is not None else 15

    sorted_points = sorted(monthly_hours.items())
    return [
        AnalyticsMonthlyHoursPoint(month=datetime.strptime(month, '%Y-%m').strftime('%b'), hours=hours)
        for month, hours in sorted_points
    ]


@app.get('/analytics/application-stats', response_model=AnalyticsApplicationStats)
def get_application_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    threshold = _get_date_threshold(days)

    base_query = (
        db.query(ProjectApplicationModel)
        .join(ProjectModel, ProjectApplicationModel.project_id == ProjectModel.id)
        .filter(ProjectModel.owner_id == current_user.id)
        .filter(ProjectApplicationModel.applied_at >= threshold)
    )

    total = base_query.count()
    status_counts = dict(
        base_query
        .with_entities(ProjectApplicationModel.status, func.count(ProjectApplicationModel.id))
        .group_by(ProjectApplicationModel.status)
        .all()
    )

    return AnalyticsApplicationStats(
        total=total,
        pending=status_counts.get(ApplicationStatus.PENDING, 0),
        accepted=status_counts.get(ApplicationStatus.ACCEPTED, 0),
        rejected=status_counts.get(ApplicationStatus.REJECTED, 0),
    )


# -----------------------------
# Application Status Updates
# -----------------------------

def _update_application_status_impl(
    *,
    db: Session,
    current_user: Users,
    project_id: str,
    application_id: str,
    update: ProjectApplicationStatusUpdate,
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update applications")

    application = (
        db.query(ProjectApplicationModel)
        .filter(
            ProjectApplicationModel.id == application_id,
            ProjectApplicationModel.project_id == project_id,
        )
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    try:
        new_status = ApplicationStatus[update.status.name]
    except KeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")

    application.status = new_status

    # If accepted, ensure a ProjectVolunteer record exists
    if new_status == ApplicationStatus.ACCEPTED and application.volunteer_id:
        existing = (
            db.query(ProjectVolunteerModel)
            .filter(
                ProjectVolunteerModel.project_id == project_id,
                ProjectVolunteerModel.volunteer_id == application.volunteer_id,
            )
            .first()
        )
        if not existing:
            pv = ProjectVolunteerModel(
                id=str(uuid.uuid4()),
                project_id=project_id,
                volunteer_id=application.volunteer_id,
                role=None,
                status=VolunteerStatus.ACTIVE,
            )
            db.add(pv)

    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@app.patch('/projects/{project_id}/applications/{application_id}/status', response_model=ProjectApplicationSchema)
def update_application_status_patch(
    project_id: str,
    application_id: str,
    update: ProjectApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    return _update_application_status_impl(
        db=db,
        current_user=current_user,
        project_id=project_id,
        application_id=application_id,
        update=update,
    )


@app.post('/projects/{project_id}/applications/{application_id}/status', response_model=ProjectApplicationSchema)
def update_application_status_post(
    project_id: str,
    application_id: str,
    update: ProjectApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    return _update_application_status_impl(
        db=db,
        current_user=current_user,
        project_id=project_id,
        application_id=application_id,
        update=update,
    )


@app.patch('/applications/{application_id}/status', response_model=ProjectApplicationSchema)
def update_application_status_by_id_patch(
    application_id: str,
    update: ProjectApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    application = db.query(ProjectApplicationModel).filter(ProjectApplicationModel.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return _update_application_status_impl(
        db=db,
        current_user=current_user,
        project_id=application.project_id,
        application_id=application_id,
        update=update,
    )


@app.post('/applications/{application_id}/status', response_model=ProjectApplicationSchema)
def update_application_status_by_id_post(
    application_id: str,
    update: ProjectApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    application = db.query(ProjectApplicationModel).filter(ProjectApplicationModel.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return _update_application_status_impl(
        db=db,
        current_user=current_user,
        project_id=application.project_id,
        application_id=application_id,
        update=update,
    )
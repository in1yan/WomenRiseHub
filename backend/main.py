import os
import random
import uuid
from datetime import timedelta
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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
)
from utils import hash_pwd

TOKEN_EXPIRATION = int(os.getenv("TOKEN_EXPIRATION"))

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


def generate_user_id(db: Session) -> str:
    for _ in range(1000):
        candidate = f"{random.randint(0, 999):03}"
        if not db.query(Users).filter(Users.id == candidate).first():
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate a unique user ID"
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

    project = ProjectModel(
        id=str(uuid.uuid4()),
        owner_id=current_user.id,
        title=details.title,
        short_description=details.short_description,
        detailed_description=details.detailed_description,
        category=details.category,
        project_type=ProjectType(details.project_type.value),
        location=details.location,
        image_url=details.image_url,
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
    projects = db.query(ProjectModel).all()
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
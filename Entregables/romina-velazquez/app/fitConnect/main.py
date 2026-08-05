from fastapi import FastAPI, Depends, Request, Form, Response, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Optional

# Configuración de Base de Datos local (SQLite)
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# Modelos de Datos (Tablas)
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    password: str

class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    name: str
    sets: int
    reps: int
    weight: float

# App FastAPI y configuración de plantillas HTML
app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# 1. Página de Bienvenida / Landing principal
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 2. Vista de Registro (GET) y Proceso (POST)
@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register", response_class=RedirectResponse)
def register_user(username: str = Form(...), email: str = Form(...), password: str = Form(...), session: Session = Depends(get_session)):
    new_user = User(username=username, email=email, password=password)
    session.add(new_user)
    session.commit()
    return RedirectResponse(url="/login", status_code=303)

# 3. Vista de Login (GET) y Proceso (POST)
@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login", response_class=RedirectResponse)
def login_user(username: str = Form(...), password: str = Form(...), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == username, User.password == password)
    user = session.exec(statement).first()
    
    if user:
        resp = RedirectResponse(url="/dashboard", status_code=303)
        resp.set_cookie(key="user_id", value=str(user.id))
        resp.set_cookie(key="username", value=user.username)
        return resp
    else:
        return RedirectResponse(url="/login?error=1", status_code=303)

# 4. Panel principal (Dashboard de usuario logueado)
@app.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(request: Request, user_id: Optional[str] = Cookie(None), username: Optional[str] = Cookie(None), session: Session = Depends(get_session)):
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)
    
    exercises = session.exec(select(Exercise).where(Exercise.user_id == int(user_id))).all()
    users = session.exec(select(User)).all()  # <--- Agregamos esto para listar la comunidad
    routines = session.exec(select(Routine).where(Routine.user_id == int(user_id))).all()
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request, 
        "username": username, 
        "exercises": exercises,
        "users": users,
        "routines": routines
    })

# 5. Guardar Ejercicio
@app.post("/exercises", response_class=RedirectResponse)
def create_exercise(name: str = Form(...), sets: int = Form(...), reps: int = Form(...), weight: float = Form(...), user_id: Optional[str] = Cookie(None), session: Session = Depends(get_session)):
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)
    
    new_exercise = Exercise(user_id=int(user_id), name=name, sets=sets, reps=reps, weight=weight)
    session.add(new_exercise)
    session.commit()
    return RedirectResponse(url="/dashboard", status_code=303)

# 6. Logout
@app.get("/logout", response_class=RedirectResponse)
def logout():
    resp = RedirectResponse(url="/", status_code=303)
    resp.delete_cookie(key="user_id")
    resp.delete_cookie(key="username")
    return resp

# Nuevos Modelos en la Base de Datos
class Routine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    name: str          # Ej: "Rutina Volumen Hipertrofia"
    days_count: int    # Cantidad de días (ej. 3 o 5)
    start_date: str    # <--- Nueva fecha de inicio
    end_date: str      # <--- Nueva fecha de fin

class RoutineExercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    routine_id: int
    day_number: int    # Día al que pertenece (Ej: Día 1, Día 2)
    name: str          # Ej: Press de Banca
    sets: int
    reps: int
    weight: float

# Ruta para crear la rutina base
@app.post("/routines", response_class=RedirectResponse)
def create_routine(
    name: str = Form(...), 
    days_count: int = Form(...), 
    start_date: str = Form(...),  # <--- Recibir fecha de inicio
    end_date: str = Form(...),    # <--- Recibir fecha de fin
    user_id: Optional[str] = Cookie(None), 
    session: Session = Depends(get_session)
):
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)
    
    new_routine = Routine(
        user_id=int(user_id), 
        name=name, 
        days_count=days_count,
        start_date=start_date,
        end_date=end_date
    )
    session.add(new_routine)
    session.commit()
    session.refresh(new_routine)
    
    return RedirectResponse(url=f"/routines/{new_routine.id}/add-exercises", status_code=303)

# Ruta para ver el panel de detalles y agregar ejercicios por día
@app.get("/routines/{routine_id}/add-exercises", response_class=HTMLResponse)
def routine_builder_page(request: Request, routine_id: int, user_id: Optional[str] = Cookie(None), username: Optional[str] = Cookie(None), session: Session = Depends(get_session)):
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)
    
    routine = session.get(Routine, routine_id)
    exercises = session.exec(select(RoutineExercise).where(RoutineExercise.routine_id == routine_id)).all()
    
    return templates.TemplateResponse("routine_builder.html", {
        "request": request,
        "username": username,
        "routine": routine,
        "exercises": exercises
    })

# Ruta para guardar un ejercicio dentro de un día específico de la rutina
@app.post("/routines/{routine_id}/exercises", response_class=RedirectResponse)
def add_exercise_to_routine(routine_id: int, day_number: int = Form(...), name: str = Form(...), sets: int = Form(...), reps: int = Form(...), weight: float = Form(...), session: Session = Depends(get_session)):
    new_item = RoutineExercise(routine_id=routine_id, day_number=day_number, name=name, sets=sets, reps=reps, weight=weight)
    session.add(new_item)
    session.commit()
    return RedirectResponse(url=f"/routines/{routine_id}/add-exercises", status_code=303)
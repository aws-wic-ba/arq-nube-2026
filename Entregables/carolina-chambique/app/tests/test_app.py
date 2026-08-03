import io
from pathlib import Path
from app import create_app

def make_client(tmp_path):
    app = create_app({"TESTING": True, "SECRET_KEY": "test", "DATABASE_URL": f"sqlite:///{tmp_path / 'test.db'}", "UPLOAD_FOLDER": str(tmp_path / "uploads")})
    return app.test_client()

def test_health(tmp_path):
    response = make_client(tmp_path).get("/health")
    assert response.status_code == 200
    assert response.json == {"database": "ok", "status": "ok"}

def test_upload_search_download_and_delete(tmp_path):
    client = make_client(tmp_path)
    response = client.post("/upload", data={"file": (io.BytesIO(b"plan cloud"), "plan.txt"), "owner": "Carolina", "category": "Proyectos", "description": "Arquitectura inicial"}, content_type="multipart/form-data", follow_redirects=True)
    assert response.status_code == 200 and b"plan.txt" in response.data
    assert b"Carolina" in client.get("/?q=Carolina").data
    assert client.get("/documents/1/download").data == b"plan cloud"
    assert client.post("/documents/1/delete", follow_redirects=True).status_code == 200
    assert not list((Path(tmp_path) / "uploads").iterdir())

def test_rejects_unsupported_extension(tmp_path):
    client = make_client(tmp_path)
    response = client.post("/upload", data={"file": (io.BytesIO(b"bad"), "script.exe"), "owner": "Carolina"}, content_type="multipart/form-data")
    assert response.status_code == 400

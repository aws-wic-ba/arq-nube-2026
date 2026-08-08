import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from app import app, db, Unit, Revision, seed_database

def setup_function():
    app.config.update(TESTING=True)
    with app.app_context():
        db.drop_all(); db.create_all(); seed_database()

def test_health_and_seed():
    with app.test_client() as client:
        assert client.get("/health").status_code == 200
    with app.app_context():
        assert Unit.query.filter_by(name="Unidad de Prevención").one()
        assert Unit.query.filter_by(name="Unidad de Prevención de Delitos Financieros").first() is None

def test_edit_creates_revision():
    with app.app_context(): unit = Unit.query.filter_by(name="Unidad de Prevención").one(); uid=unit.id
    with app.test_client() as client:
        response=client.post(f"/unidades/{uid}/editar",data={"name":"Unidad de Prevención","unit_type":"Unidad","status":"vigente","parent_id":"","mission":"Prevenir riesgos.","functions":"Analizar alertas.\nEmitir reportes.","change_note":"Prueba automatizada"})
        assert response.status_code == 302
    with app.app_context(): assert Revision.query.filter_by(unit_id=uid).count() == 2

def test_word_export():
    with app.test_client() as client:
        response=client.get("/exportar/manual.docx")
        assert response.status_code == 200
        assert "application/vnd.openxmlformats" in response.content_type

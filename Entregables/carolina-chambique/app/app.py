import hashlib
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, abort, flash, redirect, render_template, request, send_from_directory, url_for
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "txt", "csv", "docx", "xlsx", "pptx"}

class CursorAdapter:
    def __init__(self, cursor, postgres): self.cursor, self.postgres = cursor, postgres
    def execute(self, sql, params=()): return self.cursor.execute(sql.replace("?", "%s") if self.postgres else sql, params)
    def fetchone(self): return self.cursor.fetchone()
    def fetchall(self): return self.cursor.fetchall()

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(SECRET_KEY=os.getenv("SECRET_KEY", "dev-only-change-me"), DATABASE_URL=os.getenv("DATABASE_URL", "sqlite:///instance/clouddesk.db"), UPLOAD_FOLDER=os.getenv("UPLOAD_FOLDER", "uploads"), MAX_CONTENT_LENGTH=int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024)))
    if test_config: app.config.update(test_config)
    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)
    init_db(app)

    @app.get("/")
    def index():
        query, category = request.args.get("q", "").strip(), request.args.get("category", "").strip()
        where, params = [], []
        if query:
            where.append("(original_name LIKE ? OR description LIKE ? OR owner LIKE ?)"); params.extend([f"%{query}%"] * 3)
        if category: where.append("category = ?"); params.append(category)
        clause = " WHERE " + " AND ".join(where) if where else ""
        with db_cursor(app) as cur:
            cur.execute("SELECT * FROM documents" + clause + " ORDER BY created_at DESC", params); documents = rows_as_dicts(cur)
            cur.execute("SELECT COUNT(*) AS count, COALESCE(SUM(size_bytes), 0) AS total FROM documents"); stats = row_as_dict(cur)
        return render_template("index.html", documents=documents, stats=stats, query=query, category=category)

    @app.route("/upload", methods=["GET", "POST"])
    def upload():
        if request.method == "POST":
            uploaded, owner = request.files.get("file"), request.form.get("owner", "").strip()
            category = request.form.get("category", "General").strip() or "General"
            description = request.form.get("description", "").strip()
            if not uploaded or not uploaded.filename or not owner:
                flash("Seleccioná un archivo e indicá la persona responsable.", "error"); return render_template("upload.html"), 400
            safe_name = secure_filename(uploaded.filename)
            extension = safe_name.rsplit(".", 1)[-1].lower() if "." in safe_name else ""
            if extension not in ALLOWED_EXTENSIONS:
                flash("Formato no permitido.", "error"); return render_template("upload.html"), 400
            stored_name = f"{uuid.uuid4().hex}.{extension}"
            destination = Path(app.config["UPLOAD_FOLDER"]) / stored_name; uploaded.save(destination)
            with db_cursor(app, commit=True) as cur:
                cur.execute("INSERT INTO documents (original_name, stored_name, description, category, owner, size_bytes, sha256, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (safe_name, stored_name, description, category, owner, destination.stat().st_size, sha256_file(destination), datetime.now(timezone.utc).isoformat(timespec="seconds")))
            flash(f"{safe_name} se guardó correctamente.", "success"); return redirect(url_for("index"))
        return render_template("upload.html")

    @app.get("/documents/<int:document_id>/download")
    def download(document_id):
        with db_cursor(app) as cur: cur.execute("SELECT * FROM documents WHERE id = ?", (document_id,)); document = row_as_dict(cur)
        if not document: abort(404)
        return send_from_directory(app.config["UPLOAD_FOLDER"], document["stored_name"], as_attachment=True, download_name=document["original_name"])

    @app.post("/documents/<int:document_id>/delete")
    def delete(document_id):
        with db_cursor(app) as cur: cur.execute("SELECT * FROM documents WHERE id = ?", (document_id,)); document = row_as_dict(cur)
        if not document: abort(404)
        (Path(app.config["UPLOAD_FOLDER"]) / document["stored_name"]).unlink(missing_ok=True)
        with db_cursor(app, commit=True) as cur: cur.execute("DELETE FROM documents WHERE id = ?", (document_id,))
        flash("Documento eliminado.", "success"); return redirect(url_for("index"))

    @app.get("/health")
    def health():
        try:
            with db_cursor(app) as cur: cur.execute("SELECT 1"); cur.fetchone()
            return {"status": "ok", "database": "ok"}
        except Exception: return {"status": "error", "database": "unavailable"}, 503

    @app.errorhandler(413)
    def too_large(_error): flash("El archivo supera el límite de 10 MB.", "error"); return render_template("upload.html"), 413
    return app

def is_postgres(app): return app.config["DATABASE_URL"].startswith(("postgresql://", "postgres://"))

@contextmanager
def db_cursor(app, commit=False):
    postgres = is_postgres(app)
    if postgres:
        import psycopg
        from psycopg.rows import dict_row
        connection = psycopg.connect(app.config["DATABASE_URL"], row_factory=dict_row)
    else:
        db_path = app.config["DATABASE_URL"].removeprefix("sqlite:///"); Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(db_path); connection.row_factory = sqlite3.Row
    raw = connection.cursor()
    try:
        yield CursorAdapter(raw, postgres)
        if commit: connection.commit()
    except Exception:
        connection.rollback(); raise
    finally: raw.close(); connection.close()

def init_db(app):
    identity = "SERIAL PRIMARY KEY" if is_postgres(app) else "INTEGER PRIMARY KEY AUTOINCREMENT"
    with db_cursor(app, commit=True) as cur:
        cur.execute(f"CREATE TABLE IF NOT EXISTS documents (id {identity}, original_name TEXT NOT NULL, stored_name TEXT NOT NULL UNIQUE, description TEXT NOT NULL, category TEXT NOT NULL, owner TEXT NOT NULL, size_bytes BIGINT NOT NULL, sha256 TEXT NOT NULL, created_at TEXT NOT NULL)")

def rows_as_dicts(cursor): return [dict(row) for row in cursor.fetchall()]
def row_as_dict(cursor):
    row = cursor.fetchone(); return dict(row) if row else None
def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(65536), b""): digest.update(chunk)
    return digest.hexdigest()

app = create_app()
if __name__ == "__main__": app.run(host="0.0.0.0", port=8000, debug=True)

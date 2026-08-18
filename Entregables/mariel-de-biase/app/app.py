import os
import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation
from flask import Flask, render_template, redirect, url_for, request, flash
from flask_login import (
    LoginManager, login_user, logout_user, login_required, current_user
)
from werkzeug.utils import secure_filename
from models import db, User, PurchaseRequest

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "clave-de-desarrollo")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///local.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

UPLOAD_FOLDER = os.path.join(app.root_path, "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# ---------- Autenticación ----------

@app.route("/", methods=["GET"])
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Email o contraseña incorrectos.")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


# ---------- Dashboard (según rol) ----------

@app.route("/dashboard")
@login_required
def dashboard():
    if current_user.is_teen():
        my_requests = (
            PurchaseRequest.query.filter_by(teen_id=current_user.id)
            .order_by(PurchaseRequest.created_at.desc())
            .all()
        )
        return render_template(
            "dashboard_teen.html", requests=my_requests, balance=current_user.balance
        )
    else:
        children = current_user.children
        children_ids = [c.id for c in children]

        # ¿Está viendo un hijo en particular, o a todos?
        selected_id = request.args.get("child_id", type=int)
        if selected_id and selected_id in children_ids:
            filter_ids = [selected_id]
        else:
            selected_id = None  # "Todos"
            filter_ids = children_ids

        all_requests = (
            PurchaseRequest.query.filter(PurchaseRequest.teen_id.in_(filter_ids))
            .order_by(PurchaseRequest.created_at.desc())
            .all()
        )
        pending = [r for r in all_requests if r.status == "pending"]
        history = [r for r in all_requests if r.status != "pending"]
        metrics = build_metrics(all_requests)
        return render_template(
            "dashboard_parent.html",
            pending=pending,
            history=history,
            metrics=metrics,
            children=children,
            selected_id=selected_id,
        )


def build_metrics(all_requests):
    """Calcula métricas simples del mes actual a partir de las solicitudes."""
    now = datetime.utcnow()
    this_month = [
        r for r in all_requests
        if r.created_at.year == now.year and r.created_at.month == now.month
    ]

    total_requested = sum((r.amount for r in this_month), Decimal("0"))
    approved = [r for r in this_month if r.status == "approved"]
    rejected = [r for r in this_month if r.status == "rejected"]
    total_approved = sum((r.approved_amount or r.amount for r in approved), Decimal("0"))

    by_category = {}
    for r in this_month:
        by_category[r.category] = by_category.get(r.category, Decimal("0")) + r.amount

    category_breakdown = []
    if total_requested > 0:
        for cat, amount in sorted(by_category.items(), key=lambda x: x[1], reverse=True):
            pct = round(float(amount) / float(total_requested) * 100)
            category_breakdown.append({"category": cat, "amount": amount, "pct": pct})

    decided = len(approved) + len(rejected)
    approval_rate = round(len(approved) / decided * 100) if decided else None
    avg_request = (total_requested / len(this_month)) if this_month else Decimal("0")
    top_category = category_breakdown[0]["category"] if category_breakdown else None

    return {
        "total_requested": total_requested,
        "total_approved": total_approved,
        "count_this_month": len(this_month),
        "category_breakdown": category_breakdown,
        "approval_rate": approval_rate,
        "avg_request": avg_request,
        "top_category": top_category,
    }


# ---------- Adolescente: nueva solicitud ----------

@app.route("/requests/new", methods=["GET", "POST"])
@login_required
def new_request():
    if not current_user.is_teen():
        flash("Solo un adolescente puede crear solicitudes.")
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        image_filename = None
        photo = request.files.get("image")
        if photo and photo.filename and allowed_file(photo.filename):
            ext = photo.filename.rsplit(".", 1)[1].lower()
            image_filename = f"{uuid.uuid4().hex}.{ext}"
            photo.save(os.path.join(app.config["UPLOAD_FOLDER"], image_filename))

        new_req = PurchaseRequest(
            teen_id=current_user.id,
            item=request.form["item"],
            amount=request.form["amount"],
            category=request.form["category"],
            link_or_note=request.form.get("link_or_note"),
            image_filename=image_filename,
        )
        db.session.add(new_req)
        db.session.commit()
        flash("Solicitud enviada. Queda pendiente de aprobación.")
        return redirect(url_for("dashboard"))

    return render_template("new_request.html")


# ---------- Padre/madre: aprobar o rechazar ----------

@app.route("/requests/<int:request_id>/approve", methods=["POST"])
@login_required
def approve_request(request_id):
    if not current_user.is_parent():
        flash("Solo un padre/madre puede aprobar solicitudes.")
        return redirect(url_for("dashboard"))

    req = PurchaseRequest.query.get_or_404(request_id)
    teen = User.query.get(req.teen_id)

    # Verificación de seguridad: el padre solo puede resolver solicitudes de sus propios hijos
    if teen.parent_id != current_user.id:
        flash("No tenés permiso sobre esta solicitud.")
        return redirect(url_for("dashboard"))

    # Monto a acreditar: si el padre indicó otro monto (aprobación parcial), se usa ese.
    submitted_amount = request.form.get("approved_amount", "").strip()
    credited_amount = req.amount
    if submitted_amount:
        try:
            credited_amount = Decimal(submitted_amount)
            if credited_amount <= 0 or credited_amount > req.amount:
                flash("El monto aprobado debe ser mayor a 0 y no puede superar lo pedido.")
                return redirect(url_for("dashboard"))
        except InvalidOperation:
            flash("Monto inválido.")
            return redirect(url_for("dashboard"))

    req.status = "approved"
    req.approved_amount = credited_amount
    req.parent_note = request.form.get("parent_note") or None
    req.resolved_at = datetime.utcnow()
    teen.balance = (teen.balance or 0) + credited_amount
    db.session.commit()

    if credited_amount < req.amount:
        flash(f"Solicitud aprobada parcialmente. Se acreditaron ${credited_amount} a {teen.name}.")
    else:
        flash(f"Solicitud aprobada. Se acreditaron ${credited_amount} a {teen.name}.")
    return redirect(url_for("dashboard"))


@app.route("/requests/<int:request_id>/reject", methods=["POST"])
@login_required
def reject_request(request_id):
    if not current_user.is_parent():
        flash("Solo un padre/madre puede rechazar solicitudes.")
        return redirect(url_for("dashboard"))

    req = PurchaseRequest.query.get_or_404(request_id)
    teen = User.query.get(req.teen_id)

    if teen.parent_id != current_user.id:
        flash("No tenés permiso sobre esta solicitud.")
        return redirect(url_for("dashboard"))

    req.status = "rejected"
    req.parent_note = request.form.get("parent_note") or None
    req.resolved_at = datetime.utcnow()
    db.session.commit()
    flash("Solicitud rechazada.")
    return redirect(url_for("dashboard"))


# ---------- Inicialización de la base con datos de ejemplo ----------

@app.cli.command("seed")
def seed():
    """Crea usuarios de ejemplo: una madre y dos adolescentes."""
    db.create_all()

    if User.query.filter_by(email="mariel@demo.com").first():
        print("Ya existen datos de ejemplo.")
        return

    parent = User(name="Mariel", email="mariel@demo.com", role="parent")
    parent.set_password("1234")
    db.session.add(parent)
    db.session.commit()

    teen1 = User(
        name="Sofía", email="sofia@demo.com", role="teen",
        balance=0, parent_id=parent.id
    )
    teen1.set_password("1234")

    teen2 = User(
        name="Leandro", email="leandro@demo.com", role="teen",
        balance=0, parent_id=parent.id
    )
    teen2.set_password("1234")

    db.session.add_all([teen1, teen2])
    db.session.commit()
    print("Datos de ejemplo creados: mariel@demo.com / sofia@demo.com / leandro@demo.com (clave: 1234)")


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

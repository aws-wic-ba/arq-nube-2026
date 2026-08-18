from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """
    Representa tanto a un padre/madre como a un adolescente.
    El campo `role` indica cuál de los dos es: 'parent' o 'teen'.
    Un adolescente tiene un `parent_id` que apunta a su padre/madre.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'parent' o 'teen'

    # Solo aplica a usuarios con role='teen'
    balance = db.Column(db.Numeric(10, 2), default=0)
    parent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    children = db.relationship(
        "User", backref=db.backref("parent", remote_side=[id])
    )
    requests = db.relationship(
        "PurchaseRequest", backref="teen", foreign_keys="PurchaseRequest.teen_id"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_parent(self):
        return self.role == "parent"

    def is_teen(self):
        return self.role == "teen"


class PurchaseRequest(db.Model):
    """
    Una solicitud de compra que hace un/a adolescente.
    Estado: 'pending', 'approved' o 'rejected'.
    """
    __tablename__ = "purchase_requests"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    item = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    link_or_note = db.Column(db.String(255), nullable=True)
    image_filename = db.Column(db.String(255), nullable=True)

    status = db.Column(db.String(10), default="pending")  # pending/approved/rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Si el padre aprueba por un monto distinto al pedido (aprobación parcial)
    approved_amount = db.Column(db.Numeric(10, 2), nullable=True)
    # Nota del padre: motivo de rechazo, o monto/alternativa sugerida
    parent_note = db.Column(db.String(255), nullable=True)

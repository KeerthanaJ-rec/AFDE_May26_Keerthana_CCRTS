"""Seed initial data: roles, categories, admin user"""
from database import SessionLocal, engine
import models
from auth import get_password_hash

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Roles
roles = ["Admin", "Supervisor", "Support Agent", "Customer"]
for role_name in roles:
    if not db.query(models.Role).filter(models.Role.name == role_name).first():
        db.add(models.Role(name=role_name))
db.commit()

# Categories
categories = [
    "Billing Issues", "Service Disruption", "Product Defects",
    "Technical Problems", "Delivery Delays", "Account Issues",
    "Customer Service Complaints", "Refund Requests", "General Inquiry"
]
for cat_name in categories:
    if not db.query(models.Category).filter(models.Category.name == cat_name).first():
        db.add(models.Category(name=cat_name))
db.commit()

# Admin user
admin_role = db.query(models.Role).filter(models.Role.name == "Admin").first()
if not db.query(models.User).filter(models.User.email == "admin@ccrts.com").first():
    db.add(models.User(
        name="System Admin",
        email="admin@ccrts.com",
        password_hash=get_password_hash("admin123"),
        role_id=admin_role.id
    ))

# Supervisor
sup_role = db.query(models.Role).filter(models.Role.name == "Supervisor").first()
if not db.query(models.User).filter(models.User.email == "supervisor@ccrts.com").first():
    db.add(models.User(
        name="Jane Supervisor",
        email="supervisor@ccrts.com",
        password_hash=get_password_hash("super123"),
        role_id=sup_role.id
    ))

# Support Agents
agent_role = db.query(models.Role).filter(models.Role.name == "Support Agent").first()
agents = [
    ("Alice Agent", "alice@ccrts.com"),
    ("Bob Support", "bob@ccrts.com"),
]
for name, email in agents:
    if not db.query(models.User).filter(models.User.email == email).first():
        db.add(models.User(
            name=name, email=email,
            password_hash=get_password_hash("agent123"),
            role_id=agent_role.id
        ))

# Sample customer
cust_role = db.query(models.Role).filter(models.Role.name == "Customer").first()
if not db.query(models.User).filter(models.User.email == "customer@example.com").first():
    db.add(models.User(
        name="John Customer",
        email="customer@example.com",
        password_hash=get_password_hash("cust123"),
        role_id=cust_role.id
    ))

db.commit()
db.close()
print("Seed data created successfully!")
print("\nDefault credentials:")
print("  Admin:     admin@ccrts.com / admin123")
print("  Supervisor: supervisor@ccrts.com / super123")
print("  Agent:     alice@ccrts.com / agent123")
print("  Customer:  customer@example.com / cust123")

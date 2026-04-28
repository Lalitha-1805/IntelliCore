import os
import pymongo
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "hr_kms_db")

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_db():
    # Only seed users if the collection is empty
    if db.users.count_documents({}) == 0:
        db.users.insert_many([
            {
                "user_id": "hr_admin",
                "name": "HR Manager",
                "role": "Admin",
                "department": "HR",
                "employment_type": "Full-time",
                "email": "admin@company.com",
                "password_hash": pwd_context.hash("admin123")
            },
            {
                "user_id": "fin_intern",
                "name": "Finance Intern",
                "role": "Employee",
                "department": "Finance",
                "employment_type": "Intern",
                "email": "finance.intern@company.com",
                "password_hash": pwd_context.hash("intern123")
            },
            {
                "user_id": "it_fulltime",
                "name": "IT Systems",
                "role": "Employee",
                "department": "IT",
                "employment_type": "Full-time",
                "email": "it.fulltime@company.com",
                "password_hash": pwd_context.hash("it123")
            }
        ])
        print("Real MongoDB: Initial users seeded.")

def get_db():
    return db

# Seed on startup
seed_db()

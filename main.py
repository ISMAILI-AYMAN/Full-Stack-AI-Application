import sqlite3
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow Next.js to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize SQLite Database
# This creates 'ml_repo.db' in your folder if it doesn't exist
def init_db():
    conn = sqlite3.connect("ml_repo.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            accuracy REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

class ModelData(BaseModel):
    name: str
    accuracy: float

@app.post("/add-model")
async def add_model(data: ModelData):
    conn = sqlite3.connect("ml_repo.db")
    cursor = conn.cursor()
    # SQLite uses '?' as placeholders instead of '%s'
    query = "INSERT INTO models (name, accuracy) VALUES (?, ?)"
    cursor.execute(query, (data.name, data.accuracy))
    conn.commit()
    conn.close()
    return {"message": f"Model {data.name} saved!"}

@app.get("/models")
async def get_models():
    conn = sqlite3.connect("ml_repo.db")
    # This helper turns rows into dictionaries like MySQL's dictionary=True
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM models ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    # Convert rows to list of dicts for JSON output
    result = [dict(row) for row in rows]
    conn.close()
    return result
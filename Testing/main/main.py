import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv  # <-- 1. IMPORT THE LIBRARY

# --- SETUP ---

# 2. EXPLICITLY LOAD THE .env FILE
# This will search for a .env file in the current directory and load it.
load_dotenv()

# 3. -------- LOAD SUPABASE CREDENTIALS --------
# The script will now find these variables because we loaded the file.
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Check if credentials are provided
if not SUPABASE_URL:
    print("ERROR: SUPABASE_URL is not set. Please check your .env file.")
if not SUPABASE_KEY:
    print("ERROR: SUPABASE_KEY (service_role) is not set. Please check your .env file.")

# Initialize the Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    # Exit if we can't connect to Supabase
    exit(1)

# Initialize the FastAPI app
app = FastAPI()

# --- MIDDLEWARE ---

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- DATA MODELS ---

class Message(BaseModel):
    name: str
    message: str


# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    """ A simple endpoint to check if the server is running. """
    return {"status": "Python backend is running!"}


@app.post("/add-message")
def add_message(message: Message):
    """
    Receives a new message from the React frontend and inserts it into the Supabase 'messages' table.
    """
    try:
        data_to_insert = {
            "name": message.name,
            "message": message.message
        }

        data, count = supabase.table('messages').insert(data_to_insert).execute()

        if not data or (isinstance(data, list) and len(data) > 1 and data[1] is None):
            raise HTTPException(status_code=500, detail="Failed to insert message into database.")

        return {"status": "success", "data": data[1]}

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

# To run this server:
# 1. Make sure you are in the 'main' directory.
# 2. Run from your terminal: uvicorn main:app --reload

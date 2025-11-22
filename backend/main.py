from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.transcribe import transcribe_audio
from services.summarize import summarize_text
from services.visualize import visualize_text
import shutil
import os

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.5.185:5173"  # Your network IP
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Audio Visualizer Backend is running"}

import logging

# Configure logging
logging.basicConfig(
    filename='backend.log', 
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

import uuid

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    gemini_api_key: str = Header(None, alias="X-Gemini-API-Key")
):
    try:
        # Use user's API key if provided, otherwise use server's
        api_key = gemini_api_key if gemini_api_key else os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API key required. Please add your API key in settings.")
        
        logging.info(f"Received file: {file.filename}")
        
        # Generate a safe temporary filename
        file_extension = os.path.splitext(file.filename)[1]
        if not file_extension:
            file_extension = ".mp3" # Default to mp3 if no extension
            
        temp_file_path = f"temp_{uuid.uuid4()}{file_extension}"
        
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        file_size = os.path.getsize(temp_file_path)
        logging.info(f"Saved file size: {file_size} bytes")
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        transcript = await transcribe_audio(temp_file_path)
        
        # Clean up
        # os.remove(temp_file_path)
        
        return {"transcript": transcript}
    except Exception as e:
        logging.error(f"Error during transcription: {str(e)}")
        logging.info(f"Kept temp file at: {temp_file_path}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
async def summarize_text(
    request: TextRequest,
    openai_api_key: str = Header(None, alias="X-OpenAI-API-Key")
):
    try:
        # Use user's API key if provided, otherwise use server's
        api_key = openai_api_key if openai_api_key else os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API key required. Please add your API key in settings.")
        
        summary = await summarize_text(request.text, api_key)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/visualize")
async def visualize_text(
    request: TextRequest,
    gemini_api_key: str = Header(None, alias="X-Gemini-API-Key")
):
    try:
        # Use user's API key if provided, otherwise use server's
        api_key = gemini_api_key if gemini_api_key else os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API key required. Please add your API key in settings.")
        
        data = await visualize_text_data(request.text, api_key) # Changed function call
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

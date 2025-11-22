import os
import google.generativeai as genai

async def transcribe_audio_file(file, api_key):
    """Transcribe audio file using Gemini API with user-provided or server API key"""
    try:
        genai.configure(api_key=api_key)
        
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Upload file to Gemini
        uploaded_file = genai.upload_file(temp_path)
        
        # Transcribe using Gemini
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([
            "Please transcribe this audio file accurately. Provide only the transcription text without any additional commentary.",
            uploaded_file
        ])
        
        return response.text
    except Exception as e:
        print(f"Transcription error: {e}")
        raise e

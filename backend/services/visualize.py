import os
import json
from typing import Dict, Any
import google.generativeai as genai

async def visualize_text_data(text: str, api_key: str) -> Dict[str, Any]:
    """Generate visualization data using Gemini API with user-provided or server API key"""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        You are an expert information designer creating a comprehensive infographic. Analyze the following text and create a detailed "Infographic Blueprint" with rich, professional content.
        
        CRITICAL REQUIREMENTS:
        1. Return ONLY valid JSON (no markdown, no code blocks)
        2. Create a visually rich infographic with multiple detailed sections
        3. Detect the language and use it consistently throughout
        
        JSON STRUCTURE:
        {{
          "title": "Main title of the infographic",
          "sections": [
            // Use 3-5 sections from the types below
          ]
        }}
        
        AVAILABLE SECTION TYPES:
        
        1. KEY_CONCEPTS - For main ideas (use 3-4 items):
        {{
          "type": "key_concepts",
          "title": "Section title",
          "items": [
            {{
              "title": "Concept name",
              "description": "2-3 sentences explaining this concept in detail",
              "icon": "star" // Choose: star, zap, target, shield
            }}
          ]
        }}
        
        2. PROCESS - For sequential steps (use 4-6 steps):
        {{
          "type": "process",
          "title": "Section title",
          "steps": [
            "Detailed step 1 description (1-2 sentences)",
            "Detailed step 2 description (1-2 sentences)"
          ]
        }}
        
        3. STATS - For numerical data or metrics:
        {{
          "type": "stats",
          "title": "Section title",
          "data": [
            {{ "label": "Metric name", "value": 85 }},
            {{ "label": "Another metric", "value": 65 }}
          ]
        }}
        
        4. COMPARISON - For comparing two approaches/concepts:
        {{
          "type": "comparison",
          "title": "Section title",
          "items": [
            {{
              "title": "Option A",
              "description": "Detailed explanation of this approach",
              "icon": "star"
            }},
            {{
              "title": "Option B", 
              "description": "Detailed explanation of this approach",
              "icon": "target"
            }}
          ]
        }}
        
        5. QUOTE - For impactful statement:
        {{
          "type": "quote",
          "text": "The quote text",
          "author": "Source or speaker"
        }}
        
        INSTRUCTIONS:
        - Extract the MOST important insights from the text
        - Create detailed, informative descriptions (not just keywords)
        - Use at least 3 different section types
        - Prioritize: key_concepts, process, and stats/comparison
        - Make it comprehensive and professional
        
        Text to analyze:
        {text}
        """
        
        response = model.generate_content(prompt)
        content = response.text
        
        # Clean up potential markdown code blocks
        content = content.replace("```json", "").replace("```", "").strip()
        
        print(f"Gemini Visualization Raw Output: {content}") # Debug print
        
        data = json.loads(content)
        print(f"Gemini Visualization Parsed Data: {data}") # Debug print
        return data
    except Exception as e:
        print(f"Visualization error: {e}")
        # Fallback to empty dict on error
        return {}

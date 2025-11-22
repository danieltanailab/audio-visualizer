import os
from openai import OpenAI

async def summarize_text(text, api_key):
    """Summarize text using OpenAI GPT-4o with user-provided or server API key"""
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional content summarizer. You create clear, well-structured summaries with proper formatting."},
                {"role": "user", "content": f"""
                Please create a comprehensive summary of the following text.
                
                REQUIREMENTS:
                1. Detect the language of the input and write the summary in the SAME language
                2. Use this EXACT structure with markdown formatting:
                
                ## Executive Summary
                [2-3 sentences providing a high-level overview of the main topic and key message]
                
                ## Key Highlights
                [4-6 bullet points with the most important insights, each 1-2 sentences]
                
                ## Action Items
                [2-4 bullet points listing concrete next steps or recommendations, if applicable]
                
                FORMATTING RULES:
                - Use ## for section headers
                - Use - for bullet points
                - Keep bullet points concise but informative
                - If there are no clear action items, you may omit that section
                - Write in a professional, clear style
                
                Text to summarize:
                {text}
                """}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Summarization error: {e}")
        raise e

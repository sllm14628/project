from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="sLLM RAG API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    model: str
    prompt: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    ollama_url = "http://localhost:11434/api/generate"
    
    # stream=False 로 설정하여 한 번에 응답받도록 구성 (추후 SSE 적용 가능)
    payload = {
        "model": request.model,
        "prompt": request.prompt,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(ollama_url, json=payload, timeout=120.0)
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Ollama API Error: {response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Ollama. Make sure Ollama is running. Error: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

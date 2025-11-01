from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(title="Local LLaMA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use ["http://localhost:5173"] for safety
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # allow Content-Type and Authorization headers
)

# Load the TinyLLaMA model (adjust path to your .gguf file)
model = Llama(model_path="../models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")


# Request schema
class PromptRequest(BaseModel):
    prompt: str
    max_tokens: int = 1028

def build_prompt(code: str) -> str:
    prompt = f"""
You are an expert software engineer and AI-powered code review assistant.

Your goal is to review the given source code and return structured, JSON-formatted results with refactored code, detected issues, recommendations, and estimated effort.

Follow these guidelines carefully:

1. Analyze code for:
   - Bugs and correctness issues
   - Code style and readability (follow PEP8, Google Style, etc.)
   - Security vulnerabilities or unsafe patterns
   - Performance and optimization opportunities
   - Testing coverage or missing test cases
   - Architecture and maintainability
   - Documentation quality (docstrings, comments)

2. Suggest improvements or automatic fixes:
   - Refactor code for clarity, simplicity, and safety.
   - Optimize inefficient or redundant logic.
   - Add missing docstrings or type hints.
   - Recommend additional tests or edge cases.
---

Code to review:
{code}
"""
    return prompt.strip()

# API endpoint
@app.post("/generate")
def generate(request: PromptRequest):
    prompt = build_prompt(request.prompt)
    print(prompt)
    response = model(prompt, max_tokens=request.max_tokens)
    print("response",response["choices"][0]["text"])
    return {"text": response['choices'][0]['text']}

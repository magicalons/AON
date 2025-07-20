from fastapi import FastAPI
from pydantic import BaseModel
from gpt4all import GPT4All

app = FastAPI()

# Cambia el nombre por el archivo correcto de tu modelo
model = GPT4All("mistral-7b-instruct-v0.1.Q4_0.gguf")

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(request: PromptRequest):
    output = model.generate(request.prompt)
    return {"response": output}

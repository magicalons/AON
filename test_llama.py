from gpt4all import GPT4All

model_path = "/home/magic/.cache/gpt4all/mistral-7b-instruct-v0.1.Q4_0.gguf"

print("Cargando modelo...")
gpt = GPT4All(model_path)

prompt = "¿Qué es la inteligencia artificial?"
print("Generando respuesta...")
response = gpt.chat_completion(prompt)

print("\nRespuesta:")
print(response)


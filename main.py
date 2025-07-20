from llama_cpp import Llama

model_path = "/home/magic/models/tinyllama.bin"  # ajusta ruta si usas otra

llm = Llama(model_path=model_path)

print("🧠 TinyLlama Beta - escribe 'salir' para terminar.")

while True:
    prompt = input(">> ").strip()
    if prompt.lower() in ["salir", "exit", "quit"]:
        print("👋 Saliendo...")
        break
    if prompt == "":
        continue

    response = llm(prompt=prompt, max_tokens=128)
    print("\n🤖 Respuesta TinyLlama:")
    print(response['choices'][0]['text'])
    print()


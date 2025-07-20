from gpt4all import GPT4All

model_path = "/home/magic/aeon/models/gpt4all-lora-quantized.bin"
model = GPT4All(model_path, backend='llamacpp', n_threads=4, verbose=True)
print("Modelo cargado correctamente")

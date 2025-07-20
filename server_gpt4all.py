from flask import Flask, request, jsonify
from gpt4all import GPT4All

app = Flask(__name__)

model_path = "/home/magic/aeon/models/gpt4all-lora-quantized.bin"
model = GPT4All(model_path, backend='llamacpp', n_threads=4, verbose=True)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    response = model.generate(prompt)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

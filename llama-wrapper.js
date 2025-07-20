const { exec } = require('child_process');

async function llamaGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const cmd = `/home/magic/aeon/models/llama --prompt "${prompt.replace(/"/g, '\\"')}" --max-tokens 100`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Error ejecutando Lama:', stderr);
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  llamaGenerate,
};

if (require.main === module) {
  (async () => {
    try {
      const response = await llamaGenerate("Hola, ¿cómo estás?");
      console.log("Respuesta Lama:", response);
    } catch (e) {
      console.error(e);
    }
  })();
}

const { ethers } = require("hardhat");

async function main() {
  // Asegúrate de que el nombre de tu contrato Solidity coincida aquí (ej. "AONToken")
  // Reemplaza "AONToken" con el nombre exacto de tu contrato Solidity si es diferente.
  const AONToken = await ethers.getContractFactory("AONToken");

  // --- Si tu constructor del token NO toma argumentos (es vacío) ---
  const aonToken = await AONToken.deploy(); 

  // --- Si tu constructor del token SÍ toma argumentos (ej. nombre, símbolo, suministro inicial) ---
  // Descomenta la línea de abajo y comenta la de arriba.
  // Reemplaza "Nombre del Token", "SIMB" y la cantidad según tu contrato.
  // const aonToken = await AONToken.deploy("AON Token", "AON", ethers.parseUnits("5000", 18)); // Ejemplo: 5000 tokens con 18 decimales

  await aonToken.waitForDeployment(); // Espera a que el contrato se despliegue y la transacción se confirme

  console.log(`AONToken desplegado en la dirección: ${aonToken.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

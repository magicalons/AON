// Importa Hardhat Runtime Environment
const hre = require("hardhat");

async function main() {
  // 1. Obtén la factoría del contrato "AonToken".
  // "AonToken" debe coincidir EXACTAMENTE con el nombre de tu contrato en AonToken.sol
  const AonToken = await hre.ethers.getContractFactory("AonToken");

  // 2. Despliega el contrato.
  // ¡No pasamos ningún argumento al constructor, ya que TOTAL_SUPPLY es una constante dentro del contrato!
  const aonToken = await AonToken.deploy();

  // 3. Espera a que el contrato se haya desplegado completamente en la blockchain.
  await aonToken.waitForDeployment();

  // 4. Opcional: Recupera el suministro total y los decimales directamente del contrato desplegado para mostrarlo.
  const totalSupplyFromContract = await aonToken.TOTAL_SUPPLY();
  const decimalsFromContract = await aonToken.decimals();

  console.log(`\n¡AonToken desplegado con éxito!\n`);
  console.log(`Dirección del Contrato: ${aonToken.target}\n`);
  console.log(`Nombre del Token: ${await aonToken.name()}`);
  console.log(`Símbolo del Token: ${await aonToken.symbol()}`);
  console.log(`Suministro total minteado: ${hre.ethers.formatUnits(totalSupplyFromContract, decimalsFromContract)} AON`);
  console.log(`Puedes verificarlo en el explorador de bloques (ej. Polygonscan/Etherscan) buscando esta dirección.`);
}

// Ejecuta la función principal y maneja cualquier error que pueda ocurrir.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

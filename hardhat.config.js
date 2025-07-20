require("@nomicfoundation/hardhat-ethers");
require("dotenv").config(); // Importa dotenv para cargar variables desde .env

module.exports = {
  solidity: "0.8.24", // <<< ¡IMPORTANTE! Asegúrate de que esta sea la versión de Solidity de tu contrato AON
  networks: {
    amoy: {
      url: process.env.RPC_URL, // Usará tu RPC_URL del .env
      accounts: [process.env.PRIVATE_KEY] // Usará tu PRIVATE_KEY del .env
    }
  }
  // Puedes añadir más configuraciones aquí si tu proyecto las necesita (ej. etherscan, gas reporter)
  // etherscan: {
  //   apiKey: process.env.POLYGONSCAN_API_KEY // Si quieres verificar contratos en PolygonScan
  // },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
};

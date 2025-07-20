require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Mantenemos 0.8.20 para tu AonToken.sol

  networks: {
    // --- Nueva Red de Prueba: Polygon Amoy ---
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY", // Esta es la URL RPC de Amoy, la que te da Alchemy
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002, // ¡NUEVO ID DE CADENA PARA AMOY!
    },
    // --- Red Principal: Polygon Mainnet (sin cambios) ---
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
  },

  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY, // ¡NUEVA CONFIGURACIÓN PARA ETHERSCAN!
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
    customChains: [ // Necesario para que Hardhat/Etherscan reconozca Amoy
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/"
        }
      }
    ]
  },
};

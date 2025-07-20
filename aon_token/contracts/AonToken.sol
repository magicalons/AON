// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AonToken is ERC20, Ownable {
    // Definimos el suministro total y los decimales
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * (10 ** 18); // 1,000,000,000 AON con 18 decimales

    // Constructor del contrato: se ejecuta solo una vez al desplegarlo
    constructor() ERC20("Aeon Token", "AON") Ownable(msg.sender) {
        // Mint (crea) el suministro total y lo asigna a la dirección que desplegó el contrato
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    // Este es un comentario temporal para forzar la compilación.
}

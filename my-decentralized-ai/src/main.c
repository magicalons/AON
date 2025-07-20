#include <stdio.h>
#include "module.h"
#include "network.h"

int main() {
    printf("Iniciando Decentralized AI...\n");

    // Inicialización del módulo de memoria local
    init_memory_module();

    // Inicialización de la red P2P
    init_p2p_network();

    // Aquí puedes agregar más inicializaciones según sea necesario

    // Mantener la aplicación en ejecución
    while (1) {
        // Aquí iría el ciclo principal del programa
    }

    return 0;
}

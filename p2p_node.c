#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PORT 12345
#define BUFFER_SIZE 1024

void start_server() {
    int sockfd, client_sock, addr_len;
    struct sockaddr_in server_addr, client_addr;
    char buffer[BUFFER_SIZE];

    // Crear socket
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Error en socket");
        exit(1);
    }

    // Habilitar reutilización del puerto
    int opt = 1;
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // Configurar dirección
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // Enlazar socket
    if (bind(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error en bind");
        exit(1);
    }

    // Escuchar conexiones
    listen(sockfd, 5);
    printf("🟢 Servidor escuchando en el puerto %d...\n", PORT);

    addr_len = sizeof(client_addr);
    while ((client_sock = accept(sockfd, (struct sockaddr*)&client_addr, (socklen_t*)&addr_len))) {
        printf("📥 Cliente conectado: %s\n", inet_ntoa(client_addr.sin_addr));
        memset(buffer, 0, BUFFER_SIZE);
        recv(client_sock, buffer, BUFFER_SIZE, 0);
        printf("📨 Mensaje recibido: %s\n", buffer);
        send(client_sock, "✅ Recibido\n", 12, 0);
        close(client_sock);
    }

    close(sockfd);
}

void start_client(char *ip) {
    int sockfd;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE] = "Hola desde el cliente";

    // Crear socket
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Error en socket");
        exit(1);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    inet_pton(AF_INET, ip, &server_addr.sin_addr);

    // Conectar al servidor
    if (connect(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error en connect");
        exit(1);
    }

    send(sockfd, buffer, strlen(buffer), 0);
    memset(buffer, 0, BUFFER_SIZE);
    recv(sockfd, buffer, BUFFER_SIZE, 0);
    printf("🟢 Respuesta del servidor: %s\n", buffer);

    close(sockfd);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Uso: %s <server|client> [IP]\n", argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "server") == 0) {
        start_server();
    } else if (strcmp(argv[1], "client") == 0) {
        if (argc < 3) {
            printf("Debes especificar la IP del servidor para el modo client\n");
            return 1;
        }
        start_client(argv[2]);
    } else {
        printf("Modo desconocido. Usa 'server' o 'client'\n");
        return 1;
    }

    return 0;
}

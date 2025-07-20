// tcp_virtual.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <errno.h>

#define PORT 12345

void run_server() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    char buffer[1024] = {0};
    const char *hello = "Hola desde el servidor";

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY; 
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address))<0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    printf("Servidor escuchando en puerto %d\n", PORT);

    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen))<0) {
        perror("accept");
        exit(EXIT_FAILURE);
    }

    ssize_t valread = read(new_socket, buffer, sizeof(buffer)-1);
    if (valread > 0) {
        buffer[valread] = '\0';
        printf("Mensaje recibido: %s\n", buffer);
    } else {
        printf("No se recibió mensaje o error: %s\n", strerror(errno));
    }

    send(new_socket, hello, strlen(hello), 0);
    printf("Mensaje enviado\n");

    close(new_socket);
    close(server_fd);
}

void run_client(const char *ip_virtual) {
    int sock = 0;
    struct sockaddr_in serv_addr;
    char buffer[1024] = {0};
    char *message = "Hola desde el cliente";

    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Socket");
        exit(EXIT_FAILURE);
    }

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);

    if(inet_pton(AF_INET, ip_virtual, &serv_addr.sin_addr)<=0) {
        fprintf(stderr, "Dirección inválida/ no soportada: %s\n", ip_virtual);
        exit(EXIT_FAILURE);
    }

    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        perror("Conexión fallida");
        exit(EXIT_FAILURE);
    }

    send(sock , message , strlen(message) , 0 );
    printf("Mensaje enviado\n");
    ssize_t valread = read(sock , buffer, sizeof(buffer)-1);
    if (valread > 0) {
        buffer[valread] = '\0';
        printf("Mensaje recibido: %s\n", buffer);
    } else {
        printf("No se recibió mensaje o error: %s\n", strerror(errno));
    }

    close(sock);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Uso:\n");
        printf("  %s server         # para iniciar como servidor\n", argv[0]);
        printf("  %s client <IP>    # para iniciar como cliente conectando a IP virtual\n", argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "server") == 0) {
        run_server();
    } else if (strcmp(argv[1], "client") == 0) {
        if (argc < 3) {
            fprintf(stderr, "Falta IP virtual para el cliente\n");
            return 1;
        }
        run_client(argv[2]);
    } else {
        fprintf(stderr, "Opción inválida. Usa 'server' o 'client'\n");
        return 1;
    }

    return 0;
}


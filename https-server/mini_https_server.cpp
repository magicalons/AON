#include <iostream>
#include <vector>
#include <cstring>
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

#define PORT 8443
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

const char* CERT_FILE = "cert.pem";
const char* KEY_FILE = "key.pem";

void init_openssl() {
    SSL_load_error_strings();
    OpenSSL_add_ssl_algorithms();
}

void cleanup_openssl() {
    EVP_cleanup();
}

SSL_CTX* create_context() {
    const SSL_METHOD* method = TLS_server_method();
    SSL_CTX* ctx = SSL_CTX_new(method);
    if (!ctx) {
        std::cerr << "Error creating SSL context\n";
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }
    return ctx;
}

void configure_context(SSL_CTX* ctx) {
    if (SSL_CTX_use_certificate_file(ctx, CERT_FILE, SSL_FILETYPE_PEM) <= 0) {
        std::cerr << "Error loading certificate\n";
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }
    if (SSL_CTX_use_PrivateKey_file(ctx, KEY_FILE, SSL_FILETYPE_PEM) <= 0) {
        std::cerr << "Error loading private key\n";
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }
}

int create_socket(int port) {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("Unable to create socket");
        exit(EXIT_FAILURE);
    }

    int opt = 1;
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        perror("Bind failed");
        close(sockfd);
        exit(EXIT_FAILURE);
    }

    if (listen(sockfd, MAX_CLIENTS) < 0) {
        perror("Listen failed");
        close(sockfd);
        exit(EXIT_FAILURE);
    }

    return sockfd;
}

int main() {
    init_openssl();
    SSL_CTX* ctx = create_context();
    configure_context(ctx);

    int server_fd = create_socket(PORT);
    std::cout << "Servidor HTTPS escuchando en puerto " << PORT << "...\n";

    fd_set readfds;
    std::vector<SSL*> clients;

    while (true) {
        FD_ZERO(&readfds);
        FD_SET(server_fd, &readfds);
        int max_sd = server_fd;

        for (size_t i = 0; i < clients.size(); ++i) {
            int sd = SSL_get_fd(clients[i]);
            if (sd > 0) {
                FD_SET(sd, &readfds);
                if (sd > max_sd) max_sd = sd;
            }
        }

        int activity = select(max_sd + 1, &readfds, nullptr, nullptr, nullptr);
        if (activity < 0) {
            perror("Select error");
            break;
        }

        if (FD_ISSET(server_fd, &readfds)) {
            sockaddr_in addr{};
            socklen_t len = sizeof(addr);
            int client_fd = accept(server_fd, (struct sockaddr*)&addr, &len);
            if (client_fd < 0) {
                perror("Accept failed");
                continue;
            }

            SSL* ssl = SSL_new(ctx);
            SSL_set_fd(ssl, client_fd);
            if (SSL_accept(ssl) <= 0) {
                ERR_print_errors_fp(stderr);
                SSL_free(ssl);
                close(client_fd);
            } else {
                clients.push_back(ssl);
            }
        }

        for (size_t i = 0; i < clients.size();) {
            SSL* ssl = clients[i];
            int sd = SSL_get_fd(ssl);

            if (FD_ISSET(sd, &readfds)) {
                char buffer[BUFFER_SIZE] = {0};
                int bytes = SSL_read(ssl, buffer, sizeof(buffer) - 1);
                if (bytes <= 0) {
                    SSL_shutdown(ssl);
                    close(sd);
                    SSL_free(ssl);
                    clients.erase(clients.begin() + i);
                    continue;
                }

                const char* response =
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: text/plain\r\n"
                    "Content-Length: 24\r\n"
                    "Connection: close\r\n"
                    "\r\n"
                    "¡Servidor HTTPS Mini OK!\n";

                SSL_write(ssl, response, strlen(response));
                SSL_shutdown(ssl);
                close(sd);
                SSL_free(ssl);
                clients.erase(clients.begin() + i);
            } else {
                ++i;
            }
        }
    }

    close(server_fd);
    SSL_CTX_free(ctx);
    cleanup_openssl();
    return 0;
}


import java.io.FileInputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.security.KeyStore;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSocket;

public class SimpleHttpsServer {
    public static void main(String[] args) throws Exception {
        // Cargar el keystore con el certificado y la clave privada
        char[] password = "1989".toCharArray(); // Contraseña correcta del keystore
        KeyStore keystore = KeyStore.getInstance("PKCS12");
        FileInputStream fis = new FileInputStream("localhost.p12"); // Nombre correcto del archivo .p12
        keystore.load(fis, password);

        // Crear un KeyManagerFactory para manejar el keystore
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keystore, password);

        // Crear el contexto SSL
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(kmf.getKeyManagers(), null, null);

        // Crear el servidor SSL
        SSLServerSocketFactory factory = sslContext.getServerSocketFactory();
        var serverSocket = (SSLServerSocket) factory.createServerSocket(8443);

        // Esperar la conexión del cliente
        System.out.println("Servidor HTTPS esperando conexiones...");
        while (true) {
            SSLSocket clientSocket = (SSLSocket) serverSocket.accept();
            System.out.println("Conexión establecida: " + clientSocket.getInetAddress());
        }
    }
}


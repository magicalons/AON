package com.example.onionvpn

import android.net.VpnService
import android.os.ParcelFileDescriptor
import java.io.FileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import kotlin.concurrent.thread

class OnionVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onCreate() {
        super.onCreate()
        setupVpn()
    }

    private fun setupVpn() {
        val builder = Builder()
        builder.setSession("OnionVPN")
            .addAddress("10.0.0.2", 32)
            .addRoute("0.0.0.0", 0)
            .setBlocking(true)

        vpnInterface?.close()
        vpnInterface = builder.establish()

        vpnInterface?.fileDescriptor?.let { fd ->
            startTunnelThread(fd)
        }
    }

    private fun startTunnelThread(fd: FileDescriptor) {
        thread(start = true) {
            val input = FileInputStream(fd)
            val output = FileOutputStream(fd)

            val packet = ByteArray(32767)
            while (true) {
                val length = input.read(packet)
                if (length > 0) {
                    // Aquí procesarías el paquete IP (enviar a Tor/Onion)
                    // Por ahora, loopback para pruebas:
                    output.write(packet, 0, length)
                }
            }
        }
    }

    override fun onDestroy() {
        vpnInterface?.close()
        super.onDestroy()
    }
}

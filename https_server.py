#!/usr/bin/env python3
import http.server
import ssl
import socketserver
import os

PORT = 8443

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for VR
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    # Create SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('server.crt', 'server.key')
    
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"HTTPS Server running on port {PORT}")
    print(f"Access at: https://192.168.13.116:{PORT}")
    print("Note: You'll need to accept the security warning in your browser")
    
    httpd.serve_forever()
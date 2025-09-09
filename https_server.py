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
    
    # Look for certificates in different locations
    cert_locations = [
        ('certs/server.crt', 'certs/server.key'),
        ('server.crt', 'server.key'),
        ('/etc/letsencrypt/live/yourdomain.com/fullchain.pem', '/etc/letsencrypt/live/yourdomain.com/privkey.pem')
    ]
    
    cert_loaded = False
    for cert_path, key_path in cert_locations:
        if os.path.exists(cert_path) and os.path.exists(key_path):
            context.load_cert_chain(cert_path, key_path)
            cert_loaded = True
            print(f"Using certificates: {cert_path}, {key_path}")
            break
    
    if not cert_loaded:
        print("Error: No SSL certificates found!")
        print("Please run the setup script or generate certificates manually.")
        exit(1)
    
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"HTTPS Server running on port {PORT}")
    print(f"Access at: https://192.168.13.116:{PORT}")
    print("Note: You'll need to accept the security warning in your browser")
    
    httpd.serve_forever()
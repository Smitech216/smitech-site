#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Désactiver le cache pour tous les fichiers
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir('/workspaces/smitech-site')

with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"🚀 Serveur actif sur http://localhost:{PORT}/")
    print("📝 Les changements sont en temps réel - rechargez la page pour voir les mises à jour!")
    httpd.serve_forever()

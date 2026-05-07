#!/usr/bin/env python3
"""Minimal stats API for opptak.nmbu.no – logs calculation counts, no personal data."""

import http.server
import json
import os
import sqlite3
import socketserver
from datetime import datetime, timezone

PORT    = 8741
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stats.db')

ALLOWED_ORIGINS = {'https://opptak.nmbu.no', 'https://opptak.anoteng.no'}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        'CREATE TABLE IF NOT EXISTS calcs (id INTEGER PRIMARY KEY, ts TEXT NOT NULL)'
    )
    return conn


class Handler(http.server.BaseHTTPRequestHandler):

    def _cors_headers(self):
        origin = self.headers.get('Origin', '')
        if origin in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Vary', 'Origin')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path != '/api/calc-log':
            self.send_response(404)
            self.end_headers()
            return
        ts = datetime.now(timezone.utc).isoformat()
        with get_db() as conn:
            conn.execute('INSERT INTO calcs (ts) VALUES (?)', (ts,))
            total = conn.execute('SELECT COUNT(*) FROM calcs').fetchone()[0]
        self.send_response(200)
        self._cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True, 'total': total}).encode())

    def do_GET(self):
        if self.path == '/api/count':
            with get_db() as conn:
                total = conn.execute('SELECT COUNT(*) FROM calcs').fetchone()[0]
            payload = {'count': total}
        elif self.path == '/api/stats':
            with get_db() as conn:
                total = conn.execute('SELECT COUNT(*) FROM calcs').fetchone()[0]
                rows = conn.execute(
                    "SELECT substr(ts,1,10) AS date, COUNT(*) AS cnt "
                    "FROM calcs GROUP BY date ORDER BY date DESC LIMIT 90"
                ).fetchall()
            payload = {
                'total': total,
                'by_date': [{'date': r[0], 'count': r[1]} for r in rows]
            }
        else:
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self._cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def log_message(self, fmt, *args):  # suppress access log
        pass


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


if __name__ == '__main__':
    with ThreadingServer(('127.0.0.1', PORT), Handler) as srv:
        print(f'opptak-api listening on 127.0.0.1:{PORT}')
        srv.serve_forever()

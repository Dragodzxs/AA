#!/usr/bin/env python3
"""
=============================================================================
ENTERPRISE HR COPILOT BACKEND (Python) - Team Glitch Theory (#279)
Microsoft Innovate 2026 Hackathon
=============================================================================
Zero-dependency Python backend server using Python standard library.
Runs on http://localhost:8000/api/chat with full CORS support.

FEATURES:
1. Intelligent RAG / Policy matcher covering the top 20 HR FAQ questions
2. Grounded citations (handbook sections, policy memos)
3. Dynamic follow-up suggestion chips
4. Clean human escalation hand-off
5. Optional Gemini AI integration if GEMINI_API_KEY is set in environment!
=============================================================================
"""

import json
import os
import sys
import urllib.request
import urllib.error
import socket
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Force IPv4 to prevent IPv6 blackhole timeouts when connecting to Google APIs
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [response for response in responses if response[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

PORT = 8000

# Load GEMINI_API_KEY from environment or .env file
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not GEMINI_API_KEY:
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    GEMINI_API_KEY = line.split("=", 1)[1].strip()
                    break

# Centralized Policy Knowledge Base (Microsoft Innovate 2026 FAQ)
from database import FAQ_KNOWLEDGE_BASE

def query_gemini_ai(user_message, employee_info, history):
    """Calls Google Gemini API. Returns Gemini response or detailed diagnostic error."""
    if not GEMINI_API_KEY:
        return {
            "text": "⚠️ GEMINI_API_KEY is not configured in .env file.",
            "citations": [".env Configuration"],
            "suggestions": ["Add GEMINI_API_KEY to .env"],
            "backendSource": "Config Error",
            "isGemini": False
        }

    candidate_models = [
        "gemini-flash-lite-latest"
    ]

    emp_name = employee_info.get("name", "Alex Morgan")
    emp_id = employee_info.get("id", "EMP-1042")

    policy_context = "\n".join([f"- {item['answer']} (Sources: {', '.join(item['citations'])})" for item in FAQ_KNOWLEDGE_BASE])

    system_instruction = (
        "You are the Enterprise HR Copilot for Team Glitch Theory (#279) at Microsoft Innovate 2026 hackathon. "
        f"You are speaking with employee {emp_name} ({emp_id}). "
        "Answer naturally, warmly, and professionally based strictly on the following enterprise HR policies:\n\n"
        f"COMPANY POLICY DATABASE:\n{policy_context}\n\n"
        "You must assign a 'confidence' score (0 to 100) to your answer. "
        "Score 95-100 if the exact answer is clearly found in the policies. "
        "Score 70-94 if you can logically infer the answer from the policies. "
        "Score 0-69 if the question is highly sensitive (harassment, physical violence, legal disputes, etc.), or asks for personal opinions. "
        "If a user asks how company policy compares to state/national laws, you SHOULD answer by clearly stating the company policy, but add a brief disclaimer that you cannot provide formal legal advice on state laws. Do not artificially lower your confidence just because laws were mentioned. "
        "If confidence is below 70, you MUST set 'escalated' to true, safely decline to answer, and state that you are escalating to a human representative."
        "Always provide relevant policy citations and 3 suggested follow-up questions from the database. "
        "Output ONLY a raw valid JSON object."
    )

    prompt = f"Employee Question: {user_message}\nRecent History: {json.dumps(history[-3:] if history else [])}"

    last_error = ""

    for model_name in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\n{prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 600,
                    "responseMimeType": "application/json",
                    "responseSchema": {
                        "type": "OBJECT",
                        "properties": {
                            "text": {"type": "STRING"},
                            "citations": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "suggestions": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "confidence": {"type": "INTEGER"},
                            "escalated": {"type": "BOOLEAN"}
                        },
                        "required": ["text", "citations", "suggestions", "confidence", "escalated"]
                    }
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=25) as response:
                result = json.loads(response.read().decode("utf-8"))
                raw_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Robust JSON extraction: find outermost curly braces
                start_idx = raw_text.find("{")
                end_idx = raw_text.rfind("}")
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_str = raw_text[start_idx:end_idx+1]
                    parsed = json.loads(json_str)
                else:
                    parsed = json.loads(raw_text)
                    
                # Strict Backend Enforce: Auto-escalate if confidence drops below 70
                confidence_score = parsed.get("confidence", 100)
                if confidence_score < 70:
                    parsed["escalated"] = True

                parsed["backendSource"] = f"Google {model_name} (Live AI)"
                parsed["isGemini"] = True
                print(f"[Gemini SUCCESS] Responded via {model_name} (Confidence: {confidence_score}%)")
                print(f"RAW PARSED RESPONSE: {json.dumps(parsed)}")
                return parsed
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {he.code} on {model_name}: {err_body[:300]}"
            print(f"[Gemini {model_name} HTTP {he.code}] {err_body}", file=sys.stderr)
            continue
        except Exception as e:
            last_error = f"Error on {model_name}: {str(e)}"
            print(f"[Gemini {model_name}] error: {e}", file=sys.stderr)
            try:
                print(f"[RAW TEXT]: {raw_text}", file=sys.stderr)
            except:
                pass
            continue

    # Return pure experimental diagnostic directly to the user (NO PREBACKED ANSWERS)
    return {
        "text": f"⚠️ [Enterprise HR Copilot] Backend AI Service Offline.\nDetails: {last_error}",
        "citations": ["Google API Diagnostic", "Zero Prebaked Fallback"],
        "suggestions": ["Check Gemini API Key", "Retry with different query"],
        "backendSource": "Gemini API Error",
        "isGemini": False
    }


class HRRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Max-Age", "86400")
        self.send_header("Connection", "keep-alive")

    def do_OPTIONS(self):
        """Handles CORS preflight requests from browser."""
        self.send_response(200)
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        """Health check endpoint."""
        payload = {
            "status": "online",
            "service": "Enterprise HR Copilot Python Backend",
            "team": "Glitch Theory (#279)",
            "geminiEnabled": bool(GEMINI_API_KEY)
        }
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        """Chat inference endpoint."""
        print(f"Received POST request for {self.path}", flush=True)
        if self.path != "/api/chat":
            self.send_response(404)
            self._send_cors_headers()
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            print(f"Reading {content_length} bytes...", flush=True)
            body_bytes = self.rfile.read(content_length)
            print(f"Read {len(body_bytes)} bytes. Decoding JSON...", flush=True)
            data = json.loads(body_bytes.decode("utf-8"))
            print(f"Calling Gemini with message: {data.get('message')}", flush=True)

            user_message = data.get("message", "")
            employee_info = data.get("employee", {})
            history = data.get("history", [])

            # Experiment Mode: ONLY Gemini answers (zero prebaked answers)
            response_data = query_gemini_ai(user_message, employee_info, history)

            # Ensure response has required fields
            response_data["isRealBackend"] = True
            
            resp_bytes = json.dumps(response_data).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.send_header("Content-Length", str(len(resp_bytes)))
            self.end_headers()
            self.wfile.write(resp_bytes)
            print(f"[POST /api/chat] Responded to {employee_info.get('name')}: '{user_message[:30]}' -> {response_data.get('backendSource')}")

        except Exception as e:
            err_payload = {"error": str(e), "text": f"Backend internal error: {e}"}
            err_bytes = json.dumps(err_payload).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.send_header("Content-Length", str(len(err_bytes)))
            self.end_headers()
            self.wfile.write(err_bytes)

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = ThreadingHTTPServer(server_address, HRRequestHandler)
    print(f"===============================================================")
    print(f"🚀 Threaded HR Copilot Backend running on http://localhost:{PORT}")
    print(f"API Endpoint: http://127.0.0.1:{PORT}/api/chat")
    print(f"Gemini API: {'ACTIVE' if GEMINI_API_KEY else 'MOCK/FAQ ENGINE (No API Key Required)'}")
    print(f"===============================================================")
    httpd.serve_forever()

if __name__ == "__main__":
    run()

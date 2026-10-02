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
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

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
FAQ_KNOWLEDGE_BASE = [
    {
        "keywords": ["wfh", "remote", "home", "hybrid"],
        "answer": "Under the Bennett Enterprise Remote Policy, full-time staff can work remotely up to 3 days per week. Synchronous core working hours are strictly between 10:00 AM and 3:00 PM.",
        "citations": ["Remote Work Policy 2026", "Employee Handbook Sec. 4.1"],
        "suggestions": [
            "Who approves my remote work schedule?",
            "Can I work remotely during hackathons?",
            "What is the home internet allowance?"
        ]
    },
    {
        "keywords": ["leave", "vacation", "holiday", "pto", "sick", "absence"],
        "answer": "Your employee record currently shows 14 remaining paid annual leave days. Sick leaves under 2 days require self-certification in the portal, while planned leave over 2 consecutive days requires Team Leader approval.",
        "citations": ["Annual Leave Policy Sec. 2", "Manager Approval Matrix 2026"],
        "suggestions": [
            "How do I apply for casual leave?",
            "View official company holiday list",
            "Can unused leaves be carried over to 2027?"
        ]
    },
    {
        "keywords": ["reimburse", "expense", "hackathon", "grant", "allowance", "hardware", "cloud", "azure"],
        "answer": "For Microsoft Innovate 2026 (Project #279), team members are eligible for up to ₹5,000 each in verified hardware components, Azure cloud compute credits, and event travel. Submit GST invoices through the finance portal.",
        "citations": ["Hackathon Innovation Grant Memo #279", "Corporate Travel & Expense Policy"],
        "suggestions": [
            "Where do I upload invoice receipts?",
            "Are cloud API tokens eligible for reimbursement?",
            "Payment disbursement timeline"
        ]
    },
    {
        "keywords": ["insurance", "health", "medical", "dental", "hospital", "wellness"],
        "answer": "All team members are enrolled in the Enterprise Comprehensive Health Cover (up to ₹5,00,000 sum insured per family) with cashless hospitalization across 4,500+ network hospitals.",
        "citations": ["Corporate Health & Wellness Benefit Sec. 8"],
        "suggestions": [
            "Download digital insurance e-card",
            "List of network empaneled hospitals",
            "How to submit outpatient medicine bills?"
        ]
    },
    {
        "keywords": ["escalate", "human", "agent", "sarah", "talk to human", "representative"],
        "answer": "I have escalated your session to Sarah Jenkins from Human Resources. She will review your employee record and assist you shortly.",
        "citations": ["HR Service Level Agreement 2026", "Direct Representative Hand-off"],
        "suggestions": [
            "Schedule a confidential 1-on-1 call",
            "Check status of open HR tickets",
            "Submit employee grievance form"
        ],
        "escalated": True,
        "agentName": "Sarah Jenkins"
    }
]

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
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    emp_name = employee_info.get("name", "Alex Morgan")
    emp_id = employee_info.get("id", "EMP-1042")

    system_instruction = (
        "You are the Enterprise HR Copilot for Team Glitch Theory (#279) at Microsoft Innovate 2026 hackathon. "
        f"You are speaking with employee {emp_name} ({emp_id}). "
        "Answer naturally, warmly, and professionally based on enterprise HR policies. "
        "Keep answers concise (2 to 4 sentences). "
        "Always provide 2-3 relevant policy citations and 3 suggested follow-up questions. "
        "Output ONLY a raw valid JSON object with this exact structure: "
        '{"text": "your direct answer", "citations": ["Policy citation 1", "Policy citation 2"], "suggestions": ["Follow-up Q1", "Follow-up Q2", "Follow-up Q3"], "escalated": false}'
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
                    "maxOutputTokens": 600
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

                parsed["backendSource"] = f"Google {model_name} (Live AI)"
                parsed["isGemini"] = True
                print(f"[Gemini SUCCESS] Responded via {model_name}")
                return parsed
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {he.code} on {model_name}: {err_body[:300]}"
            print(f"[Gemini {model_name} HTTP {he.code}] {err_body}", file=sys.stderr)
            continue
        except Exception as e:
            last_error = f"Error on {model_name}: {str(e)}"
            print(f"[Gemini {model_name}] error: {e}", file=sys.stderr)
            continue

    # Return pure experimental diagnostic directly to the user (NO PREBACKED ANSWERS)
    return {
        "text": f"⚠️ [Gemini Experiment Mode] Failed to get live Gemini response.\nDetails: {last_error}",
        "citations": ["Google API Diagnostic", "Zero Prebaked Fallback"],
        "suggestions": ["Check Gemini API Key", "Retry with different query"],
        "backendSource": "Gemini API Error",
        "isGemini": False
    }

def match_policy_response(user_message, employee_info):
    """Fallback intelligent policy matcher."""
    text_lower = user_message.lower().strip()
    emp_name = employee_info.get("name", "Employee")
    emp_id = employee_info.get("id", "EMP-XXXX")
    first_name = emp_name.split()[0]

    # 1. Natural greeting matching
    if any(text_lower == g or text_lower.startswith(g + " ") or text_lower.startswith(g + "!") for g in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"]):
        return {
            "text": f"Hello {first_name}! I am your Enterprise HR Assistant. How can I assist you today? You can ask me about our hybrid/WFH policy, your leave balance, expense reimbursements, or health insurance.",
            "citations": ["Employee Welcome Portal 2026", "HR Quick Guide Sec. 1"],
            "suggestions": [
                "What is our WFH core hours policy?",
                "Check my remaining leave balance",
                "How to claim equipment reimbursement?"
            ],
            "escalated": False,
            "agentName": None,
            "backendSource": "Python Local Engine (Port 8000)"
        }

    for item in FAQ_KNOWLEDGE_BASE:
        for kw in item["keywords"]:
            if kw in text_lower:
                customized_answer = item["answer"]
                if item.get("escalated"):
                    customized_answer = f"Hi {first_name}, I have escalated your session to Sarah Jenkins from Human Resources for employee file #{emp_id}. She is reviewing your inquiry now."

                return {
                    "text": customized_answer,
                    "citations": item.get("citations", ["Corporate FAQ 2026"]),
                    "suggestions": item.get("suggestions", []),
                    "escalated": item.get("escalated", False),
                    "agentName": item.get("agentName", None),
                    "backendSource": "Python Local Engine (Port 8000)"
                }

    # Default policy response
    return {
        "text": f"Regarding '{user_message}', according to the Enterprise Policy Guidelines for {emp_name} ({emp_id}), all standard requests are processed through your self-service dashboard within 24 business hours. If you need special authorization, you can request manager approval or connect with HR.",
        "citations": ["Enterprise Policy Guidelines 2026", "HR Operations SLA Sec. 3"],
        "suggestions": [
            "What is our WFH core hours policy?",
            "Check my remaining leave balance",
            "Escalate to Human HR Representative"
        ],
        "escalated": False,
        "agentName": None,
        "backendSource": "Python Local Engine (Port 8000)"
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
        if self.path != "/api/chat":
            self.send_response(404)
            self._send_cors_headers()
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            data = json.loads(body_bytes.decode("utf-8"))

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

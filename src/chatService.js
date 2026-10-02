/**
 * ==============================================================================
 * BACKEND INTEGRATION SERVICE - Microsoft Innovate 2026 (Team Glitch Theory #279)
 * ==============================================================================
 * 
 * This service acts as the single source of truth between the frontend UI and the
 * backend (Python FastAPI / Azure Copilot Studio / Flask / Node.js).
 * 
 * HOW TO CONNECT YOUR REAL BACKEND:
 * ------------------------------------------------------------------------------
 * 1. Change BACKEND_API_URL below (or create a .env file with VITE_BACKEND_URL=http://localhost:8000/api/chat)
 * 2. Set FORCE_MOCK = false (it will automatically try your backend first and only fall back to mock if offline)
 * 
 * EXPECTED BACKEND REQUEST PAYLOAD (POST JSON):
 * {
 *   "message": "What is our WFH policy?",
 *   "employee": {
 *     "id": "EMP-1042",
 *     "name": "Alex Morgan"
 *   },
 *   "history": [
 *     { "sender": "user", "text": "..." },
 *     { "sender": "bot", "text": "..." }
 *   ]
 * }
 * 
 * EXPECTED BACKEND RESPONSE JSON:
 * {
 *   "text": "Under the Enterprise Remote Work Policy, staff can work remotely up to 3 days/week...",
 *   "citations": ["Remote Work Policy 2026", "Handbook Sec. 4"],
 *   "suggestions": ["Who approves WFH days?", "Can I work remotely during hackathons?"],
 *   "escalated": false,
 *   "agentName": null
 * }
 * ==============================================================================
 */

// Backend configuration
export const BACKEND_CONFIG = {
  // Replace with your real backend endpoint when ready
  apiUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/chat',
  // Set to true to bypass backend and use local mock; set to false to prefer real backend
  forceMock: false,
  // Timeout in milliseconds before falling back to local response (45s for LLM inference)
  timeoutMs: 45000,
};

/**
 * Main function called by the UI when sending a message.
 * Completely handles: Real Backend Call -> (Fallback to local mock if backend is down)
 */
export async function sendChatMessage({ text, member, history = [] }) {
  // If backend is configured and not forced to mock, attempt real API call
  if (!BACKEND_CONFIG.forceMock && BACKEND_CONFIG.apiUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.timeoutMs);

      const response = await fetch(BACKEND_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          employee: {
            id: member.id,
            name: member.name,
          },
          history: history.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text || data.message || data.response || 'No response from server.',
          citations: Array.isArray(data.citations) ? data.citations : [],
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          escalated: Boolean(data.escalated || data.escalate),
          agentName: data.agentName || (data.escalated ? 'Sarah Jenkins' : null),
          backendSource: data.backendSource || 'Enterprise HR Copilot',
          isGemini: Boolean(data.isGemini),
          isRealBackend: true,
        };
      } else {
        const errText = await response.text();
        return {
          text: `⚠️ Backend Error (HTTP ${response.status}): ${errText}`,
          citations: ["Backend HTTP Failure"],
          suggestions: ["Retry Query"],
          backendSource: "Backend HTTP Error",
          isRealBackend: false
        };
      }
    } catch (err) {
      console.error('[ChatService] Connection error:', err);
      return {
        text: `⚠️ [Experiment Mode - No Prebaked Answers]\nCould not connect to backend (${BACKEND_CONFIG.apiUrl}).\nError: ${err.message}`,
        citations: ["Connection Diagnostic"],
        suggestions: ["Check port 8000 backend", "Retry Query"],
        backendSource: "Connection Error",
        isRealBackend: false
      };
    }
  }

  // Pure Experiment Mode: Zero prebaked answers
  return {
    text: "⚠️ Backend is disabled or unconfigured. No prebaked fallback enabled.",
    citations: ["Configuration Notice"],
    suggestions: [],
    backendSource: "Disabled",
    isRealBackend: false
  };
}

/**
 * Intelligent Mock Response Generator
 * Provides realistic responses matching the Microsoft Innovate 2026 problem statement.
 */
function generateMockResponse(queryText, member) {
  const lower = queryText.toLowerCase().trim();
  const shortName = member.shortName || member.name.split(' ')[0];

  // 1. Natural Conversational Greeting
  if (['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'].some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return {
      text: `Hello ${shortName}! I am your Enterprise HR Assistant. How can I assist you today? You can ask me about our hybrid/WFH policy, your leave balance, expense reimbursements, or insurance benefits.`,
      citations: ['Employee Welcome Portal 2026', 'HR Quick Guide Sec. 1'],
      suggestions: [
        'What is our WFH core hours policy?',
        'Check my remaining leave balance',
        'How to claim equipment reimbursement?'
      ],
      escalated: false,
      isRealBackend: false,
    };
  }

  // 2. Human Escalation Trigger
  if (lower.includes('escalate') || lower.includes('human') || lower.includes('sarah') || lower.includes('agent')) {
    return {
      text: `Hi ${shortName}, I am Sarah from Human Resources. I've taken over this chat for Employee record #${member.id}. How can I assist you with your specific query?`,
      citations: ['Direct HR Representative Hand-off'],
      suggestions: [
        'Review my grievance ticket',
        'Schedule a 1-on-1 HR call',
        'Confidential policy inquiry'
      ],
      escalated: true,
      agentName: 'Sarah Jenkins',
      isRealBackend: false,
    };
  }

  // 3. WFH & Remote Work Policy
  if (lower.includes('wfh') || lower.includes('remote') || lower.includes('home')) {
    return {
      text: `Under the Enterprise Remote Work Policy, full-time staff can work remotely up to 3 days/week with core synchronous hours between 10:00 AM and 3:00 PM.`,
      citations: ['Remote Work Policy 2026', 'Employee Handbook Sec. 4'],
      suggestions: [
        'Who approves my remote work days?',
        'Can I work remotely during client projects?',
        'What equipment allowance do I get?'
      ],
      escalated: false,
      isRealBackend: false,
    };
  }

  // 4. Leave & Vacation Balance
  if (lower.includes('leave') || lower.includes('vacation') || lower.includes('holiday') || lower.includes('pto')) {
    return {
      text: `${member.name}, your employee file (${member.id}) shows 14 remaining paid leave days. Planned leaves over 2 consecutive days require manager sign-off in the HR portal.`,
      citations: ['Annual Leave Guidelines', 'Manager Approval Matrix'],
      suggestions: [
        'How do I submit sick leave?',
        'View annual holiday calendar',
        'Can leave be carried over to next year?'
      ],
      escalated: false,
      isRealBackend: false,
    };
  }

  // 5. Reimbursement, Grants & Allowances
  if (lower.includes('reimburse') || lower.includes('allowance') || lower.includes('grant') || lower.includes('expense') || lower.includes('hardware')) {
    return {
      text: `Employees under policy tier ${member.id} are eligible for up to ₹5,000 in workstation and wellness reimbursements upon submitting valid receipts through the finance portal.`,
      citations: ['Workplace Wellness Memo', 'Corporate Travel & Expense Policy'],
      suggestions: [
        'Where do I upload invoice receipts?',
        'Are internet & mobile bills covered?',
        'Reimbursement payment timeline'
      ],
      escalated: false,
      isRealBackend: false,
    };
  }

  // 6. Helpful Contextual Policy Answer
  return {
    text: `Regarding "${queryText}", according to the Enterprise Policy Guidelines for ${member.name} (${member.id}), all standard requests are processed through your self-service dashboard within 24 business hours. If you need special authorization, you can request manager approval or connect with HR.`,
    citations: ['Enterprise Policy Guidelines 2026', 'HR Operations SLA'],
    suggestions: [
      'What is our WFH core hours policy?',
      'Check my remaining leave balance',
      'Escalate to Human HR'
    ],
    escalated: false,
    isRealBackend: false,
  };
}

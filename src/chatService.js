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
  // Timeout in milliseconds before falling back to local response
  timeoutMs: 5000,
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
        // Return normalized backend response so UI never breaks
        return {
          text: data.text || data.message || data.response || 'No response from server.',
          citations: Array.isArray(data.citations) ? data.citations : [],
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          escalated: Boolean(data.escalated || data.escalate),
          agentName: data.agentName || (data.escalated ? 'Sarah Jenkins' : null),
          isRealBackend: true,
        };
      }
    } catch (err) {
      console.warn('[ChatService] Real backend unreachable, using intelligent mock fallback:', err.message);
    }
  }

  // Graceful Local Mock Engine (Used when backend is not running or offline)
  return generateMockResponse(text, member);
}

/**
 * Intelligent Mock Response Generator
 * Provides realistic responses matching the Microsoft Innovate 2026 problem statement.
 */
function generateMockResponse(queryText, member) {
  const lower = queryText.toLowerCase();
  const shortName = member.shortName || member.name.split(' ')[0];

  // 1. Human Escalation Trigger
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

  // 2. WFH & Remote Work Policy
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

  // 3. Leave & Vacation Balance
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

  // 4. Reimbursement, Grants & Allowances
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

  // 5. Default Policy FAQ
  return {
    text: `I have logged your inquiry regarding "${queryText}" for ${member.name} (${member.id}). All responses are verified against our centralized policy repository.`,
    citations: ['Enterprise FAQ Sec. 2', 'Corporate Code of Conduct'],
    suggestions: [
      'What is our WFH core hours policy?',
      'Check my remaining leave balance',
      'Escalate to Human HR'
    ],
    escalated: false,
    isRealBackend: false,
  };
}

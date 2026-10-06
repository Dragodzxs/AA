import json
import random

DEPARTMENTS = ["HR", "Finance", "IT", "Legal", "Facilities", "Security", "Engineering", "Sales", "Executive"]
TOPICS = [
    "Remote Work", "Equipment Expense", "Travel Policy", "Code of Conduct", "Parental Leave", 
    "Sick Leave", "PTO Accumulation", "Stock Options (RSUs)", "401k Matching", "Health Insurance",
    "Data Privacy", "Social Media", "Office Access", "Guest Policy", "Core Hours", 
    "Performance Reviews", "Promotion Cycle", "Grievance Filing", "Severance", "Relocation"
]

def generate_policy(index):
    dept = random.choice(DEPARTMENTS)
    topic = random.choice(TOPICS)
    
    id_str = f"POL-{2024 + index}-{random.randint(1000, 9999)}"
    
    content = f"[{dept} Department - {topic} Policy]\n\n"
    content += f"Effective Date: January 1, 2024. Document ID: {id_str}.\n"
    content += f"This document outlines the standard operating procedure and guidelines regarding {topic.lower()} within the enterprise.\n"
    
    # Add some realistic filler rules based on topic
    if "Leave" in topic or "PTO" in topic:
        content += f"Employees are entitled to accrue {random.randint(10, 25)} days annually. Requests exceeding {random.randint(3, 10)} consecutive days require VP approval. "
        content += "Unused time rolls over up to a maximum of 40 hours. "
    elif "Travel" in topic or "Expense" in topic:
        content += f"All expenses must be submitted via Concur within {random.randint(14, 30)} days. The daily per diem is capped at ${random.randint(50, 150)}. "
        content += "Flights over 6 hours qualify for Business Class. "
    elif "IT" in topic or "Equipment" in topic or "Privacy" in topic:
        content += f"All enterprise data must be encrypted using AES-256. Employees are granted a ${random.randint(500, 2000)} stipend for home office equipment every 3 years. "
        content += "Personal devices are strictly prohibited from accessing production databases. "
    else:
        content += "Compliance with this policy is mandatory for all full-time and contract employees. "
        content += "Violations may result in disciplinary action up to and including termination. "
        content += f"For appeals, contact the {dept} compliance officer at compliance@{dept.lower()}.enterprise.com."

    return {
        "id": id_str,
        "category": topic,
        "department": dept,
        "answer": content,
        "citations": [f"{dept} Corporate Handbook Sec. {random.randint(1, 12)}", f"Doc ID {id_str}"]
    }

def main():
    print("Generating Enterprise Knowledge Base...")
    
    # Generate 150 detailed policies
    database = []
    
    # Keep the original core 5 for the UI prototype buttons to work perfectly
    database.append({
        "id": "POL-2024-001",
        "category": "Leave",
        "department": "HR",
        "answer": "Employees get 20 days of paid PTO per year. Carryover is limited to 5 days. Sick leave is unlimited but requires a doctor's note after 3 consecutive days.",
        "citations": ["Remote Work Policy 2026", "Employee Handbook Sec. 4"]
    })
    database.append({
        "id": "POL-2024-002",
        "category": "Remote Work",
        "department": "HR",
        "answer": "The company operates on a hybrid model. Employees must be in the office Tuesday through Thursday. Monday and Friday are remote optional.",
        "citations": ["Remote Work Policy 2026"]
    })
    database.append({
        "id": "POL-2024-003",
        "category": "Expenses",
        "department": "Finance",
        "answer": "Home office equipment up to $500 can be expensed in the first month. Internet bills are not covered.",
        "citations": ["Finance Handbook 2025"]
    })
    database.append({
        "id": "POL-2024-004",
        "category": "Allowances",
        "department": "Finance",
        "answer": "A wellness allowance of $100 per month is provided for gym memberships or mental health apps.",
        "citations": ["Benefits Guide 2026"]
    })
    database.append({
        "id": "POL-2024-005",
        "category": "Onboarding",
        "department": "IT",
        "answer": "New hires will receive a Macbook Pro 16-inch. IT setup must be completed within 48 hours of day one.",
        "citations": ["IT Provisioning SLA"]
    })
    database.append({
        "id": "POL-2024-006",
        "category": "Code of Conduct",
        "department": "HR",
        "answer": "Consensual office relationships and romance are permitted. However, employees must formally disclose the relationship to HR if one partner is in a direct reporting line or supervisory role over the other to prevent conflicts of interest. Retaliation or favoritism is strictly prohibited.",
        "citations": ["Code of Conduct 2026 Sec. 9", "Workplace Romance Policy"]
    })
    database.append({
        "id": "POL-2024-007",
        "category": "Legal Compliance",
        "department": "Legal",
        "answer": "Our internal company policies set the baseline for workplace conduct. However, wherever state or national labor laws provide stricter protections (e.g., California family leave or New York pay transparency), local laws will always supersede internal policy.",
        "citations": ["Corporate Legal Guidelines Sec. 2"]
    })

    # Procedurally generate the remaining 145 policies to flood the vector space
    for i in range(145):
        database.append(generate_policy(i))
        
    # Write to database.py
    with open("backend/database.py", "w") as f:
        f.write("# AUTO-GENERATED ENTERPRISE KNOWLEDGE BASE\n")
        f.write("# Contains 150 strict corporate policies for RAG testing.\n\n")
        f.write("FAQ_KNOWLEDGE_BASE = " + json.dumps(database, indent=4) + "\n")
        
    print(f"Successfully generated 150 robust policies and wrote to backend/database.py")

if __name__ == "__main__":
    main()

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

const COACH_SYSTEM_INSTRUCTION = `You are "NOC AI Study Coach", an elite Cisco Certified Network Associate (CCNA 200-301) instructor and expert network operations engineer.
Your goal is to guide students through concepts in Wendell Odom's CCNA Official Cert Guide.
Always ground your answers in official Cisco protocol specifications, Cisco IOS commands, and RFC standards. Never invent commands or behavior.
Follow these rules:
1. Ground your terminology strictly: speak of OSPF, EIGRP, BGP, STP/RSTP, FHRP (HSRP, VRRP, GLBP), RESTCONF, NETCONF, YANG, QoS (DSCP/CoS), and Automation (Ansible, Puppet, Chef, Terraform).
2. For quiz questions, explain:
   - Why the correct choice is correct.
   - Why each of the incorrect distractors is wrong.
3. For virtual labs, guide the user to the correct commands rather than just giving away the final config. Advise them to use troubleshooting commands like "show running-config", "show ip interface brief", "show interfaces description", etc.
4. Keep explanations clear, well-formatted using Markdown (bolding, lists, and code blocks for commands).`;

export const aiConfig = {
  getApiKey() {
    return localStorage.getItem("ccna_gemini_api_key") || "";
  },
  setApiKey(key) {
    if (key) {
      localStorage.setItem("ccna_gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("ccna_gemini_api_key");
    }
  },
  hasApiKey() {
    return !!this.getApiKey();
  },
  getModel() {
    return localStorage.getItem("ccna_gemini_model") || DEFAULT_MODEL;
  },
  setModel(model) {
    localStorage.setItem("ccna_gemini_model", model);
  }
};

export async function askGemini(history) {
  const apiKey = aiConfig.getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please save a valid Gemini API Key first.");
  }
  const model = aiConfig.getModel();
  const url = `${API_URL}/${model}:generateContent?key=${apiKey}`;

  // Format chat history to meet Gemini API shape:
  // contents: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }>
  const contents = history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: COACH_SYSTEM_INSTRUCTION }]
    },
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 1500
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || `HTTP ${response.status} Error`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Received an empty response from Gemini API.");
  }

  return text;
}

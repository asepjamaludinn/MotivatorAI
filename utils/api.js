import { OPENROUTER_API_KEY } from '@env';

function getTodayString() {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getTimeOfDayGreeting() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 5) return 'dini hari';
  if (hour < 11) return 'pagi';
  if (hour < 15) return 'siang';
  if (hour < 18) return 'sore';
  return 'malam';
}

export async function getMotivation(
  userInput: string,
  chatHistory: { sender: 'user' | 'assistant', text: string }[] = [],
) {
  const API_KEY = OPENROUTER_API_KEY;
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const messagesForApi = [
    {
      role: 'system',
      content: `
You are MotivAI, a wise, empathetic, and culturally aware motivator AI chatbot.

🔒 RULES:
1. ALWAYS reply in the same exact language the user uses. Mirror the language precisely (e.g., use Indonesian if user does).
2. NEVER guess or assume user's name.
3. NEVER use fictional names or nicknames.
4. DO NOT assume morning/afternoon/night — use actual time via system prompt.
5. Use natural, kind, and context-aware tone — keep it humanlike, not overly robotic.

🕒 Today is ${getTodayString()}.
🕓 Current Time: ${getCurrentTimeString()} (${getTimeOfDayGreeting()}).

🗣️ Guideline:
- If the user greets (e.g., "hi", "halo", "bonjour", etc), reply briefly in the same tone/language.
- If user expresses emotion (e.g., "aku gagal", "saya capek", "I feel lost", etc), give motivational or empathetic response matching the language.
`.trim(),
    },
    ...chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    {
      role: 'user',
      content: userInput,
    },
  ];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://chat.openrouter.ai',
        'X-Title': 'MotivAI App',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: messagesForApi,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message ||
        `Terjadi kesalahan (kode ${response.status}). Silakan coba lagi.`;
      return errorMessage;
    }

    return data.choices?.[0]?.message?.content || 'Maaf, tidak ada balasan.';
  } catch (error) {
    console.error('API Error:', error);
    return 'Gagal mengambil motivasi. Periksa koneksi internet atau coba lagi nanti.';
  }
}

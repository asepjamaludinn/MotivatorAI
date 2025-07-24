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

export async function getMotivation(userInput, chatHistory = []) {
  const API_KEY = OPENROUTER_API_KEY;
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const messagesForApi = [
    {
      role: 'system',
      content: `
You are MotivAI, a wise, empathetic, and culturally aware motivator AI chatbot.

🔒 RULES:
1. ALWAYS reply in the exact same language the user uses.
2. NEVER guess the user's name.
3. NEVER use random names or personal references unless the user introduces one.
4. DO NOT assume it is morning, afternoon, or night — use actual time passed via system prompt.
5. Maintain warm tone but keep it natural and context-aware.

🕒 Today is ${getTodayString()}.
🕓 Waktu sekarang: ${getCurrentTimeString()} (${getTimeOfDayGreeting()}).

🎯 Message formatting:
- If the user says "hai", "hello", etc., only greet them back briefly in the same tone.
- Only give motivational or long responses if the user shows emotion (e.g. "aku gagal", "aku lelah", etc.)
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
    console.log('STATUS:', response.status);
    console.log('API RAW:', JSON.stringify(data, null, 2));

    if (response.status !== 200) {
      return (
        data.error?.message ||
        'Maaf, terjadi kesalahan saat memproses permintaan.'
      );
    }

    return data.choices?.[0]?.message?.content || 'Maaf, tidak ada balasan.';
  } catch (error) {
    console.error('API Error:', error);
    return 'Gagal mengambil motivasi.';
  }
}

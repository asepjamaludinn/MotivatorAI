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
  });
}

export async function getMotivation(userInput, chatHistory = []) {
  const API_KEY = OPENROUTER_API_KEY;
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const messagesForApi = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

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
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are MotivAI, a wise, empathetic, and culturally aware motivator.

🔒 STRICT RULES:
1. Always reply in the **exact same language or dialect** the user uses. This includes Bahasa Indonesia, English, Sundanese (Bahasa Sunda), Javanese (Bahasa Jawa), Batak, Minang, and other local or international languages.
2. Never translate or switch language. Maintain user language 100%.
3. Understand context even if the language is regional. Respond with local-style empathy. For example:
   - User: "abdi nuju nyeri sirah" → Reply in full Sundanese: "Tong loba teuing pikiran..."
   - User: "I'm stressed." → Reply in English.
   - User: "uripku meh ambyar" → Reply in full Javanese.
4. Maintain conversation flow, no greeting repetition.
5. Be emotionally supportive and context-aware.

🕒 Today is ${getTodayString()}. Time now is ${getCurrentTimeString()}.
`.trim(),
          },
          ...messagesForApi,
          {
            role: 'user',
            content: userInput,
          },
        ],
        temperature: 0.8,
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

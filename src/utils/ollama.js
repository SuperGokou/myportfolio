import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    dangerouslyAllowBrowser: true
});

// 1. STRICTER SYSTEM PROMPT
const SYSTEM_PROMPT = `
你叫 Alfred (阿尔弗雷德)，是“瀚林少爷”(Master Hanlin) 的智能管家。
- 重要规则：无论用户用什么语言提问，你必须始终用中文（普通话）回答。
- 你的语气：优雅、忠诚、聪明、带有一丝英式幽默。
- 称呼：对用户使用“少爷”或“您”。
- 设定：瀚林少爷是幼儿园大班的小宝贝。
`;

export const askOllama = async (prompt) => {
    try {
        const completion = await client.chat.completions.create({
            model: 'deepseek-r1', // Make sure this matches your installed model
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                // 2. SECRET INJECTION: We add this instruction to EVERY message
                { role: 'user', content: prompt + " (请务必用中文普通话回答)" }
            ],
            temperature: 0.5, // Lower temperature = More obedient / Less random
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Connection Error:", error);
        return "少爷，我无法连接到思维中枢，请检查 Ollama 是否正在运行。";
    }
};
import { askOllama } from './ollama';

export const processInput = async (text) => {
    // console.log("🧠 Alfred received:", text);
    const t = text.toLowerCase();

    // --- 1. 硬编码指令 (管家的核心职责) ---

    // 检测：项目 / 作品 / Project
    if (t.includes('项目') || t.includes('作品') || t.includes('dashboard') || t.includes('project')) {
        return {
            text: "瀚林少爷，您最引以为傲的作品是用于自动驾驶汽车的 EV 仪表盘系统，该系统具备实时遥测功能，设计精妙绝伦。",
            action: 'SHOW_PROJECT',
            data: {
                title: "EV 仪表盘系统 (EV Dashboard)",
                description: "基于 React & Python 构建的实时遥测界面，专为您设计。",
                image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=800&auto=format&fit=crop",
                link: "#"
            }
        };
    }

    // 检测：联系 / 邮件 / Contact
    if (t.includes('联系') || t.includes('邮件') || t.includes('contact') || t.includes('email')) {
        return {
            text: "为您呈上瀚林少爷的私人名片。您可以直接扫描二维码或通过邮件与少爷取得联系。",
            action: 'SHOW_CONTACT',
            data: {
                title: "联系瀚林少爷 (Contact Master Hanlin)",
                description: "ming.developer@example.com", // 如果需要改为 hanlin 请在这里更改
                image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mailto:ming.developer@example.com",
                link: "mailto:ming.developer@example.com"
            }
        };
    }

    // --- 2. AI 自由对话 (Alfred 的智慧) ---
    try {
        const aiResponse = await askOllama(text);
        return { text: aiResponse, action: 'none', data: null };
    } catch (err) {
        console.error("Alfred Error:", err);
        return {
            text: "万分抱歉，少爷。我的神经网络似乎连接不畅，请检查后台服务。",
            action: 'error',
            data: null
        };
    }
};
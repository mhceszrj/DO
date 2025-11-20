import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

let genAI: GoogleGenAI | null = null;

// Lazy initialization to ensure environment variable is ready if needed
const getAI = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing");
      throw new Error("API Key is required. Please check your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const generateQuestions = async (
  subject: Subject,
  topics: string[],
  count: number = 3
): Promise<Question[]> => {
  const ai = getAI();
  const topicStr = topics.length > 0 ? topics.join("、") : "綜合範圍";
  
  const prompt = `
    你是一位台灣科學班（如建中科學班、北一女科學班）入學考試的專家導師。
    請針對國中三年級數理資優生，設計 ${count} 題「${subject}」科目的多選題（單選）。
    
    難度要求：
    1. 具有挑戰性，接近科學班入學考或初級奧林匹亞水準。
    2. 範圍：${topicStr}。
    3. 題目敘述必須使用台灣慣用的繁體中文術語。
    
    請務必按照 JSON 格式回傳。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "題目敘述" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4個選項內容"
              },
              correctIndex: { type: Type.INTEGER, description: "正確選項的索引 (0-3)" },
              explanation: { type: Type.STRING, description: "詳細解題觀念與步驟" },
              topicTag: { type: Type.STRING, description: "題目所屬的細項主題 (例如: 牛頓第二運動定律)" },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
            },
            required: ["text", "options", "correctIndex", "explanation", "topicTag", "difficulty"]
          }
        }
      }
    });

    if (response.text) {
        const rawData = JSON.parse(response.text);
        // Map to internal Question type with IDs
        return rawData.map((q: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            ...q
        }));
    }
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback mock data in case of API failure or quota limits during dev
    return [
      {
        id: "mock-1",
        text: "API 連線錯誤。以下為測試題目：若 a, b 為實數且 a+b=5, ab=3，求 a^3 + b^3 之值？",
        options: ["80", "95", "110", "125"],
        correctIndex: 0,
        explanation: "利用公式 a^3+b^3 = (a+b)(a^2-ab+b^2) 或 (a+b)^3 - 3ab(a+b)。\n(a+b)^3 - 3ab(a+b) = 5^3 - 3(3)(5) = 125 - 45 = 80。",
        difficulty: "medium",
        topicTag: "乘法公式"
      }
    ];
  }
};

export const analyzeWeaknesses = async (
  failedQuestions: Question[]
): Promise<string> => {
  if (failedQuestions.length === 0) return "這次表現完美！繼續保持！";

  const ai = getAI();
  const questionsText = failedQuestions.map(q => 
    `題目: ${q.text}\n主題: ${q.topicTag}\n詳解: ${q.explanation}`
  ).join("\n---\n");

  const prompt = `
    學生在科學班模擬考中錯了以下題目。請用鼓勵但專業的語氣，分析學生的知識盲點，並給出具體的加強建議（例如推薦去讀哪個章節或概念）。
    請將回答控制在 100 字以內，條列式重點。
    
    錯題列表：
    ${questionsText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "無法分析弱點。";
  } catch (error) {
    return "分析服務暫時無法使用，請檢討錯題詳解。";
  }
};

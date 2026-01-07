
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';
const LITE_MODEL = 'gemini-flash-lite-latest';
const MAPS_MODEL = 'gemini-2.5-flash';
const SPEECH_MODEL = 'gemini-2.5-flash-preview-tts';

class RequestQueue {
  private queue: Promise<any> = Promise.resolve();
  async add<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => {});
    return result;
  }
}

const globalQueue = new RequestQueue();

async function retryRequest<T>(requestFn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    const errorString = JSON.stringify(error);
    const isRateLimit = errorString.includes('429') || error?.status === 429 || error?.code === 429 || errorString.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * 1000));
      return retryRequest(requestFn, retries - 1, baseDelay * 2);
    }
    throw error;
  }
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const generateNeuralSpeech = async (text: string) => {
  return globalQueue.add(() => retryRequest(async () => {
    const response = await ai.models.generateContent({
      model: SPEECH_MODEL,
      contents: [{ parts: [{ text: `Speak this clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No neural audio stream received.");
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = decodeBase64(base64Audio);
    const dataInt16 = new Int16Array(audioData.buffer);
    const frameCount = dataInt16.length;
    
    const buffer = audioContext.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    
    return true;
  }));
};

export const getDeepChatResponse = async (userMessage: string, history: any[] = []) => {
  return globalQueue.add(() => retryRequest(async () => {
    const chat = ai.chats.create({
      model: PRO_MODEL,
      config: {
        systemInstruction: "You are the FarmLink Neural Assistant. You provide expert agricultural, logistics, and financial advice for African farmers and buyers. Use deep reasoning for complex problems. Always be professional, futuristic, and helpful.",
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    const response = await chat.sendMessage({ message: userMessage });
    return response.text;
  }));
};

export const getFastInsights = async (region: string, crops: string[]) => {
  return globalQueue.add(() => retryRequest(async () => {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: `Quick status for ${region} (${crops.join(', ')}): 2 bullet points on market price and weather alerts. Max 30 words total.`,
    });
    return response.text;
  }));
};

export const getNearbyAgriNodes = async (lat: number, lng: number) => {
  return globalQueue.add(() => retryRequest(async () => {
    const response = await ai.models.generateContent({
      model: MAPS_MODEL,
      contents: "Locate and list 3 nearby agricultural markets, cold storage warehouses, or processing hubs. For each, give a one-sentence description of their services and importance.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    
    const text = response.text || "Scanning regional infrastructure...";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  }));
};

export const getAgriInsights = async (region: string, crops: string[]) => {
  try {
    return await globalQueue.add(() => retryRequest(async () => {
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Provide 3 short, modern agricultural insights for ${region} growing ${crops.join(', ')}. Format as a bulleted list.`,
      });
      return response.text || "Insights currently unavailable.";
    }));
  } catch (error) {
    return "Market insights currently unavailable.";
  }
};

export const getCalendarSuggestions = async (location: string, crops: string[]) => {
  return globalQueue.add(() => retryRequest(async () => {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Provide 5 agricultural calendar suggestions for ${location} regarding ${crops.join(', ')}. 
      For each suggestion, use this EXACT format:
      1.
      CATEGORY: [planting/harvesting/market/maintenance]
      TASK: [Short Task Name]
      DETAILED ADVICE: [1-2 sentences of advice]
      TIMING: [Specific time or date range]`,
    });
    return response.text;
  }));
};

export const getBuyingTips = async (location: string) => {
  return globalQueue.add(() => retryRequest(async () => {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Provide 3 short, strategic buying tips for someone sourcing agricultural produce in ${location}. Focus on quality verification, regional price trends, and logistics optimization.`,
    });
    return response.text;
  }));
};

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { OnboardingState, GroundingSource, NetworkStatusType } from "../types.ts";

const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Emulates a Linux/Web3 terminal response for a given command.
 */
export const executeShellCommand = async (command: string, context: OnboardingState, history: string[]) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Linux/Web3 terminal emulator. 
      Current Project State: ${JSON.stringify(context)}
      Recent Terminal History: ${history.slice(-5).join('\n')}
      
      User entered command: "${command}"
      
      Respond as a standard terminal would. 
      If they type 'npm install', show progress bars. 
      If they type 'ls', list relevant project files (hardhat.config.js, contracts/, scripts/).
      If they type 'cat', show file contents.
      Keep output concise and professional. Do not use markdown backticks in the response, just raw text.`,
    });

    return response.text || "command not found: " + command;
  } catch (error) {
    console.error("Shell Command Error:", error);
    return `kernel: error executing command: ${command}. check link status.`;
  }
};

/**
 * Fetches real-time status report for networks using structured JSON output.
 */
export const getNetworkStatusReport = async (networks: string[]): Promise<Record<string, NetworkStatusType>> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a real-time health check on the following blockchain networks: ${networks.join(', ')}. 
      Determine if each is currently 'UP' (Operational), 'DOWN' (Outage), or 'DEGRADED' (Congested/Maintenance).
      Return a JSON array of objects with "network" and "status" (UP, DOWN, or DEGRADED).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              network: { type: Type.STRING },
              status: { type: Type.STRING }
            },
            required: ["network", "status"]
          }
        }
      },
    });

    const data = JSON.parse(response.text || "[]");
    const result: Record<string, NetworkStatusType> = {};
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.network && item.status) {
          result[item.network] = item.status as NetworkStatusType;
        }
      });
    }
    return result;
  } catch (error) {
    console.error("Status Report Error:", error);
    return {};
  }
};

/**
 * Provides real-time network insights using Google Search grounding.
 */
export const getNetworkInsights = async (networks: string[]) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief status report for the following blockchain networks: ${networks.join(', ')}. Mention if there are any major gas spikes or network upgrades happening today.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "No current insights found.",
      sources: sources as GroundingSource[]
    };
  } catch (error) {
    console.error("Network Insights Error:", error);
    return { text: "Error fetching insights. Satellite link unstable.", sources: [] };
  }
};

/**
 * Analyzes the current infrastructure state and suggests optimizations.
 */
export const getOptimizedArchitecture = async (state: OnboardingState) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this Web3 infrastructure configuration and provide 3-5 high-impact optimization suggestions for performance, cost, and security.
      State: ${JSON.stringify(state)}
      Keep suggestions concise and technical.`,
    });

    return response.text || "Unable to optimize at this time.";
  } catch (error) {
    console.error("Optimization Error:", error);
    return "Neural Analysis Engine failed to respond.";
  }
};

/**
 * Gets a simple definition for Web3 terms.
 */
export const getSimpleExplanation = async (term: string) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a simple, one-sentence explanation for the following Web3/Infrastructure term: "${term}".`,
    });

    return response.text || "Definition not found.";
  } catch (error) {
    return `Error retrieving data for "${term}".`;
  }
};

/**
 * Generates Solidity smart contract code using Gemini 3 Pro.
 */
export const generateContractCode = async (template: string, requirements: string) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a secure, production-ready Solidity smart contract using OpenZeppelin 5.0 libraries for a ${template}. 
      Detailed Requirements: ${requirements}. 
      Ensure the code is modern (Solidity 0.8.20+), secure, and includes appropriate events and error handling. 
      Return ONLY the raw Solidity code. No markdown formatting.`,
    });

    return response.text || "// Error generating contract code.";
  } catch (error) {
    console.error("Contract Gen Error:", error);
    return `// Contract Forge Error: AI Gateway Timeout.`;
  }
};

/**
 * Generates compilation artifacts (ABI/Bytecode) for a contract description.
 */
export const generateContractArtifacts = async (template: string, requirements: string) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a Solidity Compiler. Generate the JSON artifacts for a ${template} contract with these requirements: ${requirements}.
      Return a JSON object with: 
      1. "abi": The contract ABI array.
      2. "bytecode": The contract creation bytecode string (starting with 0x).
      3. "name": The contract name.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            abi: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            bytecode: { type: Type.STRING },
            name: { type: Type.STRING },
          },
          required: ["abi", "bytecode", "name"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Artifact Gen Error:", error);
    return { abi: [], bytecode: "0x", name: "Error" };
  }
};

/**
 * Generates a deployment mission briefing.
 */
export const generateDeploymentBriefing = async (state: OnboardingState) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a "Mission Briefing" for a Web3 Infrastructure deployment.
      Config: ${JSON.stringify(state)}
      Format it as a futuristic command log. Keep it under 150 words.`,
    });
    return response.text || "Initiating standard protocol...";
  } catch (error) {
    return "System ready for deployment. Kernel state: ONLINE.";
  }
};

/**
 * Helper to decode raw PCM audio from Gemini TTS.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Generates and plays futuristic TTS audio.
 */
export const generateDeploymentTTS = async (text: string) => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with a cool, futuristic robotic voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await decodeAudioData(bytes, audioContext, 24000, 1);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.warn("TTS Error:", error);
  }
};
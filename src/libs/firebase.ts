// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getVertexAI, getGenerativeModel, HarmCategory, HarmBlockThreshold, SafetySetting } from "firebase/vertexai";
import { system_prompts } from "@/libs/prompt";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbbp06zAXp3ta9BjmCOqE5Pgx0m7jHKmg",
  authDomain: "gen-rpg.firebaseapp.com",
  projectId: "gen-rpg",
  storageBucket: "gen-rpg.firebasestorage.app",
  messagingSenderId: "400456583847",
  appId: "1:400456583847:web:055f8c8aec1cb62d0ee982"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Vertex AI service　を初期化
const vertexAI = getVertexAI(app);

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }
];

const model_editor = getGenerativeModel(
  vertexAI,
  {
    model: "gemini-1.5-pro-001",
    safetySettings: safetySettings,
    systemInstruction: system_prompts["editor"],
  });

const model_timestamper = getGenerativeModel(
  vertexAI,
  {
    model: "gemini-1.5-pro-001",
    systemInstruction: system_prompts["timestamper"],
  });


export { app, model_editor, model_timestamper };
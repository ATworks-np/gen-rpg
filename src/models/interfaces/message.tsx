export interface IMessage {
  id: number;
  role: "function" | "user" | "model" | "system";
  text: string;
}

export interface IPromptMessage {
  role: "function" | "user" | "model" | "system";
  parts: { text: string }[];
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box } from "@mui/material";
import { IMessage, IPromptMessage } from "@/models/interfaces/message";
import ChatInput from "@/components/ChatInput";
import { model_editor, model_timestamper } from "@/libs/firebase";
import ChatMessage from "@/components/ChatMessage";
import {getNextStory, setStory} from "@/actions/api";
import LoadingModal from "@/components/LoadingModal";
import { getChatHistory, setChat} from "@/actions/chat_history";

function convertIMessageArrayToChatEntry(messages: IMessage[]): IPromptMessage[] {
  return messages.map(message => {
    return {
      role: message.role,
      parts: [{ text: message.text }],
    };
  });
}

interface IChatProps {
  story_id: string;
}

const Chat: React.FC<IChatProps> = ({story_id}: IChatProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messageIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // メッセージ追加のヘルパー関数
  const addMessage = (role: "user" | "model" | 'system', text: string): number => {
    const newMessage: IMessage = {
      id: messageIdRef.current++,
      role: role,
      text: text,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const getMessageForEditor = (message: {generated_text: string, info_text: {distance: number, content: string}[]}): string => {
    let res: string = '';
    res += 'storyteller\n';
    res += `${message['generated_text']}\n\n`;
    res += 'recaller\n';
    message['info_text'].forEach((info: {distance: number, content: string}) => {
      res += `${info['content']}\n`;
    })
    return res;

  }

  // ユーザーの入力を受け取り、ボットの応答も追加する
  const handleSend = async (text: string) => {
    setLoading(true);
    addMessage("user", text);
    await setChat(story_id, {role: "user", text: text});

    const nextStory = await getNextStory(convertIMessageArrayToChatEntry(messages), text, story_id);
    const storyAndInfo = getMessageForEditor(nextStory);
    console.log(nextStory);

    const botMessageId = addMessage("model", "");

    const result = await model_editor.generateContentStream(storyAndInfo)
    setLoading(false);
    let finalBotText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      finalBotText += chunkText;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: msg.text + chunkText } : msg
        )
      );
    }
    await setStory(finalBotText, story_id);
    await setChat(story_id, {role: "model", text: finalBotText});
    const timeResult = await model_timestamper.generateContent(finalBotText);
    const diffStr = timeResult.response.text();
    const diffMinutes = parseElapsedTime(diffStr);
    setElapsedMinutes((prev) => prev + diffMinutes);
    console.log(timeResult.response.text());




    // const chat = model_storyteller.startChat({ history: convertIMessageArrayToChatEntry(messages) });
    // try {
    //   const result = await chat.sendMessageStream(text);
    //   for await (const chunk of result.stream) {
    //     // 受信したチャンクをボットメッセージに追記
    //     console.log(chunk.text());
    //     setMessages((prevMessages) =>
    //       prevMessages.map((msg) =>
    //         msg.id === botMessageId ? { ...msg, text: msg.text + chunk.text() } : msg
    //       )
    //     );
    //   }
    // } catch (error) {
    //   console.error(`error generating content: ${error}`);
    //   addMessage("model", "エラーが発生しました。");
    // }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const history = await getChatHistory(story_id);
      setMessages(history);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseElapsedTime(timeStr: string): number {
    // 例: "01-05:30" => 1日、5時間、30分
    const [dayPart, hmPart] = timeStr.split("-");
    const [hourPart, minutePart] = hmPart.split(":");
    const days = parseInt(dayPart, 10);
    const hours = parseInt(hourPart, 10);
    const minutes = parseInt(minutePart, 10);
    return days * 24 * 60 + hours * 60 + minutes;
  }

  function formatElapsedTime(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / (24 * 60));
    const remainder = totalMinutes % (24 * 60);
    const hours = Math.floor(remainder / 60);
    const minutes = remainder % 60;
    return `${String(days).padStart(2, "0")}-${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return (
    <Box sx={{ height: "100vh" }}>
      <LoadingModal open={loading} />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: 1,
          zIndex: 1000,
          backgroundColor: "rgb(0, 122, 170)",
        }}
      >
        {formatElapsedTime(elapsedMinutes)}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <ChatMessage messages={messages} />
      </Box>
      <ChatInput onSend={handleSend} />
    </Box>
  );
};

export default Chat;
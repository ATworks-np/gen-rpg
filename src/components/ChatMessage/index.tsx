"use client";

import React, { useEffect, useRef } from "react";
import { List, ListItem, Paper } from "@mui/material";
import { IMessage } from "@/models/interfaces/message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage: React.FC<{ messages: IMessage[] }> = ({ messages }) => {
  // 最新メッセージへスクロールするための ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <List sx={{ marginBottom: "80px", padding: 2 }}>
      {messages.map((message) => (
        <ListItem
          key={message.id}
          sx={{
            justifyContent: message.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              padding: 1,
              backgroundColor: message.role === "user" ? "#e0f7fa" : "#f1f8e9",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // ordered list のスタイル調整
                ol: (props) => <ol style={{ paddingLeft: "20px", margin: 0 }} {...props} />,
                // unordered list のスタイル調整
                ul: (props) => <ul style={{ paddingLeft: "20px", margin: 0 }} {...props} />,
                // リスト項目のスタイル調整
                li: (props) => <li style={{ marginBottom: "0.5rem" }} {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </Paper>
        </ListItem>
      ))}
      <div ref={messagesEndRef} />
    </List>
  );
};

export default ChatMessage;
"use client";

import React, { useState } from "react";
import { Box, TextField, Stack, IconButton } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';

const ChatInput: React.FC<{ onSend: (message: string) => void }> = ({ onSend }) => {
  const [comment, setComment] = useState("");

  const handleSend = async () => {
    // 空文字やスペースだけの入力は送信しない
    if (!comment.trim()) return;
    try {
      // ユーザー入力を親コンポーネントへ通知
      onSend(comment);
      setComment("");
    } catch (error) {
      console.error(`error generating content: ${error}`);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
        padding: 1,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          multiline
          variant="outlined"
          placeholder="コメントを入力してください..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          autoComplete="off"
          sx={{
            "& .MuiInputBase-root": {
              padding: { xs: "10px", sm: "10px" },
            },
            "& .MuiInputBase-input": {
              fontSize: { xs: "16px", sm: "16px", md: "16px" },
            },
          }}
        />
        {/* 送信ボタン */}
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!comment.trim()}
        >
          <FileUploadIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ChatInput;
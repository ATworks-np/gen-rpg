"use client";

import { Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateRandomString } from "@/utils/strings";

export default function Home() {
  const router = useRouter();
  const [storyIdInput, setStoryIdInput] = useState("");

  // 新規ストーリー作成: ランダムな story_id を生成
  const handleNewStory = () => {
    const randomString = generateRandomString(32);
    router.push(`/role_playing?story_id=${randomString}`);
  };

  // Resume ボタン: テキストボックスに入力された値を story_id として利用
  const handleResume = () => {
    const trimmedId = storyIdInput.trim();
    if (trimmedId) {
      router.push(`/role_playing?story_id=${trimmedId}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "16px", // 各要素間の間隔
      }}
    >
      <Button variant="contained" onClick={handleNewStory}>
        New Story
      </Button>
      <TextField
        label="Story ID"
        variant="outlined"
        value={storyIdInput}
        onChange={(e) => setStoryIdInput(e.target.value)}
      />
      <Button variant="contained" onClick={handleResume}>
        Resume
      </Button>
    </div>
  );
}

"use client";

import { Suspense, useEffect } from "react";
import Chat from "@/components/Chat";
import { useSearchParams, useRouter } from "next/navigation";

// Suspense 内で useSearchParams を使うコンポーネントに分割
function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const story_id = searchParams.get("story_id");

  useEffect(() => {
    if (!story_id) {
      router.push("/");
    }
  }, [story_id, router]);

  if (!story_id) return null;

  return (
    <div>
      <Chat story_id={story_id} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}

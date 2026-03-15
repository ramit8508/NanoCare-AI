"use client";

import { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

type Props = {
  roomId: string;
  userId: string;
  userName: string;
};

export default function MeetingRoom({ roomId, userId, userName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let zegoInstance: ZegoUIKitPrebuilt | null = null;

    const joinRoom = async () => {
      const response = await fetch("/api/zego/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId, userName }),
      });

      if (!response.ok) {
        setError("Failed to initialize telehealth session.");
        return;
      }

      const payload = (await response.json()) as { kitToken: string };

      if (!containerRef.current) {
        return;
      }

      zegoInstance = ZegoUIKitPrebuilt.create(payload.kitToken);
      zegoInstance.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        sharedLinks: [
          {
            name: "Copy Meeting Link",
            url: `${window.location.origin}/meet/${roomId}`,
          },
        ],
      });
    };

    joinRoom();

    return () => {
      zegoInstance?.destroy();
    };
  }, [roomId, userId, userName]);

  return (
    <section className="mt-4">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div ref={containerRef} style={{ width: "100%", minHeight: 520 }} />
    </section>
  );
}

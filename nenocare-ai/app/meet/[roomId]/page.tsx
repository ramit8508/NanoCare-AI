import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MeetingRoom from "./MeetingRoom";

export default async function MeetingRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userName = session.role === "DOCTOR" ? "Doctor" : "Patient";

  return (
    <main style={{ padding: 24 }}>
      <h1>Telehealth Session</h1>
      <p>Room: {params.roomId}</p>
      <MeetingRoom
        roomId={params.roomId}
        userId={session.userId}
        userName={userName}
      />
    </main>
  );
}

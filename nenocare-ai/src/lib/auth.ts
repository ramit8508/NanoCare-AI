import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type Session = {
  userId: string;
  role: Role;
  isBlacklisted: boolean;
};

export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    isBlacklisted: Boolean(session.user.isBlacklisted),
  };
}

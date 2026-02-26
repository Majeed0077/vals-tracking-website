import { connectDB } from "@/lib/mongodb";
import NotificationLog, { type NotificationChannel } from "@/models/NotificationLog";

type NotifyInput = {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  message: string;
  templateKey?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  meta?: Record<string, unknown>;
};

export async function notify(input: NotifyInput): Promise<void> {
  try {
    await connectDB();
    await NotificationLog.create({
      ...input,
      status: "queued",
    });
  } catch (error) {
    console.error("NOTIFICATION LOG ERROR:", error);
  }
}

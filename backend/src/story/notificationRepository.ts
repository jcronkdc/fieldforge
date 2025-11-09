import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

export interface StoryNotification {
  id: number;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export async function logStoryNotification(eventType: string, payload: Record<string, unknown>) {
  try {
    await pool.query(
      `insert into public.story_notifications (event_type, payload) values ($1, $2)`,
      [eventType, payload]
    );
  } catch (error) {
    console.error("[notifications] failed to log", error);
  }
}

export async function fetchStoryNotifications(limit = 20): Promise<StoryNotification[]> {
  const { rows } = await pool.query(
    `select id, event_type, payload, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created
     from public.story_notifications
     order by created_at desc
     limit $1`,
    [limit]
  );
  return rows.map((row: any) => ({
    id: row.id,
    eventType: row.event_type,
    payload: row.payload,
    createdAt: row.created,
  }));
}






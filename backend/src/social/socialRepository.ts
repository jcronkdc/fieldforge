import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

export type ConnectionRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface BasicProfile {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface BookwormConnection {
  userId: string;
  friendId: string;
  createdAt: string;
  friend: BasicProfile;
}

export interface ConnectionRequestRecord {
  id: string;
  requesterId: string;
  targetId: string;
  status: ConnectionRequestStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  requester: BasicProfile;
  target: BasicProfile;
}

export interface ConnectionStats {
  bookwormCount: number;
  outgoingPending: number;
  incomingPending: number;
}

export async function listBookworms(userId: string, limit = 12): Promise<BookwormConnection[]> {
  const { rows } = await pool.query(
    `
      select ub.user_id, ub.friend_id, ub.created_at,
             p.username, p.display_name, p.avatar_url
      from public.user_bookworms ub
      left join public.user_profiles p on p.user_id = ub.friend_id
      where ub.user_id = $1
      order by ub.created_at desc
      limit $2
    `,
    [userId, Math.max(1, Math.min(limit, 50))]
  );

  return rows.map((row: any) => ({
    userId: row.user_id,
    friendId: row.friend_id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    friend: {
      userId: row.friend_id,
      username: row.username ?? null,
      displayName: row.display_name ?? null,
      avatarUrl: row.avatar_url ?? null,
    },
  }));
}

export async function listConnectionRequests(
  userId: string,
  direction: "inbound" | "outbound" = "inbound",
  limit = 20
): Promise<ConnectionRequestRecord[]> {
  const isInbound = direction === "inbound";
  const column = isInbound ? "target_id" : "requester_id";

  const { rows } = await pool.query(
    `
      select cr.*,
             rp.username as requester_username,
             rp.display_name as requester_display_name,
             rp.avatar_url as requester_avatar,
             tp.username as target_username,
             tp.display_name as target_display_name,
             tp.avatar_url as target_avatar
      from public.connection_requests cr
      left join public.user_profiles rp on rp.user_id = cr.requester_id
      left join public.user_profiles tp on tp.user_id = cr.target_id
      where cr.${column} = $1
      order by cr.created_at desc
      limit $2
    `,
    [userId, Math.max(1, Math.min(limit, 100))]
  );

  return rows.map(mapRequestRow);
}

export async function createConnectionRequest(input: {
  requesterId: string;
  targetId: string;
  message?: string | null;
}): Promise<ConnectionRequestRecord> {
  const { requesterId, targetId, message } = input;

  if (requesterId === targetId) {
    throw new Error("You cannot invite yourself.");
  }

  const existingFriendship = await pool.query(
    `select 1 from public.user_bookworms where user_id = $1 and friend_id = $2`,
    [requesterId, targetId]
  );
  if ((existingFriendship.rowCount ?? 0) > 0) {
    throw new Error("You are already connected.");
  }

  // Check if the target already sent a pending request; auto-accept if so.
  const reciprocalPending = await pool.query(
    `select * from public.connection_requests where requester_id = $1 and target_id = $2 and status = 'pending'`,
    [targetId, requesterId]
  );

  if ((reciprocalPending.rowCount ?? 0) > 0) {
    const request = mapRequestRow(reciprocalPending.rows[0]);
    await acceptRequest(request.id, requesterId, targetId);
    const accepted = await getRequestById(request.id);
    if (!accepted) {
      throw new Error("Unable to finalize connection.");
    }
    return accepted;
  }

  const upsert = await pool.query(
    `
      insert into public.connection_requests (requester_id, target_id, message, status)
      values ($1, $2, $3, 'pending')
      on conflict (requester_id, target_id)
      do update set
        message = excluded.message,
        status = 'pending',
        created_at = timezone('utc', now()),
        responded_at = null
      returning *
    `,
    [requesterId, targetId, message ?? null]
  );

  return mapRequestRow(upsert.rows[0]);
}

export async function respondToRequest(input: {
  requestId: string;
  actorId: string;
  action: "accept" | "decline" | "cancel";
}): Promise<ConnectionRequestRecord | null> {
  const request = await pool.query(`select * from public.connection_requests where id = $1`, [input.requestId]);
  if (request.rowCount === 0) {
    return null;
  }

  const row = request.rows[0];

  if (input.action === "accept" && row.target_id !== input.actorId) {
    throw new Error("Only the recipient can accept this request.");
  }

  if ((input.action === "decline" || input.action === "cancel") && row.requester_id !== input.actorId && row.target_id !== input.actorId) {
    throw new Error("You are not authorized to update this request.");
  }

  switch (input.action) {
    case "accept":
      await acceptRequest(row.id, row.requester_id, row.target_id);
      break;
    case "decline":
      await pool.query(
        `update public.connection_requests set status = 'declined', responded_at = timezone('utc', now()) where id = $1`,
        [row.id]
      );
      break;
    case "cancel":
      await pool.query(
        `update public.connection_requests set status = 'cancelled', responded_at = timezone('utc', now()) where id = $1`,
        [row.id]
      );
      break;
  }

  return getRequestById(row.id);
}

export async function removeBookworm(userId: string, friendId: string): Promise<void> {
  await pool.query(
    `delete from public.user_bookworms where (user_id = $1 and friend_id = $2) or (user_id = $2 and friend_id = $1)`,
    [userId, friendId]
  );
}

export async function getConnectionStats(userId: string): Promise<ConnectionStats> {
  const [bookworms, outgoing, incoming] = await Promise.all([
    pool.query(`select count(*) from public.user_bookworms where user_id = $1`, [userId]),
    pool.query(`select count(*) from public.connection_requests where requester_id = $1 and status = 'pending'`, [userId]),
    pool.query(`select count(*) from public.connection_requests where target_id = $1 and status = 'pending'`, [userId]),
  ]);

  return {
    bookwormCount: Number(bookworms.rows[0].count ?? 0),
    outgoingPending: Number(outgoing.rows[0].count ?? 0),
    incomingPending: Number(incoming.rows[0].count ?? 0),
  };
}

export async function lookupProfileByUsername(username: string): Promise<BasicProfile | null> {
  const { rows } = await pool.query(
    `
      select user_id, username, display_name, avatar_url
      from public.user_profiles
      where lower(username) = lower($1)
      limit 1
    `,
    [username]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    userId: row.user_id,
    username: row.username ?? null,
    displayName: row.display_name ?? null,
    avatarUrl: row.avatar_url ?? null,
  };
}

async function acceptRequest(requestId: string, requesterId: string, targetId: string) {
  await pool.query(
    `update public.connection_requests set status = 'accepted', responded_at = timezone('utc', now()) where id = $1`,
    [requestId]
  );

  await pool.query(
    `
      insert into public.user_bookworms (user_id, friend_id)
      values ($1, $2), ($2, $1)
      on conflict do nothing
    `,
    [requesterId, targetId]
  );
}

async function getRequestById(id: string): Promise<ConnectionRequestRecord | null> {
  const { rows } = await pool.query(
    `
      select cr.*,
             rp.username as requester_username,
             rp.display_name as requester_display_name,
             rp.avatar_url as requester_avatar,
             tp.username as target_username,
             tp.display_name as target_display_name,
             tp.avatar_url as target_avatar
      from public.connection_requests cr
      left join public.user_profiles rp on rp.user_id = cr.requester_id
      left join public.user_profiles tp on tp.user_id = cr.target_id
      where cr.id = $1
    `,
    [id]
  );

  if (rows.length === 0) return null;
  return mapRequestRow(rows[0]);
}

function mapRequestRow(row: any): ConnectionRequestRecord {
  return {
    id: row.id,
    requesterId: row.requester_id,
    targetId: row.target_id,
    status: row.status,
    message: row.message ?? null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
    requester: {
      userId: row.requester_id,
      username: row.requester_username ?? null,
      displayName: row.requester_display_name ?? null,
      avatarUrl: row.requester_avatar ?? null,
    },
    target: {
      userId: row.target_id,
      username: row.target_username ?? null,
      displayName: row.target_display_name ?? null,
      avatarUrl: row.target_avatar ?? null,
    },
  };
}



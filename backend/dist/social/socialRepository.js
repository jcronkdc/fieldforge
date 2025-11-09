"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBookworms = listBookworms;
exports.listConnectionRequests = listConnectionRequests;
exports.createConnectionRequest = createConnectionRequest;
exports.respondToRequest = respondToRequest;
exports.removeBookworm = removeBookworm;
exports.getConnectionStats = getConnectionStats;
exports.lookupProfileByUsername = lookupProfileByUsername;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
async function listBookworms(userId, limit = 12) {
    const { rows } = await pool.query(`
      select ub.user_id, ub.friend_id, ub.created_at,
             p.username, p.display_name, p.avatar_url
      from public.user_bookworms ub
      left join public.user_profiles p on p.user_id = ub.friend_id
      where ub.user_id = $1
      order by ub.created_at desc
      limit $2
    `, [userId, Math.max(1, Math.min(limit, 50))]);
    return rows.map((row) => ({
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
async function listConnectionRequests(userId, direction = "inbound", limit = 20) {
    const isInbound = direction === "inbound";
    const column = isInbound ? "target_id" : "requester_id";
    const { rows } = await pool.query(`
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
    `, [userId, Math.max(1, Math.min(limit, 100))]);
    return rows.map(mapRequestRow);
}
async function createConnectionRequest(input) {
    const { requesterId, targetId, message } = input;
    if (requesterId === targetId) {
        throw new Error("You cannot invite yourself.");
    }
    const existingFriendship = await pool.query(`select 1 from public.user_bookworms where user_id = $1 and friend_id = $2`, [requesterId, targetId]);
    if ((existingFriendship.rowCount ?? 0) > 0) {
        throw new Error("You are already connected.");
    }
    // Check if the target already sent a pending request; auto-accept if so.
    const reciprocalPending = await pool.query(`select * from public.connection_requests where requester_id = $1 and target_id = $2 and status = 'pending'`, [targetId, requesterId]);
    if ((reciprocalPending.rowCount ?? 0) > 0) {
        const request = mapRequestRow(reciprocalPending.rows[0]);
        await acceptRequest(request.id, requesterId, targetId);
        const accepted = await getRequestById(request.id);
        if (!accepted) {
            throw new Error("Unable to finalize connection.");
        }
        return accepted;
    }
    const upsert = await pool.query(`
      insert into public.connection_requests (requester_id, target_id, message, status)
      values ($1, $2, $3, 'pending')
      on conflict (requester_id, target_id)
      do update set
        message = excluded.message,
        status = 'pending',
        created_at = timezone('utc', now()),
        responded_at = null
      returning *
    `, [requesterId, targetId, message ?? null]);
    return mapRequestRow(upsert.rows[0]);
}
async function respondToRequest(input) {
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
            await pool.query(`update public.connection_requests set status = 'declined', responded_at = timezone('utc', now()) where id = $1`, [row.id]);
            break;
        case "cancel":
            await pool.query(`update public.connection_requests set status = 'cancelled', responded_at = timezone('utc', now()) where id = $1`, [row.id]);
            break;
    }
    return getRequestById(row.id);
}
async function removeBookworm(userId, friendId) {
    await pool.query(`delete from public.user_bookworms where (user_id = $1 and friend_id = $2) or (user_id = $2 and friend_id = $1)`, [userId, friendId]);
}
async function getConnectionStats(userId) {
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
async function lookupProfileByUsername(username) {
    const { rows } = await pool.query(`
      select user_id, username, display_name, avatar_url
      from public.user_profiles
      where lower(username) = lower($1)
      limit 1
    `, [username]);
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
async function acceptRequest(requestId, requesterId, targetId) {
    await pool.query(`update public.connection_requests set status = 'accepted', responded_at = timezone('utc', now()) where id = $1`, [requestId]);
    await pool.query(`
      insert into public.user_bookworms (user_id, friend_id)
      values ($1, $2), ($2, $1)
      on conflict do nothing
    `, [requesterId, targetId]);
}
async function getRequestById(id) {
    const { rows } = await pool.query(`
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
    `, [id]);
    if (rows.length === 0)
        return null;
    return mapRequestRow(rows[0]);
}
function mapRequestRow(row) {
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

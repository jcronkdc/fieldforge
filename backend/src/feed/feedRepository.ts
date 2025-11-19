import { loadEnv } from "../worker/env.js";
import type { FeedEventType, FeedEvent as StreamFeedEvent } from "./types.js";
import { query } from "../database.js";
import pool from "../database.js";

const env = loadEnv();

const DEFAULT_PAGE_SIZE = 20;

export interface FeedActor {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FeedCard {
  id: string;
  eventType: FeedEventType | string;
  createdAt: string;
  title: string | null;
  body: string | null;
  actor: FeedActor | null;
  metadata: Record<string, unknown>;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
}

export interface FeedComment {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: string;
  actor: FeedActor | null;
}

type FeedQueryOptions = {
  limit?: number;
  offset?: number;
  search?: string | null;
  sort?: "latest" | "popular";
  eventTypes?: FeedEventType[];
  userId?: string | null;
};

function coercePositiveInteger(value: number | undefined, fallback: number, max = 100) {
  if (!Number.isFinite(value)) return fallback;
  const next = Math.trunc(value!);
  return Math.min(Math.max(next, 1), max);
}

function buildFeedEventsCTE() {
  return `
    events as (
      select
        fp.id::text as id,
        fp.event_type::text as event_type,
        fp.created_at as created_at,
        fp.summary as title,
        fp.summary as summary,
        fp.summary as body,
        fp.actor_id::text as actor_user_id,
        up.email as actor_username,
        (up.first_name || ' ' || up.last_name) as actor_display_name,
        null::text as actor_avatar_url,
        coalesce(fp.metadata, '{}'::jsonb) as metadata,
        (coalesce(fp.summary, '') || ' ' || coalesce(up.first_name, '') || ' ' || coalesce(up.last_name, '')) as search_text
      from public.feed_posts fp
      left join public.user_profiles up on up.id = fp.actor_id
      where true

      union all

      select
        sb.id::text as id,
        'story_branch_created'::text as event_type,
        sb.created_at,
        sb.title,
        null::text as summary,
        null::text as body,
        sb.author_id::text as actor_user_id,
        author_profile.username as actor_username,
        author_profile.display_name as actor_display_name,
        author_profile.avatar_url as actor_avatar_url,
        jsonb_build_object(
          'branchId', sb.id,
          'worldId', sb.world_id,
          'status', sb.status,
          'tags', coalesce(sb.tags, '[]'::jsonb)
        ) as metadata,
        (coalesce(sb.title, '') || ' ' || coalesce(author_profile.display_name, '') || ' ' || coalesce(author_profile.username, '')) as search_text
      from public.story_branches sb
      left join public.user_profiles author_profile on author_profile.user_id::text = sb.author_id

      union all

      select
        sn.id::text as id,
        sn.event_type,
        sn.created_at,
        coalesce(sn.payload->>'title', sb.title, 'Story update') as title,
        null::text as summary,
        null::text as body,
        sb.author_id::text as actor_user_id,
        author_profile.username as actor_username,
        author_profile.display_name as actor_display_name,
        author_profile.avatar_url as actor_avatar_url,
        jsonb_build_object(
          'branchId', sn.payload->>'branchId',
          'chapterId', sn.payload->>'chapterId',
          'commentId', sn.payload->>'commentId',
          'payload', sn.payload
        ) as metadata,
        (
          coalesce(sn.payload->>'title', '') || ' ' ||
          coalesce(sb.title, '') || ' ' ||
          coalesce(author_profile.display_name, '') || ' ' ||
          coalesce(author_profile.username, '')
        ) as search_text
      from public.story_notifications sn
      left join public.story_branches sb on sb.id::text = sn.payload->>'branchId'
      left join public.user_profiles author_profile on author_profile.user_id::text = sb.author_id
      where sn.event_type in ('chapter_added', 'story_saved', 'comment_added')

      union all

      select
        cr.id::text as id,
        'connection_accepted'::text as event_type,
        cr.responded_at,
        'New BookWorm connection'::text as title,
        concat_ws(' ', requester.display_name, 'and', target.display_name) as summary,
        null::text as body,
        cr.target_id::text as actor_user_id,
        target.username as actor_username,
        target.display_name as actor_display_name,
        target.avatar_url as actor_avatar_url,
        jsonb_build_object(
          'requestId', cr.id::text,
          'requesterId', cr.requester_id,
          'targetId', cr.target_id,
          'requesterDisplayName', requester.display_name,
          'targetDisplayName', target.display_name
        ) as metadata,
        (coalesce(requester.display_name, '') || ' ' || coalesce(requester.username, '') || ' ' || coalesce(target.display_name, '') || ' ' || coalesce(target.username, '')) as search_text
      from public.connection_requests cr
      left join public.user_profiles requester on requester.user_id = cr.requester_id::uuid
      left join public.user_profiles target on target.user_id = cr.target_id::uuid
      where cr.status = 'accepted' and cr.responded_at is not null
    ),
    like_counts as (
      select event_id,
             count(*)::int as like_count,
             bool_or(user_id::text = $6) as liked_by_user
      from public.feed_likes
      group by event_id
    ),
    comment_counts as (
      select event_id,
             count(*)::int as comment_count
      from public.feed_comments
      group by event_id
    ),
    repost_counts as (
      select event_id,
             count(*)::int as repost_count,
             bool_or(user_id::text = $6) as reposted_by_user
      from public.feed_reposts
      group by event_id
    )
  `;
}

export async function fetchFeedCards(options: FeedQueryOptions = {}): Promise<FeedCard[]> {
  const limit = coercePositiveInteger(options.limit, DEFAULT_PAGE_SIZE);
  const offset = Math.max(options.offset ?? 0, 0);
  const rawSearch = options.search?.trim();
  const search = rawSearch ? rawSearch : null;
  const sort: "latest" | "popular" = options.sort === "popular" ? "popular" : "latest";
  const eventTypes = options.eventTypes?.length ? options.eventTypes : [];
  const userId = options.userId ?? null;

  const { rows } = await pool.query(
    `
      with ${buildFeedEventsCTE()}
      select
        e.id,
        e.event_type,
        e.created_at,
        e.title,
        e.summary,
        e.body,
        e.actor_user_id,
        e.actor_username,
        e.actor_display_name,
        e.actor_avatar_url,
        e.metadata,
        coalesce(l.like_count, 0) as like_count,
        coalesce(c.comment_count, 0) as comment_count,
        coalesce(r.repost_count, 0) as repost_count,
        coalesce(l.liked_by_user, false) as liked_by_user,
        coalesce(r.reposted_by_user, false) as reposted_by_user,
        (coalesce(l.like_count, 0) * 3 + coalesce(c.comment_count, 0) * 2 + coalesce(r.repost_count, 0)) as popularity_score
      from events e
      left join like_counts l on l.event_id = e.id
      left join comment_counts c on c.event_id = e.id
      left join repost_counts r on r.event_id = e.id
      where ($3::text is null or e.search_text ilike '%' || $3 || '%')
        and (coalesce(array_length($4::text[], 1), 0) = 0 or e.event_type = any($4::text[]))
      order by
        case when $5 = 'popular' then popularity_score end desc,
        e.created_at desc
      limit $1 offset $2
    `,
    [limit, offset, search, eventTypes, sort, userId]
  );

  return rows.map(mapFeedCardRow);
}

function mapFeedCardRow(row: any): FeedCard {
  const createdAt = row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString();
  const actorAvailable = row.actor_user_id || row.actor_username || row.actor_display_name || row.actor_avatar_url;
  return {
    id: row.id,
    eventType: row.event_type,
    createdAt,
    title: row.title ?? null,
    body: row.summary ?? row.body ?? null,
    actor: actorAvailable
      ? {
          userId: row.actor_user_id ?? null,
          username: row.actor_username ?? null,
          displayName: row.actor_display_name ?? null,
          avatarUrl: row.actor_avatar_url ?? null,
        }
      : null,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    likeCount: Number(row.like_count ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    repostCount: Number(row.repost_count ?? 0),
    likedByCurrentUser: Boolean(row.liked_by_user),
    repostedByCurrentUser: Boolean(row.reposted_by_user),
  };
}

export async function listStreamEvents(limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<StreamFeedEvent[]> {
  const safeLimit = coercePositiveInteger(limit, DEFAULT_PAGE_SIZE);
  const safeOffset = Math.max(offset, 0);

  const { rows } = await pool.query(
    `
      with ${buildFeedEventsCTE()}
      select
        e.id,
        e.event_type,
        e.created_at,
        jsonb_build_object(
          'title', e.title,
          'summary', e.summary,
          'body', e.body,
          'metadata', e.metadata,
          'actor', jsonb_build_object(
            'userId', e.actor_user_id,
            'username', e.actor_username,
            'displayName', e.actor_display_name,
            'avatarUrl', e.actor_avatar_url
          ),
          'likeCount', coalesce(l.like_count, 0),
          'commentCount', coalesce(c.comment_count, 0),
          'repostCount', coalesce(r.repost_count, 0)
        ) as payload
      from events e
      left join like_counts l on l.event_id = e.id
      left join comment_counts c on c.event_id = e.id
      left join repost_counts r on r.event_id = e.id
      order by e.created_at desc nulls last
      limit $1 offset $2
    `,
    [safeLimit, safeOffset]
  );

  return rows.map((row: any) => ({
    id: row.id,
    eventType: row.event_type,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    payload: (row.payload ?? {}) as Record<string, unknown>,
  }));
}

export async function setFeedLike(eventId: string, userId: string, like: boolean) {
  if (!eventId || !userId) throw new Error("eventId and userId are required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (like) {
      await client.query(
        `
          insert into public.feed_likes (event_id, user_id)
          values ($1, $2::uuid)
          on conflict (event_id, user_id) do nothing
        `,
        [eventId, userId]
      );
    } else {
      await client.query(`delete from public.feed_likes where event_id = $1 and user_id = $2::uuid`, [eventId, userId]);
    }

    const { rows } = await client.query<{ like_count: number }>(
      `select count(*)::int as like_count from public.feed_likes where event_id = $1`,
      [eventId]
    );
    await client.query("COMMIT");
    return { liked: like, likeCount: rows[0]?.like_count ?? 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listFeedComments(eventId: string, limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<FeedComment[]> {
  const safeLimit = coercePositiveInteger(limit, DEFAULT_PAGE_SIZE, 100);
  const safeOffset = Math.max(offset, 0);

  const { rows } = await pool.query(
    `
      select fc.id,
             fc.event_id,
             fc.user_id,
             fc.body,
             fc.created_at,
             up.username,
             up.display_name,
             up.avatar_url
      from public.feed_comments fc
      left join public.user_profiles up on up.user_id = fc.user_id
      where fc.event_id = $1
      order by fc.created_at desc
      limit $2 offset $3
    `,
    [eventId, safeLimit, safeOffset]
  );

  return rows.map((row: any) => ({
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    actor:
      row.username || row.display_name || row.avatar_url
        ? {
            userId: row.user_id,
            username: row.username,
            displayName: row.display_name,
            avatarUrl: row.avatar_url,
          }
        : null,
  }));
}

export async function createFeedComment(eventId: string, userId: string, body: string): Promise<FeedComment> {
  if (!eventId || !userId) throw new Error("eventId and userId are required");
  if (!body?.trim()) throw new Error("Comment body is required");

  const { rows } = await pool.query(
    `
      insert into public.feed_comments (event_id, user_id, body)
      values ($1, $2::uuid, $3)
      returning id, event_id, user_id, body, created_at
    `,
    [eventId, userId, body.trim()]
  );

  const comment = rows[0];
  const profile = await pool.query(
    `select username, display_name, avatar_url from public.user_profiles where user_id = $1`,
    [userId]
  );
  const actorRow = profile.rows[0];
  return {
    id: comment.id,
    eventId: comment.event_id,
    userId: comment.user_id,
    body: comment.body,
    createdAt: comment.created_at ? new Date(comment.created_at).toISOString() : new Date().toISOString(),
    actor: actorRow
      ? {
          userId: userId,
          username: actorRow.username ?? null,
          displayName: actorRow.display_name ?? null,
          avatarUrl: actorRow.avatar_url ?? null,
        }
      : null,
  };
}

export async function setFeedRepost(eventId: string, userId: string, repost: boolean) {
  if (!eventId || !userId) throw new Error("eventId and userId are required");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (repost) {
      await client.query(
        `
          insert into public.feed_reposts (event_id, user_id)
          values ($1, $2::uuid)
          on conflict (event_id, user_id) do nothing
        `,
        [eventId, userId]
      );
    } else {
      await client.query(`delete from public.feed_reposts where event_id = $1 and user_id = $2::uuid`, [eventId, userId]);
    }

    const { rows } = await client.query<{ repost_count: number }>(
      `select count(*)::int as repost_count from public.feed_reposts where event_id = $1`,
      [eventId]
    );
    await client.query("COMMIT");
    return { reposted: repost, repostCount: rows[0]?.repost_count ?? 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}



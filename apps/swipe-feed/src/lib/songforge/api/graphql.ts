/**
 * SongForge GraphQL API
 * GraphQL schema and resolvers for complex queries and subscriptions
 */

import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLEnumType, GraphQLInputObjectType, GraphQLUnionType } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { PubSub } from 'graphql-subscriptions';
import { db } from '../database/connection';
import { songStructureEngine } from '../songStructureEngine';
import { lyricMelodyEngine } from '../lyricMelodyEngine';
import { collaborationEngine } from '../collaborationEngine';
import { profitabilityEngine } from '../profitabilityEngine';
import { dashboardEngine } from '../dashboardEngine';
import { sparkIntegration } from '../sparkIntegration';

// Initialize PubSub for subscriptions
const pubsub = new PubSub();

// =====================================================
// ENUMS
// =====================================================

const SongStatusEnum = new GraphQLEnumType({
  name: 'SongStatus',
  values: {
    DRAFT: { value: 'draft' },
    IN_PROGRESS: { value: 'in_progress' },
    COMPLETED: { value: 'completed' },
    PUBLISHED: { value: 'published' },
    ARCHIVED: { value: 'archived' }
  }
});

const SectionTypeEnum = new GraphQLEnumType({
  name: 'SectionType',
  values: {
    INTRO: { value: 'intro' },
    VERSE: { value: 'verse' },
    CHORUS: { value: 'chorus' },
    BRIDGE: { value: 'bridge' },
    OUTRO: { value: 'outro' },
    PRE_CHORUS: { value: 'pre_chorus' },
    POST_CHORUS: { value: 'post_chorus' },
    INSTRUMENTAL: { value: 'instrumental' },
    CUSTOM: { value: 'custom' }
  }
});

const CollaboratorRoleEnum = new GraphQLEnumType({
  name: 'CollaboratorRole',
  values: {
    OWNER: { value: 'owner' },
    ADMIN: { value: 'admin' },
    EDITOR: { value: 'editor' },
    VIEWER: { value: 'viewer' },
    SPECTATOR: { value: 'spectator' }
  }
});

const RemixVisibilityEnum = new GraphQLEnumType({
  name: 'RemixVisibility',
  values: {
    PUBLIC: { value: 'public' },
    PRIVATE: { value: 'private' },
    UNLISTED: { value: 'unlisted' }
  }
});

const SparkTransactionTypeEnum = new GraphQLEnumType({
  name: 'SparkTransactionType',
  values: {
    EARNED: { value: 'earned' },
    SPENT: { value: 'spent' },
    BONUS: { value: 'bonus' },
    REFUND: { value: 'refund' },
    PURCHASE: { value: 'purchase' }
  }
});

// =====================================================
// OBJECT TYPES
// =====================================================

const SongSectionType = new GraphQLObjectType({
  name: 'SongSection',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    songId: { type: GraphQLNonNull(GraphQLID) },
    sectionType: { type: GraphQLNonNull(SectionTypeEnum) },
    orderIndex: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLString },
    durationMs: { type: GraphQLInt },
    repeatCount: { type: GraphQLInt },
    lyrics: {
      type: GraphQLList(LyricLineType),
      resolve: async (parent) => {
        return db.selectFrom('lyrics')
          .where('section_id', '=', parent.id)
          .orderBy('line_number', 'asc')
          .selectAll()
          .execute();
      }
    },
    melody: {
      type: MelodySegmentType,
      resolve: async (parent) => {
        return db.selectFrom('melodies')
          .where('section_id', '=', parent.id)
          .selectAll()
          .executeTakeFirst();
      }
    },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime }
  })
});

const LyricLineType = new GraphQLObjectType({
  name: 'LyricLine',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    songId: { type: GraphQLNonNull(GraphQLID) },
    sectionId: { type: GraphQLID },
    lineNumber: { type: GraphQLNonNull(GraphQLInt) },
    text: { type: GraphQLNonNull(GraphQLString) },
    syllableCount: { type: GraphQLInt },
    rhymeScheme: { type: GraphQLString },
    emphasisPattern: { type: GraphQLString },
    timingMs: { type: GraphQLInt },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime }
  }
});

const MelodySegmentType = new GraphQLObjectType({
  name: 'MelodySegment',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    songId: { type: GraphQLNonNull(GraphQLID) },
    sectionId: { type: GraphQLID },
    segmentIndex: { type: GraphQLNonNull(GraphQLInt) },
    pitchSequence: { type: GraphQLString }, // JSON string
    rhythmPattern: { type: GraphQLString }, // JSON string
    chordProgression: { type: GraphQLString },
    dynamics: { type: GraphQLString }, // JSON string
    articulation: { type: GraphQLString }, // JSON string
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime }
  }
});

const SongStatsType = new GraphQLObjectType({
  name: 'SongStats',
  fields: {
    playCount: { type: GraphQLInt },
    likeCount: { type: GraphQLInt },
    shareCount: { type: GraphQLInt },
    remixCount: { type: GraphQLInt }
  }
});

const SongType = new GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(SongStatusEnum) },
    genre: { type: GraphQLString },
    tempo: { type: GraphQLInt },
    key: { type: GraphQLString },
    timeSignature: { type: GraphQLString },
    mood: { type: GraphQLString },
    maskId: { type: GraphQLString },
    version: { type: GraphQLInt },
    parentVersionId: { type: GraphQLID },
    profitTier: { type: GraphQLString },
    computeCost: { type: GraphQLFloat },
    revenueGenerated: { type: GraphQLFloat },
    sections: {
      type: GraphQLList(SongSectionType),
      resolve: async (parent) => {
        return db.selectFrom('song_sections')
          .where('song_id', '=', parent.id)
          .orderBy('order_index', 'asc')
          .selectAll()
          .execute();
      }
    },
    lyrics: {
      type: GraphQLList(LyricLineType),
      resolve: async (parent) => {
        return db.selectFrom('lyrics')
          .where('song_id', '=', parent.id)
          .orderBy('line_number', 'asc')
          .selectAll()
          .execute();
      }
    },
    melody: {
      type: GraphQLList(MelodySegmentType),
      resolve: async (parent) => {
        return db.selectFrom('melodies')
          .where('song_id', '=', parent.id)
          .orderBy('segment_index', 'asc')
          .selectAll()
          .execute();
      }
    },
    stats: {
      type: SongStatsType,
      resolve: (parent) => ({
        playCount: parent.playCount,
        likeCount: parent.likeCount,
        shareCount: parent.shareCount,
        remixCount: parent.remixCount
      })
    },
    collaborationSession: {
      type: CollaborationSessionType,
      resolve: async (parent) => {
        return db.selectFrom('collaboration_sessions')
          .where('song_id', '=', parent.id)
          .where('status', '=', 'active')
          .selectAll()
          .executeTakeFirst();
      }
    },
    remixes: {
      type: GraphQLList(RemixType),
      resolve: async (parent) => {
        return db.selectFrom('remixes')
          .where('original_song_id', '=', parent.id)
          .where('status', '=', 'published')
          .selectAll()
          .execute();
      }
    },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    publishedAt: { type: GraphQLDateTime }
  })
});

const CollaboratorType = new GraphQLObjectType({
  name: 'Collaborator',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLID) },
    sessionId: { type: GraphQLNonNull(GraphQLID) },
    role: { type: GraphQLNonNull(CollaboratorRoleEnum) },
    permissions: { type: GraphQLString }, // JSON string
    color: { type: GraphQLString },
    joinedAt: { type: GraphQLDateTime },
    leftAt: { type: GraphQLDateTime },
    isActive: { type: GraphQLBoolean },
    editCount: { type: GraphQLInt }
  }
});

const CollaborationSessionType = new GraphQLObjectType({
  name: 'CollaborationSession',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    songId: { type: GraphQLNonNull(GraphQLID) },
    hostId: { type: GraphQLNonNull(GraphQLID) },
    sessionCode: { type: GraphQLString },
    status: { type: GraphQLString },
    maxCollaborators: { type: GraphQLInt },
    allowSpectators: { type: GraphQLBoolean },
    autoSave: { type: GraphQLBoolean },
    requireApproval: { type: GraphQLBoolean },
    currentVersion: { type: GraphQLInt },
    collaborators: {
      type: GraphQLList(CollaboratorType),
      resolve: async (parent) => {
        return db.selectFrom('session_collaborators')
          .where('session_id', '=', parent.id)
          .selectAll()
          .execute();
      }
    },
    song: {
      type: SongType,
      resolve: async (parent) => {
        return db.selectFrom('songs')
          .where('id', '=', parent.songId)
          .selectAll()
          .executeTakeFirst();
      }
    },
    startedAt: { type: GraphQLDateTime },
    endedAt: { type: GraphQLDateTime }
  })
});

const RemixType = new GraphQLObjectType({
  name: 'Remix',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    originalSongId: { type: GraphQLNonNull(GraphQLID) },
    remixSongId: { type: GraphQLNonNull(GraphQLID) },
    remixerId: { type: GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLString },
    visibility: { type: RemixVisibilityEnum },
    allowFurtherRemix: { type: GraphQLBoolean },
    creditOriginal: { type: GraphQLBoolean },
    splitRevenue: { type: GraphQLBoolean },
    revenueShare: { type: GraphQLFloat },
    lineageDepth: { type: GraphQLInt },
    originalSong: {
      type: SongType,
      resolve: async (parent) => {
        return db.selectFrom('songs')
          .where('id', '=', parent.originalSongId)
          .selectAll()
          .executeTakeFirst();
      }
    },
    remixSong: {
      type: SongType,
      resolve: async (parent) => {
        return db.selectFrom('songs')
          .where('id', '=', parent.remixSongId)
          .selectAll()
          .executeTakeFirst();
      }
    },
    stats: {
      type: SongStatsType,
      resolve: (parent) => ({
        playCount: parent.playCount,
        likeCount: parent.likeCount,
        shareCount: parent.shareCount,
        remixCount: parent.furtherRemixCount
      })
    },
    createdAt: { type: GraphQLDateTime },
    publishedAt: { type: GraphQLDateTime }
  })
});

const SparkBalanceType = new GraphQLObjectType({
  name: 'SparkBalance',
  fields: {
    userId: { type: GraphQLNonNull(GraphQLID) },
    available: { type: GraphQLNonNull(GraphQLInt) },
    pending: { type: GraphQLInt },
    lifetime: { type: GraphQLInt },
    tier: { type: GraphQLString },
    lastUpdated: { type: GraphQLDateTime }
  }
});

const SparkTransactionType = new GraphQLObjectType({
  name: 'SparkTransaction',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLID) },
    type: { type: GraphQLNonNull(SparkTransactionTypeEnum) },
    amount: { type: GraphQLNonNull(GraphQLInt) },
    balanceAfter: { type: GraphQLNonNull(GraphQLInt) },
    source: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    timestamp: { type: GraphQLDateTime }
  }
});

const DashboardStatsType = new GraphQLObjectType({
  name: 'DashboardStats',
  fields: {
    totalSongs: { type: GraphQLInt },
    totalCollaborations: { type: GraphQLInt },
    totalRemixes: { type: GraphQLInt },
    totalPlays: { type: GraphQLInt },
    totalRevenue: { type: GraphQLFloat },
    monthlyRevenue: { type: GraphQLFloat },
    engagementRate: { type: GraphQLFloat },
    trendingScore: { type: GraphQLFloat }
  }
});

const NotificationType = new GraphQLObjectType({
  name: 'Notification',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLID) },
    type: { type: GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLNonNull(GraphQLString) },
    message: { type: GraphQLNonNull(GraphQLString) },
    priority: { type: GraphQLString },
    actionUrl: { type: GraphQLString },
    actionLabel: { type: GraphQLString },
    read: { type: GraphQLBoolean },
    readAt: { type: GraphQLDateTime },
    createdAt: { type: GraphQLDateTime },
    expiresAt: { type: GraphQLDateTime }
  }
});

const ProfitabilityMetricType = new GraphQLObjectType({
  name: 'ProfitabilityMetric',
  fields: {
    time: { type: GraphQLDateTime },
    metricType: { type: GraphQLString },
    tierId: { type: GraphQLString },
    value: { type: GraphQLFloat },
    targetValue: { type: GraphQLFloat },
    variance: { type: GraphQLFloat }
  }
});

// =====================================================
// INPUT TYPES
// =====================================================

const CreateSongInput = new GraphQLInputObjectType({
  name: 'CreateSongInput',
  fields: {
    title: { type: GraphQLNonNull(GraphQLString) },
    genre: { type: GraphQLString },
    tempo: { type: GraphQLInt },
    key: { type: GraphQLString },
    mood: { type: GraphQLString },
    maskId: { type: GraphQLString }
  }
});

const UpdateSongInput = new GraphQLInputObjectType({
  name: 'UpdateSongInput',
  fields: {
    title: { type: GraphQLString },
    status: { type: SongStatusEnum },
    genre: { type: GraphQLString },
    tempo: { type: GraphQLInt },
    key: { type: GraphQLString },
    mood: { type: GraphQLString }
  }
});

const GenerateLyricsInput = new GraphQLInputObjectType({
  name: 'GenerateLyricsInput',
  fields: {
    songId: { type: GraphQLNonNull(GraphQLID) },
    sectionId: { type: GraphQLID },
    prompt: { type: GraphQLString },
    style: { type: GraphQLString },
    mood: { type: GraphQLString },
    maskId: { type: GraphQLString }
  }
});

const GenerateMelodyInput = new GraphQLInputObjectType({
  name: 'GenerateMelodyInput',
  fields: {
    songId: { type: GraphQLNonNull(GraphQLID) },
    sectionId: { type: GraphQLID },
    style: { type: GraphQLString },
    tempo: { type: GraphQLInt },
    key: { type: GraphQLString }
  }
});

const CreateCollaborationInput = new GraphQLInputObjectType({
  name: 'CreateCollaborationInput',
  fields: {
    songId: { type: GraphQLNonNull(GraphQLID) },
    maxCollaborators: { type: GraphQLInt },
    allowSpectators: { type: GraphQLBoolean },
    requireApproval: { type: GraphQLBoolean }
  }
});

const CreateRemixInput = new GraphQLInputObjectType({
  name: 'CreateRemixInput',
  fields: {
    originalSongId: { type: GraphQLNonNull(GraphQLID) },
    visibility: { type: RemixVisibilityEnum },
    allowFurtherRemix: { type: GraphQLBoolean },
    splitRevenue: { type: GraphQLBoolean },
    revenueShare: { type: GraphQLFloat }
  }
});

// =====================================================
// QUERIES
// =====================================================

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Song queries
    song: {
      type: SongType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { id }, context) => {
        return db.selectFrom('songs')
          .where('id', '=', id)
          .where('user_id', '=', context.userId)
          .selectAll()
          .executeTakeFirst();
      }
    },
    
    songs: {
      type: GraphQLList(SongType),
      args: {
        status: { type: SongStatusEnum },
        genre: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (_, args, context) => {
        let query = db.selectFrom('songs')
          .where('user_id', '=', context.userId)
          .where('deleted_at', 'is', null);
        
        if (args.status) {
          query = query.where('status', '=', args.status);
        }
        if (args.genre) {
          query = query.where('genre', '=', args.genre);
        }
        
        query = query.orderBy('created_at', 'desc');
        
        if (args.limit) {
          query = query.limit(args.limit);
        }
        if (args.offset) {
          query = query.offset(args.offset);
        }
        
        return query.selectAll().execute();
      }
    },
    
    // Collaboration queries
    collaborationSession: {
      type: CollaborationSessionType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { id }) => {
        return db.selectFrom('collaboration_sessions')
          .where('id', '=', id)
          .selectAll()
          .executeTakeFirst();
      }
    },
    
    activeSessions: {
      type: GraphQLList(CollaborationSessionType),
      resolve: async (_, __, context) => {
        return db.selectFrom('collaboration_sessions as cs')
          .innerJoin('session_collaborators as sc', 'cs.id', 'sc.session_id')
          .where('sc.user_id', '=', context.userId)
          .where('cs.status', '=', 'active')
          .select('cs.*')
          .execute();
      }
    },
    
    // Remix queries
    remix: {
      type: RemixType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { id }) => {
        return db.selectFrom('remixes')
          .where('id', '=', id)
          .selectAll()
          .executeTakeFirst();
      }
    },
    
    remixFeed: {
      type: GraphQLList(RemixType),
      args: {
        genre: { type: GraphQLString },
        sortBy: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (_, args) => {
        let query = db.selectFrom('remixes')
          .where('visibility', '=', 'public')
          .where('status', '=', 'published');
        
        // Add sorting
        if (args.sortBy === 'trending') {
          query = query.orderBy('play_count', 'desc');
        } else {
          query = query.orderBy('created_at', 'desc');
        }
        
        if (args.limit) {
          query = query.limit(args.limit);
        }
        if (args.offset) {
          query = query.offset(args.offset);
        }
        
        return query.selectAll().execute();
      }
    },
    
    // Spark queries
    sparkBalance: {
      type: SparkBalanceType,
      resolve: async (_, __, context) => {
        return db.selectFrom('spark_balances')
          .where('user_id', '=', context.userId)
          .selectAll()
          .executeTakeFirst();
      }
    },
    
    sparkTransactions: {
      type: GraphQLList(SparkTransactionType),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (_, args, context) => {
        let query = db.selectFrom('spark_transactions')
          .where('user_id', '=', context.userId)
          .orderBy('timestamp', 'desc');
        
        if (args.limit) {
          query = query.limit(args.limit);
        }
        if (args.offset) {
          query = query.offset(args.offset);
        }
        
        return query.selectAll().execute();
      }
    },
    
    // Dashboard queries
    dashboardStats: {
      type: DashboardStatsType,
      resolve: async (_, __, context) => {
        const dashboard = await dashboardEngine.getDashboard(context.userId);
        return dashboard.stats;
      }
    },
    
    notifications: {
      type: GraphQLList(NotificationType),
      args: {
        unreadOnly: { type: GraphQLBoolean },
        limit: { type: GraphQLInt }
      },
      resolve: async (_, args, context) => {
        let query = db.selectFrom('notifications')
          .where('user_id', '=', context.userId);
        
        if (args.unreadOnly) {
          query = query.where('read', '=', false);
        }
        
        query = query.orderBy('created_at', 'desc');
        
        if (args.limit) {
          query = query.limit(args.limit);
        }
        
        return query.selectAll().execute();
      }
    },
    
    // Profitability queries
    profitabilityMetrics: {
      type: GraphQLList(ProfitabilityMetricType),
      args: {
        metricType: { type: GraphQLString },
        days: { type: GraphQLInt }
      },
      resolve: async (_, args) => {
        const since = new Date(Date.now() - (args.days || 7) * 24 * 60 * 60 * 1000);
        
        let query = db.selectFrom('profitability_metrics')
          .where('time', '>', since);
        
        if (args.metricType) {
          query = query.where('metric_type', '=', args.metricType);
        }
        
        return query.orderBy('time', 'desc').selectAll().execute();
      }
    }
  }
});

// =====================================================
// MUTATIONS
// =====================================================

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Song mutations
    createSong: {
      type: SongType,
      args: {
        input: { type: GraphQLNonNull(CreateSongInput) }
      },
      resolve: async (_, { input }, context) => {
        const song = await songStructureEngine.createSong(input);
        
        const [savedSong] = await db.insertInto('songs')
          .values({
            id: song.id,
            user_id: context.userId,
            title: input.title,
            status: 'draft',
            genre: input.genre,
            tempo: input.tempo,
            key: input.key,
            mood: input.mood,
            mask_id: input.maskId,
            version: 1,
            profit_tier: 'free',
            compute_cost: 0,
            revenue_generated: 0,
            play_count: 0,
            like_count: 0,
            share_count: 0,
            remix_count: 0,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returningAll()
          .execute();
        
        // Publish to subscriptions
        pubsub.publish('SONG_CREATED', { songCreated: savedSong });
        
        return savedSong;
      }
    },
    
    updateSong: {
      type: SongType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        input: { type: GraphQLNonNull(UpdateSongInput) }
      },
      resolve: async (_, { id, input }, context) => {
        const updates: any = { updated_at: new Date() };
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            updates[key] = input[key];
          }
        });
        
        const [updatedSong] = await db.updateTable('songs')
          .set(updates)
          .where('id', '=', id)
          .where('user_id', '=', context.userId)
          .returningAll()
          .execute();
        
        // Publish to subscriptions
        pubsub.publish('SONG_UPDATED', { songUpdated: updatedSong });
        
        return updatedSong;
      }
    },
    
    deleteSong: {
      type: GraphQLBoolean,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { id }, context) => {
        const result = await db.updateTable('songs')
          .set({ deleted_at: new Date() })
          .where('id', '=', id)
          .where('user_id', '=', context.userId)
          .execute();
        
        return result.length > 0;
      }
    },
    
    // AI generation mutations
    generateLyrics: {
      type: GraphQLList(LyricLineType),
      args: {
        input: { type: GraphQLNonNull(GenerateLyricsInput) }
      },
      resolve: async (_, { input }, context) => {
        // Check Spark balance
        const sparkCost = await sparkIntegration.calculateSparkCost('ai_generation');
        if (!await sparkIntegration.canAfford(context.userId, sparkCost)) {
          throw new Error('Insufficient Sparks');
        }
        
        // Generate lyrics
        const lyrics = await lyricMelodyEngine.generateLyrics(input);
        
        // Save to database
        const savedLyrics = [];
        for (const lyric of lyrics) {
          const [saved] = await db.insertInto('lyrics')
            .values({
              id: lyric.id,
              song_id: input.songId,
              section_id: input.sectionId,
              line_number: lyric.lineNumber,
              text: lyric.text,
              syllable_count: lyric.syllableCount,
              rhyme_scheme: lyric.rhymeScheme,
              created_at: new Date(),
              updated_at: new Date()
            })
            .returningAll()
            .execute();
          savedLyrics.push(saved);
        }
        
        // Deduct Sparks
        await sparkIntegration.deductSparks(context.userId, sparkCost, 'lyric_generation');
        
        return savedLyrics;
      }
    },
    
    generateMelody: {
      type: MelodySegmentType,
      args: {
        input: { type: GraphQLNonNull(GenerateMelodyInput) }
      },
      resolve: async (_, { input }, context) => {
        // Check Spark balance
        const sparkCost = await sparkIntegration.calculateSparkCost('ai_generation');
        if (!await sparkIntegration.canAfford(context.userId, sparkCost)) {
          throw new Error('Insufficient Sparks');
        }
        
        // Generate melody
        const melody = await lyricMelodyEngine.generateMelody(input);
        
        // Save to database
        const [savedMelody] = await db.insertInto('melodies')
          .values({
            id: melody.id,
            song_id: input.songId,
            section_id: input.sectionId,
            segment_index: melody.segmentIndex,
            pitch_sequence: JSON.stringify(melody.pitchSequence),
            rhythm_pattern: JSON.stringify(melody.rhythmPattern),
            chord_progression: melody.chordProgression,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returningAll()
          .execute();
        
        // Deduct Sparks
        await sparkIntegration.deductSparks(context.userId, sparkCost, 'melody_generation');
        
        return savedMelody;
      }
    },
    
    // Collaboration mutations
    createCollaboration: {
      type: CollaborationSessionType,
      args: {
        input: { type: GraphQLNonNull(CreateCollaborationInput) }
      },
      resolve: async (_, { input }, context) => {
        const session = await collaborationEngine.createSession(
          input.songId,
          context.userId,
          input
        );
        
        // Save to database
        await db.insertInto('collaboration_sessions')
          .values({
            id: session.id,
            song_id: input.songId,
            host_id: context.userId,
            session_code: session.id.substr(-8),
            status: 'active',
            max_collaborators: input.maxCollaborators || 10,
            allow_spectators: input.allowSpectators !== false,
            auto_save: true,
            require_approval: input.requireApproval || false,
            conflict_resolution: 'last-write-wins',
            version_interval: 60000,
            current_version: 1,
            started_at: new Date()
          })
          .execute();
        
        // Publish to subscriptions
        pubsub.publish('COLLABORATION_STARTED', { collaborationStarted: session });
        
        return session;
      }
    },
    
    joinCollaboration: {
      type: CollaborationSessionType,
      args: {
        sessionId: { type: GraphQLNonNull(GraphQLID) },
        inviteCode: { type: GraphQLString }
      },
      resolve: async (_, { sessionId, inviteCode }, context) => {
        const session = await collaborationEngine.joinSession(
          sessionId,
          context.userId,
          inviteCode
        );
        
        // Publish to subscriptions
        pubsub.publish('COLLABORATOR_JOINED', { 
          collaboratorJoined: {
            sessionId,
            userId: context.userId
          }
        });
        
        return session;
      }
    },
    
    // Remix mutations
    createRemix: {
      type: RemixType,
      args: {
        input: { type: GraphQLNonNull(CreateRemixInput) }
      },
      resolve: async (_, { input }, context) => {
        const remix = await collaborationEngine.createRemix(
          input.originalSongId,
          context.userId,
          input
        );
        
        // Publish to subscriptions
        pubsub.publish('REMIX_CREATED', { remixCreated: remix });
        
        return remix;
      }
    },
    
    // Notification mutations
    markNotificationRead: {
      type: NotificationType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { id }, context) => {
        const [updated] = await db.updateTable('notifications')
          .set({ 
            read: true,
            read_at: new Date()
          })
          .where('id', '=', id)
          .where('user_id', '=', context.userId)
          .returningAll()
          .execute();
        
        return updated;
      }
    }
  }
});

// =====================================================
// SUBSCRIPTIONS
// =====================================================

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    // Song subscriptions
    songCreated: {
      type: SongType,
      subscribe: () => pubsub.asyncIterator(['SONG_CREATED'])
    },
    
    songUpdated: {
      type: SongType,
      args: {
        songId: { type: GraphQLID }
      },
      subscribe: (_, { songId }) => {
        if (songId) {
          return pubsub.asyncIterator([`SONG_UPDATED_${songId}`]);
        }
        return pubsub.asyncIterator(['SONG_UPDATED']);
      }
    },
    
    // Collaboration subscriptions
    collaborationStarted: {
      type: CollaborationSessionType,
      subscribe: () => pubsub.asyncIterator(['COLLABORATION_STARTED'])
    },
    
    collaboratorJoined: {
      type: new GraphQLObjectType({
        name: 'CollaboratorJoinedEvent',
        fields: {
          sessionId: { type: GraphQLID },
          userId: { type: GraphQLID }
        }
      }),
      args: {
        sessionId: { type: GraphQLNonNull(GraphQLID) }
      },
      subscribe: (_, { sessionId }) => 
        pubsub.asyncIterator([`COLLABORATOR_JOINED_${sessionId}`])
    },
    
    editApplied: {
      type: new GraphQLObjectType({
        name: 'EditEvent',
        fields: {
          sessionId: { type: GraphQLID },
          userId: { type: GraphQLID },
          editType: { type: GraphQLString },
          data: { type: GraphQLString }
        }
      }),
      args: {
        sessionId: { type: GraphQLNonNull(GraphQLID) }
      },
      subscribe: (_, { sessionId }) => 
        pubsub.asyncIterator([`EDIT_APPLIED_${sessionId}`])
    },
    
    // Remix subscriptions
    remixCreated: {
      type: RemixType,
      args: {
        originalSongId: { type: GraphQLID }
      },
      subscribe: (_, { originalSongId }) => {
        if (originalSongId) {
          return pubsub.asyncIterator([`REMIX_CREATED_${originalSongId}`]);
        }
        return pubsub.asyncIterator(['REMIX_CREATED']);
      }
    },
    
    // Notification subscriptions
    notificationReceived: {
      type: NotificationType,
      subscribe: (_, __, context) => 
        pubsub.asyncIterator([`NOTIFICATION_${context.userId}`])
    }
  }
});

// =====================================================
// SCHEMA
// =====================================================

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType
});

// Export pubsub for external use
export { pubsub };

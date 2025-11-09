/**
 * Angry Lips Mad Libs Session - Proper Mad Libs game
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';
import { CreatorInviteList } from './CreatorInviteList';
import { StoryFaithfulConverter as StoryConverter, type ConversionOption } from './StoryFaithfulConverter';
import { CollaborativeChat } from '../chat/CollaborativeChat';
import { useSparks } from '../sparks/SparksContext';
import { COMEDY_TEMPLATES, getTemplatesByLength, type StoryTemplate } from '../../lib/angryLipsTemplates';
import { GrokGenerationModal } from './GrokGenerationModal';

interface MadLibsBlank {
  id: number;
  type: string;
  description?: string;
  userInput?: string;
}

interface MadLibsStory {
  title: string;
  genre: string;
  template: string;
  blanks: MadLibsBlank[];
}

interface AngryLipsMadLibsSessionProps {
  sessionId: string;
  genre: string;
  maxPlayers: number;
  host: string;
  playerNames?: string[];
  onNavigate: (view: FocusedView) => void;
  onEndSession: () => void;
  customStoryPrompt?: string;
  customNames?: string[];
  timerMode?: 'rapid' | 'normal' | 'relaxed' | 'none';
  isOnlineOnly?: boolean;
  storyLength?: 'micro' | 'short' | 'medium' | 'long';
  resumeData?: any;
}

export const AngryLipsMadLibsSession: React.FC<AngryLipsMadLibsSessionProps> = ({
  sessionId,
  genre,
  maxPlayers,
  host,
  playerNames: providedPlayerNames = [],
  onNavigate,
  onEndSession,
  customStoryPrompt,
  customNames = [],
  timerMode = 'normal',
  isOnlineOnly = false,
  storyLength = 'medium',
  resumeData
}) => {
  // Timer settings based on mode
  const timerSettings = {
    rapid: 15,    // 15 seconds for rapid play
    normal: 30,   // 30 seconds for normal play
    relaxed: 60,  // 60 seconds for relaxed play
    none: 0,      // No timer
  };

  const [currentBlankIndex, setCurrentBlankIndex] = useState(resumeData?.currentBlankIndex || 0);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timerSettings[timerMode]);
  const [isInCooloff, setIsInCooloff] = useState(false);
  const [cooloffTime, setCooloffTime] = useState(0);
  const [gamePhase, setGamePhase] = useState<'filling' | 'reveal'>(resumeData?.gamePhase || 'filling');
  const [players, setPlayers] = useState<string[]>(resumeData?.players || (providedPlayerNames.length > 0 ? providedPlayerNames : [host]));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(resumeData?.currentPlayerIndex || 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isGameLocked, setIsGameLocked] = useState(false);
  const [showInviteList, setShowInviteList] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showGrokModal, setShowGrokModal] = useState(false);
  const [conversions, setConversions] = useState<Array<{format: ConversionOption, story: string}>>([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [exitingPlayers, setExitingPlayers] = useState<Set<string>>(new Set());
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [showNameInput, setShowNameInput] = useState(!isOnlineOnly);
  const [wordContributions, setWordContributions] = useState<Array<{word: string, contributor: string, wordType: string}>>(resumeData?.wordContributions || []);
  
  // Visual dynamics and gamification
  const [streak, setStreak] = useState(resumeData?.streak || 0);
  const [totalPoints, setTotalPoints] = useState(resumeData?.totalPoints || 0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [lastResponseTime, setLastResponseTime] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [wordQuality, setWordQuality] = useState<'boring' | 'good' | 'amazing' | ''>('');
  const [backgroundIntensity, setBackgroundIntensity] = useState(0);

  // Story selection state
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  // REVOLUTIONARY word types - no boring grammar terms!
  const stories: Record<string, MadLibsStory[]> = {
    Comedy: [
      {
        title: "Social Media Meltdown", 
        genre: "Comedy",
        template: `Last {TIME_PHRASE}, I was at {PLACE} trying to {VERB_ING}. Everything was fine until my {FAMILY_MEMBER} decided to post about my {EMBARRASSING_THING} on {SOCIAL_MEDIA}. 

Within {TIME_AMOUNT}, it had {BIG_NUMBER} likes. I was wearing my {CLOTHING} when I accidentally {VERB_PAST} right in front of {CELEBRITY}. 

The comments exploded with people saying "{SLANG_PHRASE}!" My {RELATIONSHIP} texted me "{TEXT_MESSAGE}" with {NUMBER_PHRASE} {EMOJI} emojis. 

Then {FAMOUS_PERSON} shared it while {VERB_ING_2} a {FOOD}. The video started trending with #{HASHTAG}.

My {OLDER_RELATIVE} found it and shared it to their {WEBSITE} group. They captioned it "{OLD_PERSON_QUOTE}". 

Someone turned my {ADJECTIVE} face into a {OLD_TREND} meme. It got {HUGE_NUMBER} reposts in one day.

The algorithm showed it to people who like {WEIRD_HOBBY}. Even worse, it reached fans of {ANOTHER_HOBBY}. 

{INTERNET_CELEBRITY} commented "{ANNOYING_PHRASE}" which made my {BODY_PART} start {VERB_ING_3}.

By {TIME_PHRASE_2}, I had {HUGE_NUMBER_2} notifications. My {APP} crashed {NUMBER_2} times. 

My {AUTHORITY_FIGURE} saw everything and said "{MEAN_COMMENT}". I tried to delete it but someone had {VERB_PAST_2} it to {WEBSITE_2}. 

Now everyone knows me as the person who {EMBARRASSING_ACTION}. But hey, I got {SMALL_NUMBER} sponsorship offers from {COMPANY}!`,
        blanks: [
          { id: 1, type: "TIME_PHRASE", description: "TIME WHEN something happened (last Tuesday, during lunch, at 3am)" },
          { id: 2, type: "PLACE", description: "PLACE/LOCATION (Walmart, the gym, my ex's house)" },
          { id: 3, type: "VERB_ING", description: "VERB ending in -ING (trying, attempting, pretending)" },
          { id: 4, type: "FAMILY_MEMBER", description: "FAMILY MEMBER or RELATIVE (drunk uncle, stepmom, weird cousin)" },
          { id: 5, type: "EMBARRASSING_THING", description: "EMBARRASSING THING you own/do (anime collection, diary, stuffed animals)" },
          { id: 6, type: "SOCIAL_MEDIA", description: "SOCIAL MEDIA PLATFORM (TikTok, Instagram, Twitter)" },
          { id: 7, type: "BIG_NUMBER", description: "HUGE NUMBER (69,420, a million, 9000)" },
          { id: 8, type: "TIME_AMOUNT", description: "AMOUNT OF TIME (30 seconds, 2 minutes, instantly)" },
          { id: 9, type: "CLOTHING", description: "PIECE OF CLOTHING or OUTFIT (hoodie, Crocs, pajamas)" },
          { id: 10, type: "VERB_PAST", description: "PAST TENSE VERB - something you did (cried, fell, screamed)" },
          { id: 11, type: "CELEBRITY", description: "CELEBRITY NAME (Ryan Reynolds, Beyoncé, Danny DeVito)" },
          { id: 12, type: "SLANG_PHRASE", description: "SLANG or CATCHPHRASE (no cap, slay queen, it's giving...)" },
          { id: 13, type: "RELATIONSHIP", description: "TYPE OF RELATIONSHIP (ex, crush, situationship)" },
          { id: 14, type: "TEXT_MESSAGE", description: "CRAZY TEXT MESSAGE (we need to talk, I miss you, where are you?)" },
          { id: 15, type: "NUMBER_PHRASE", description: "NUMBER with DESCRIPTION (47 times, too many, infinity)" },
          { id: 16, type: "EMOJI", description: "EMOJI NAME (eggplant, crying face, fire)" },
          { id: 17, type: "HASHTAG", description: "HASHTAG without # (MainCharacter, Cringe, Blessed)" },
          { id: 18, type: "FAMOUS_PERSON", description: "ANOTHER CELEBRITY (pick someone different)" },
          { id: 19, type: "VERB_ING_2", description: "VERB ending in -ING (dancing, flexing, posing)" },
          { id: 20, type: "FOOD", description: "FOOD ITEM (pizza, sushi, hot dogs)" },
          { id: 21, type: "OLDER_RELATIVE", description: "OLDER RELATIVE (grandpa, aunt, boomer parent)" },
          { id: 22, type: "WEBSITE", description: "WEBSITE or APP (Facebook, Reddit, YouTube)" },
          { id: 23, type: "OLD_PERSON_QUOTE", description: "SOMETHING AN OLD PERSON WOULD SAY (back in my day..., kids these days...)" },
          { id: 24, type: "OLD_TREND", description: "OUTDATED TREND (planking, ice bucket challenge, Harlem Shake)" },
          { id: 25, type: "ADJECTIVE", description: "ADJECTIVE - describing word (embarrassed, dead, cooked)" },
          { id: 26, type: "HUGE_NUMBER", description: "RIDICULOUS NUMBER (420,069, a billion, all of them)" },
          { id: 27, type: "WEIRD_HOBBY", description: "UNUSUAL HOBBY (collecting stamps, bird watching, Reddit)" },
          { id: 28, type: "ANOTHER_HOBBY", description: "ANOTHER WEIRD HOBBY (different from above)" },
          { id: 29, type: "INTERNET_CELEBRITY", description: "INTERNET FAMOUS PERSON (influencer, YouTuber, streamer)" },
          { id: 30, type: "ANNOYING_PHRASE", description: "ANNOYING CATCHPHRASE (YOLO, lit fam, poggers)" },
          { id: 31, type: "BODY_PART", description: "BODY PART (arm, nose, knee)" },
          { id: 32, type: "VERB_ING_3", description: "VERB ending in -ING (twitching, shaking, sweating)" },
          { id: 33, type: "TIME_PHRASE_2", description: "ANOTHER TIME (next morning, by midnight, after dinner)" },
          { id: 34, type: "HUGE_NUMBER_2", description: "ANOTHER BIG NUMBER (different from before)" },
          { id: 35, type: "APP", description: "PHONE APP (Instagram, TikTok, banking app)" },
          { id: 36, type: "NUMBER_2", description: "NUMBER (17, too many, a hundred)" },
          { id: 37, type: "AUTHORITY_FIGURE", description: "PERSON IN CHARGE (boss, teacher, parent)" },
          { id: 38, type: "MEAN_COMMENT", description: "MEAN THING TO SAY (you're fired, I'm disappointed, that's embarrassing)" },
          { id: 39, type: "VERB_PAST_2", description: "PAST TENSE VERB (saved, copied, shared)" },
          { id: 40, type: "WEBSITE_2", description: "ANOTHER WEBSITE (different from before)" },
          { id: 41, type: "EMBARRASSING_ACTION", description: "EMBARRASSING THING YOU DID (fell down, cried in public, forgot my pants)" },
          { id: 42, type: "SMALL_NUMBER", description: "SMALL NUMBER (zero, three, negative one)" },
          { id: 43, type: "COMPANY", description: "COMPANY NAME (McDonald's, Amazon, a pyramid scheme)" },
        ]
      },
      {
        title: "Dating App Nightmare",
        genre: "Comedy",
        template: `I matched with {PERSON_TYPE} on {DATING_APP} who claimed to be a {FAKE_JOB}. Their profile pic was clearly {PHOTO_FILTER} from {TIME_PERIOD_AGO}. They suggested we meet at {SKETCHY_LOCATION} for {WEIRD_ACTIVITY}.

During our {DISASTER_LEVEL} date, they ordered {DISGUSTING_FOOD} and talked about their {RED_FLAG} for {TIME_TOO_LONG}. When the check came, they {CHEAP_MOVE} and said "{TERRIBLE_EXCUSE}". 

I escaped by pretending my {RANDOM_RELATIVE} was {FAKE_EMERGENCY}. They still sent me {MESSAGE_COUNT} texts including "{CRINGE_MESSAGE}" with {INAPPROPRIATE_EMOJI} emojis. Now they're {STALKER_BEHAVIOR} and my {SOCIAL_MEDIA} is full of {DESPERATE_ATTEMPT}.`,
        blanks: [
          { id: 1, type: "PERSON_TYPE", description: "Type of person (crypto bro, gym rat, etc)" },
          { id: 2, type: "DATING_APP", description: "Dating platform" },
          { id: 3, type: "FAKE_JOB", description: "Obviously fake job title" },
          { id: 4, type: "PHOTO_FILTER", description: "Heavy filter or edit" },
          { id: 5, type: "TIME_PERIOD_AGO", description: "How old the photo is" },
          { id: 6, type: "SKETCHY_LOCATION", description: "Weird place for first date" },
          { id: 7, type: "WEIRD_ACTIVITY", description: "Strange date activity" },
          { id: 8, type: "DISASTER_LEVEL", description: "How bad it was" },
          { id: 9, type: "DISGUSTING_FOOD", description: "Gross food choice" },
          { id: 10, type: "RED_FLAG", description: "Major warning sign" },
          { id: 11, type: "TIME_TOO_LONG", description: "Way too much time" },
          { id: 12, type: "CHEAP_MOVE", description: "Cheap thing they did" },
          { id: 13, type: "TERRIBLE_EXCUSE", description: "Bad excuse" },
          { id: 14, type: "RANDOM_RELATIVE", description: "Family member" },
          { id: 15, type: "FAKE_EMERGENCY", description: "Made up emergency" },
          { id: 16, type: "MESSAGE_COUNT", description: "Too many messages" },
          { id: 17, type: "CRINGE_MESSAGE", description: "Embarrassing text" },
          { id: 18, type: "INAPPROPRIATE_EMOJI", description: "Wrong emoji choice" },
          { id: 19, type: "STALKER_BEHAVIOR", description: "Creepy behavior" },
          { id: 20, type: "SOCIAL_MEDIA", description: "Social platform" },
          { id: 21, type: "DESPERATE_ATTEMPT", description: "Desperate action" },
        ]
      }
    ],
    Horror: [
      {
        title: "The Haunted Mansion Mystery",
        genre: "Horror",
        template: `It was a {ADJECTIVE} and {WEATHER_ADJECTIVE} night when I arrived at the old {LAST_NAME} mansion on {STREET_NAME} Street. The {ADJECTIVE_2} gate creaked as it opened, making a sound like "{SCARY_SOUND}". I had inherited this {ADJECTIVE_3} place from my {RELATIVE} who had died under {ADJECTIVE_4} circumstances.

As I entered the {ROOM}, I noticed {NUMBER} {PLURAL_NOUN} covered in {SUBSTANCE}. The air smelled like {ADJECTIVE_5} {FOOD} mixed with {LIQUID}. Suddenly, I heard {VERB_ING} coming from the {ROOM_2}. My {BODY_PART} started to {VERB} uncontrollably.

I grabbed a {TOOL} for protection and slowly climbed the {ADJECTIVE_6} stairs. Each step made a {SOUND} noise. At the top, I saw a {COLOR} door with "{MESSAGE}" written in what looked like {LIQUID_2}. Behind it, I could hear someone or something {VERB_ING_2}.

When I opened the door, a {ADJECTIVE_7} {MONSTER} jumped out holding a {WEAPON}! It had {NUMBER_2} {BODY_PART_PLURAL} and was wearing a {CLOTHING_ITEM}. "Get out!" it {VERB_PAST} in a {ADJECTIVE_8} voice. "This house belongs to the {PLURAL_CREATURE}!"

I {ADVERB} ran down to the {ROOM_3} where I found {CELEBRITY} hiding behind a {FURNITURE}. "I've been trapped here for {TIME_PERIOD}!" they whispered. Together, we discovered that the monster was actually {PERSON_NAME} wearing a {ADJECTIVE_9} costume.

The whole thing was a scheme to steal the {ADJECTIVE_10} {VALUABLE_OBJECT} hidden in the {ROOM_4}. We called the {OCCUPATION} and they arrived in {NUMBER_3} minutes. As we left, the house made one last {SCARY_SOUND_2} sound. I'll never forget that {ADJECTIVE_11} night!`,
        blanks: [
          { id: 1, type: "ADJECTIVE", description: "Describing word (dark, scary, etc.)" },
          { id: 2, type: "WEATHER_ADJECTIVE", description: "Weather description (stormy, foggy)" },
          { id: 3, type: "LAST_NAME", description: "A family name" },
          { id: 4, type: "STREET_NAME", description: "Name of a street" },
          { id: 5, type: "ADJECTIVE_2", description: "Describing word" },
          { id: 6, type: "SCARY_SOUND", description: "A scary noise" },
          { id: 7, type: "ADJECTIVE_3", description: "Describing word" },
          { id: 8, type: "RELATIVE", description: "Family member" },
          { id: 9, type: "ADJECTIVE_4", description: "Mysterious description" },
          { id: 10, type: "ROOM", description: "Room in a house" },
          { id: 11, type: "NUMBER", description: "Any number" },
          { id: 12, type: "PLURAL_NOUN", description: "More than one thing" },
          { id: 13, type: "SUBSTANCE", description: "Any substance (dust, slime, etc.)" },
          { id: 14, type: "ADJECTIVE_5", description: "Describing word" },
          { id: 15, type: "FOOD", description: "Something you eat" },
          { id: 16, type: "LIQUID", description: "Any liquid" },
          { id: 17, type: "VERB_ING", description: "Action ending in -ing" },
          { id: 18, type: "ROOM_2", description: "Another room" },
          { id: 19, type: "BODY_PART", description: "Part of the body" },
          { id: 20, type: "VERB", description: "Action word" },
          { id: 21, type: "TOOL", description: "Any tool or object" },
          { id: 22, type: "ADJECTIVE_6", description: "Describing word" },
          { id: 23, type: "SOUND", description: "Any sound" },
          { id: 24, type: "COLOR", description: "Any color" },
          { id: 25, type: "MESSAGE", description: "Short scary message" },
          { id: 26, type: "LIQUID_2", description: "Another liquid" },
          { id: 27, type: "VERB_ING_2", description: "Action ending in -ing" },
          { id: 28, type: "ADJECTIVE_7", description: "Scary description" },
          { id: 29, type: "MONSTER", description: "Type of monster" },
          { id: 30, type: "WEAPON", description: "Any weapon" },
          { id: 31, type: "NUMBER_2", description: "Another number" },
          { id: 32, type: "BODY_PART_PLURAL", description: "Body parts (plural)" },
          { id: 33, type: "CLOTHING_ITEM", description: "Piece of clothing" },
          { id: 34, type: "VERB_PAST", description: "Past tense action" },
          { id: 35, type: "ADJECTIVE_8", description: "Voice description" },
          { id: 36, type: "PLURAL_CREATURE", description: "Multiple creatures" },
          { id: 37, type: "ADVERB", description: "How you did it (-ly word)" },
          { id: 38, type: "ROOM_3", description: "Another room" },
          { id: 39, type: "CELEBRITY", description: "Famous person" },
          { id: 40, type: "FURNITURE", description: "Piece of furniture" },
          { id: 41, type: "TIME_PERIOD", description: "Length of time" },
          { id: 42, type: "PERSON_NAME", description: "Someone's name" },
          { id: 43, type: "ADJECTIVE_9", description: "Costume description" },
          { id: 44, type: "ADJECTIVE_10", description: "Valuable description" },
          { id: 45, type: "VALUABLE_OBJECT", description: "Something valuable" },
          { id: 46, type: "ROOM_4", description: "Final room" },
          { id: 47, type: "OCCUPATION", description: "Job title" },
          { id: 48, type: "NUMBER_3", description: "Number of minutes" },
          { id: 49, type: "SCARY_SOUND_2", description: "Final scary sound" },
          { id: 50, type: "ADJECTIVE_11", description: "Final description" },
        ]
      }
    ],
    'Sci-Fi': [
      {
        title: "Space Adventure",
        genre: "Sci-Fi",
        template: "In the year {NUMBER}, Captain {NAME} piloted the spaceship {NOUN} to planet {SILLY_WORD}. The {ADJECTIVE} aliens there had {NUMBER} {BODY_PART_PLURAL} and communicated by {VERB_ING}. They offered us {FOOD} that tasted like {FOOD}. Their leader, {TITLE} {SILLY_NAME}, wanted to trade {PLURAL_NOUN} for our {TECHNOLOGY}. We {ADVERB} agreed and {VERB_PAST} all the way back to {PLACE}.",
        blanks: [
          { id: 1, type: "NUMBER", description: "A year in the future" },
          { id: 2, type: "NAME", description: "Person's name" },
          { id: 3, type: "NOUN", description: "Name for a spaceship" },
          { id: 4, type: "SILLY_WORD", description: "Made-up planet name" },
          { id: 5, type: "ADJECTIVE", description: "Describing the aliens" },
          { id: 6, type: "NUMBER", description: "How many?" },
          { id: 7, type: "BODY_PART_PLURAL", description: "Body parts (plural)" },
          { id: 8, type: "VERB_ING", description: "Action ending in -ing" },
          { id: 9, type: "FOOD", description: "Alien food" },
          { id: 10, type: "FOOD", description: "Earth food" },
          { id: 11, type: "TITLE", description: "Royal title (King, Lord, etc.)" },
          { id: 12, type: "SILLY_NAME", description: "Funny alien name" },
          { id: 13, type: "PLURAL_NOUN", description: "Multiple items" },
          { id: 14, type: "TECHNOLOGY", description: "Piece of technology" },
          { id: 15, type: "ADVERB", description: "Word ending in -ly" },
          { id: 16, type: "VERB_PAST", description: "Past tense action" },
          { id: 17, type: "PLACE", description: "Location on Earth" },
        ]
      }
    ],
    Romance: [
      {
        title: "Love at First Sight",
        genre: "Romance",
        template: "When {NAME} first saw {NAME_2} at the {PLACE}, their {BODY_PART} skipped a beat. {NAME_2} was {VERB_ING} near the {FURNITURE} wearing a {ADJECTIVE} {CLOTHING}. '{EXCLAMATION},' {NAME} thought, 'they're more {ADJECTIVE} than {CELEBRITY}!' They {ADVERB} walked over and said, 'Is that a {NOUN} in your {BODY_PART}, or are you just {ADJECTIVE} to see me?' They {VERB_PAST} together until the {ANIMAL} came home.",
        blanks: [
          { id: 1, type: "NAME", description: "Person's name" },
          { id: 2, type: "NAME_2", description: "Another person's name" },
          { id: 3, type: "PLACE", description: "Where they met" },
          { id: 4, type: "BODY_PART", description: "Part of the body" },
          { id: 5, type: "NAME_2", description: "Same as #2" },
          { id: 6, type: "VERB_ING", description: "Action ending in -ing" },
          { id: 7, type: "FURNITURE", description: "Piece of furniture" },
          { id: 8, type: "ADJECTIVE", description: "Describing word" },
          { id: 9, type: "CLOTHING", description: "Item of clothing" },
          { id: 10, type: "EXCLAMATION", description: "Something you'd say in surprise" },
          { id: 11, type: "NAME", description: "Same as #1" },
          { id: 12, type: "ADJECTIVE", description: "Describing word" },
          { id: 13, type: "CELEBRITY", description: "Famous attractive person" },
          { id: 14, type: "ADVERB", description: "Word ending in -ly" },
          { id: 15, type: "NOUN", description: "Random object" },
          { id: 16, type: "BODY_PART", description: "Part of the body" },
          { id: 17, type: "ADJECTIVE", description: "Emotion word" },
          { id: 18, type: "VERB_PAST", description: "Past tense action" },
          { id: 19, type: "ANIMAL", description: "Any animal" },
        ]
      }
    ],
    Romance: [
      {
        title: "Love in the Time of WiFi",
        genre: "Romance",
        template: `I first saw {HOTTIE_NAME} at {ROMANTIC_LOCATION} when they were {DOING_SOMETHING_HOT}. My {BODY_PART} started {PHYSICAL_REACTION} and I accidentally {EMBARRASSING_ACTION}. They looked at me with their {EYE_COLOR} eyes and said "{PICKUP_LINE}".

We bonded over our mutual love of {WEIRD_HOBBY} and {GUILTY_PLEASURE}. On our first date at {DATE_LOCATION}, they brought me {ROMANTIC_GIFT} and whispered "{CHEESY_LINE}" in my ear. My {INTERNAL_ORGAN} did {IMPOSSIBLE_ACTION}.

After {TIME_PERIOD} of dating, they finally said "{LOVE_CONFESSION}" while we were {ROMANTIC_ACTIVITY}. I responded by {AWKWARD_RESPONSE} and then {PASSIONATE_ACTION}. Now we're planning to {FUTURE_PLAN} and have {NUMBER} {CUTE_THINGS}.`,
        blanks: [
          { id: 1, type: "HOTTIE_NAME", description: "Name of your crush" },
          { id: 2, type: "ROMANTIC_LOCATION", description: "Where you met" },
          { id: 3, type: "DOING_SOMETHING_HOT", description: "What they were doing" },
          { id: 4, type: "BODY_PART", description: "Part of your body" },
          { id: 5, type: "PHYSICAL_REACTION", description: "What your body did" },
          { id: 6, type: "EMBARRASSING_ACTION", description: "What you did wrong" },
          { id: 7, type: "EYE_COLOR", description: "Their eye color" },
          { id: 8, type: "PICKUP_LINE", description: "Cheesy pickup line" },
          { id: 9, type: "WEIRD_HOBBY", description: "Unusual shared interest" },
          { id: 10, type: "GUILTY_PLEASURE", description: "Secret thing you both like" },
          { id: 11, type: "DATE_LOCATION", description: "First date spot" },
          { id: 12, type: "ROMANTIC_GIFT", description: "Sweet gift" },
          { id: 13, type: "CHEESY_LINE", description: "Romantic but cheesy line" },
          { id: 14, type: "INTERNAL_ORGAN", description: "Body organ" },
          { id: 15, type: "IMPOSSIBLE_ACTION", description: "Physically impossible thing" },
          { id: 16, type: "TIME_PERIOD", description: "How long you dated" },
          { id: 17, type: "LOVE_CONFESSION", description: "How they said I love you" },
          { id: 18, type: "ROMANTIC_ACTIVITY", description: "What you were doing" },
          { id: 19, type: "AWKWARD_RESPONSE", description: "Your awkward reaction" },
          { id: 20, type: "PASSIONATE_ACTION", description: "Romantic gesture" },
          { id: 21, type: "FUTURE_PLAN", description: "Future together" },
          { id: 22, type: "NUMBER", description: "How many" },
          { id: 23, type: "CUTE_THINGS", description: "Cute future things (kids, pets, etc)" },
        ]
      }
    ],
    Action: [
      {
        title: "Mission Impossible: The Ridiculous Protocol",
        genre: "Action",
        template: `Agent {SPY_NAME} received a {URGENCY_LEVEL} message: "{MISSION_BRIEFING}". Armed with a {USELESS_GADGET} and {WORSE_GADGET}, they infiltrated {ENEMY_BASE} by {INFILTRATION_METHOD}.

The {VILLAIN_TITLE} {VILLAIN_NAME} was {EVIL_ACTIVITY} with {HENCHMEN_COUNT} {HENCHMEN_TYPE}. During the {FIGHT_STYLE} fight, {SPY_NAME} used their {SPECIAL_SKILL} to {COMBAT_MOVE} while shouting "{BATTLE_CRY}!"

Everything exploded when the {DOOMSDAY_DEVICE} activated, causing {CATASTROPHE}. {SPY_NAME} escaped by {ESCAPE_METHOD} with only {SECONDS} seconds to spare. The President awarded them the {FAKE_MEDAL} for {HEROIC_DEED}.`,
        blanks: [
          { id: 1, type: "SPY_NAME", description: "Secret agent name" },
          { id: 2, type: "URGENCY_LEVEL", description: "How urgent (super mega ultra)" },
          { id: 3, type: "MISSION_BRIEFING", description: "The mission" },
          { id: 4, type: "USELESS_GADGET", description: "Terrible spy gadget" },
          { id: 5, type: "WORSE_GADGET", description: "Even worse gadget" },
          { id: 6, type: "ENEMY_BASE", description: "Villain's hideout" },
          { id: 7, type: "INFILTRATION_METHOD", description: "How they got in" },
          { id: 8, type: "VILLAIN_TITLE", description: "Evil title (Dr., Lord, etc)" },
          { id: 9, type: "VILLAIN_NAME", description: "Villain's name" },
          { id: 10, type: "EVIL_ACTIVITY", description: "What villain was doing" },
          { id: 11, type: "HENCHMEN_COUNT", description: "Number of bad guys" },
          { id: 12, type: "HENCHMEN_TYPE", description: "Type of henchmen" },
          { id: 13, type: "FIGHT_STYLE", description: "Fighting style" },
          { id: 14, type: "SPECIAL_SKILL", description: "Hero's special move" },
          { id: 15, type: "COMBAT_MOVE", description: "Fighting technique" },
          { id: 16, type: "BATTLE_CRY", description: "What they yelled" },
          { id: 17, type: "DOOMSDAY_DEVICE", description: "Evil machine" },
          { id: 18, type: "CATASTROPHE", description: "What went wrong" },
          { id: 19, type: "ESCAPE_METHOD", description: "How they escaped" },
          { id: 20, type: "SECONDS", description: "Time left" },
          { id: 21, type: "FAKE_MEDAL", description: "Made-up award" },
          { id: 22, type: "HEROIC_DEED", description: "What they did" },
        ]
      }
    ],
    Mystery: [
      {
        title: "The Case of the Missing Meme",
        genre: "Mystery",
        template: `Detective {DETECTIVE_NAME} was called to investigate the {CRIME_LEVEL} theft of {STOLEN_ITEM} from {VICTIM_NAME}'s {LOCATION}. The only clue was {WEIRD_EVIDENCE} covered in {SUBSTANCE}.

The suspects were: {SUSPECT_1} the {OCCUPATION_1} who was {SUSPICIOUS_ACTIVITY_1}, {SUSPECT_2} the {OCCUPATION_2} with {GUILTY_TRAIT}, and {SUSPECT_3} who kept {NERVOUS_HABIT}.

After {INVESTIGATION_METHOD} for {TIME_AMOUNT}, the detective discovered {SHOCKING_REVELATION}. The culprit was actually {PLOT_TWIST} who used {MURDER_WEAPON} to {ACTUAL_CRIME}. Their motive? {RIDICULOUS_MOTIVE}. Case closed with a {DRAMATIC_ENDING}.`,
        blanks: [
          { id: 1, type: "DETECTIVE_NAME", description: "Detective's name" },
          { id: 2, type: "CRIME_LEVEL", description: "How serious (heinous, mild, etc)" },
          { id: 3, type: "STOLEN_ITEM", description: "What was stolen" },
          { id: 4, type: "VICTIM_NAME", description: "Victim's name" },
          { id: 5, type: "LOCATION", description: "Crime scene" },
          { id: 6, type: "WEIRD_EVIDENCE", description: "Strange clue" },
          { id: 7, type: "SUBSTANCE", description: "Mysterious substance" },
          { id: 8, type: "SUSPECT_1", description: "First suspect name" },
          { id: 9, type: "OCCUPATION_1", description: "Their job" },
          { id: 10, type: "SUSPICIOUS_ACTIVITY_1", description: "What they were doing" },
          { id: 11, type: "SUSPECT_2", description: "Second suspect name" },
          { id: 12, type: "OCCUPATION_2", description: "Their job" },
          { id: 13, type: "GUILTY_TRAIT", description: "Suspicious characteristic" },
          { id: 14, type: "SUSPECT_3", description: "Third suspect name" },
          { id: 15, type: "NERVOUS_HABIT", description: "Nervous behavior" },
          { id: 16, type: "INVESTIGATION_METHOD", description: "How they investigated" },
          { id: 17, type: "TIME_AMOUNT", description: "Investigation duration" },
          { id: 18, type: "SHOCKING_REVELATION", description: "Big discovery" },
          { id: 19, type: "PLOT_TWIST", description: "Unexpected culprit" },
          { id: 20, type: "MURDER_WEAPON", description: "Weapon used" },
          { id: 21, type: "ACTUAL_CRIME", description: "What really happened" },
          { id: 22, type: "RIDICULOUS_MOTIVE", description: "Why they did it" },
          { id: 23, type: "DRAMATIC_ENDING", description: "How it ended" },
        ]
      }
    ],
    Sports: [
      {
        title: "The Championship of Chaos",
        genre: "Sports",
        template: `In the {TOURNAMENT_NAME} finals, the {TEAM_1} faced the {TEAM_2}. Star player {ATHLETE_NAME} showed up {PHYSICAL_CONDITION} after {PRE_GAME_ACTIVITY}.

The game started with {ATHLETE_NAME} attempting a {IMPOSSIBLE_MOVE} but instead {EMBARRASSING_FAIL}. The crowd of {CROWD_SIZE} went {CROWD_REACTION} when the referee called a {FAKE_PENALTY} for {RIDICULOUS_INFRACTION}.

With {TIME_LEFT} left, the score was {SCORE_1} to {SCORE_2}. {ATHLETE_NAME} grabbed the {WRONG_EQUIPMENT} and {HEROIC_ACTION} across the {PLAYING_SURFACE}. The announcer screamed "{COMMENTARY}!" as they {WINNING_MOVE} to win by {MARGIN}!`,
        blanks: [
          { id: 1, type: "TOURNAMENT_NAME", description: "Championship name" },
          { id: 2, type: "TEAM_1", description: "First team name" },
          { id: 3, type: "TEAM_2", description: "Second team name" },
          { id: 4, type: "ATHLETE_NAME", description: "Star player's name" },
          { id: 5, type: "PHYSICAL_CONDITION", description: "Their condition" },
          { id: 6, type: "PRE_GAME_ACTIVITY", description: "What they did before" },
          { id: 7, type: "IMPOSSIBLE_MOVE", description: "Athletic move attempted" },
          { id: 8, type: "EMBARRASSING_FAIL", description: "What went wrong" },
          { id: 9, type: "CROWD_SIZE", description: "Number of fans" },
          { id: 10, type: "CROWD_REACTION", description: "What crowd did" },
          { id: 11, type: "FAKE_PENALTY", description: "Made-up penalty" },
          { id: 12, type: "RIDICULOUS_INFRACTION", description: "What they did wrong" },
          { id: 13, type: "TIME_LEFT", description: "Time remaining" },
          { id: 14, type: "SCORE_1", description: "Team 1 score" },
          { id: 15, type: "SCORE_2", description: "Team 2 score" },
          { id: 16, type: "WRONG_EQUIPMENT", description: "Wrong sports equipment" },
          { id: 17, type: "HEROIC_ACTION", description: "Amazing move" },
          { id: 18, type: "PLAYING_SURFACE", description: "Field/court/etc" },
          { id: 19, type: "COMMENTARY", description: "Announcer's call" },
          { id: 20, type: "WINNING_MOVE", description: "Final play" },
          { id: 21, type: "MARGIN", description: "Victory margin" },
        ]
      }
    ],
    Workplace: [
      {
        title: "The Office Incident Report",
        genre: "Workplace",
        template: `To: {BOSS_NAME}, {RIDICULOUS_TITLE}
From: {YOUR_NAME}, {FAKE_POSITION}
Re: The {DAY_OF_WEEK} {DISASTER_TYPE}

This morning at {TIME}, {COWORKER_1} was {OFFICE_ACTIVITY} when the {OFFICE_EQUIPMENT} suddenly {MALFUNCTION}. This caused {LIQUID} to spray all over {IMPORTANT_PERSON}'s {EXPENSIVE_ITEM}.

{COWORKER_2} tried to help by {UNHELPFUL_ACTION} but accidentally {MADE_IT_WORSE}. The {DEPARTMENT} department is now {CONSEQUENCE} and HR says we need {TRAINING_TYPE} training.

Please note that {SCAPEGOAT} was definitely responsible, not me. I was busy {ALIBI} in the {HIDING_SPOT}. Recommend we {SOLUTION} and never speak of this again.`,
        blanks: [
          { id: 1, type: "BOSS_NAME", description: "Boss's name" },
          { id: 2, type: "RIDICULOUS_TITLE", description: "Made-up job title" },
          { id: 3, type: "YOUR_NAME", description: "Your name" },
          { id: 4, type: "FAKE_POSITION", description: "Your fake job" },
          { id: 5, type: "DAY_OF_WEEK", description: "Day it happened" },
          { id: 6, type: "DISASTER_TYPE", description: "Type of incident" },
          { id: 7, type: "TIME", description: "When it happened" },
          { id: 8, type: "COWORKER_1", description: "Coworker's name" },
          { id: 9, type: "OFFICE_ACTIVITY", description: "What they were doing" },
          { id: 10, type: "OFFICE_EQUIPMENT", description: "Office machine" },
          { id: 11, type: "MALFUNCTION", description: "What went wrong" },
          { id: 12, type: "LIQUID", description: "What spilled" },
          { id: 13, type: "IMPORTANT_PERSON", description: "VIP who got hit" },
          { id: 14, type: "EXPENSIVE_ITEM", description: "What got ruined" },
          { id: 15, type: "COWORKER_2", description: "Another coworker" },
          { id: 16, type: "UNHELPFUL_ACTION", description: "Failed help attempt" },
          { id: 17, type: "MADE_IT_WORSE", description: "How they made it worse" },
          { id: 18, type: "DEPARTMENT", description: "Office department" },
          { id: 19, type: "CONSEQUENCE", description: "Current state" },
          { id: 20, type: "TRAINING_TYPE", description: "Mandatory training" },
          { id: 21, type: "SCAPEGOAT", description: "Who to blame" },
          { id: 22, type: "ALIBI", description: "Your excuse" },
          { id: 23, type: "HIDING_SPOT", description: "Where you were" },
          { id: 24, type: "SOLUTION", description: "Proposed fix" },
        ]
      }
    ],
    Noir: [
      {
        title: "Dark City Blues",
        genre: "Noir",
        template: `The rain was falling like {DEPRESSING_METAPHOR} when {SHADY_CHARACTER} walked into my office. They had {SUSPICIOUS_FEATURE} and smelled like {BAD_SMELL} mixed with {WORSE_SMELL}.

"I need you to find my {LOST_THING}," they said, lighting a {SMOKING_ITEM}. "It was last seen at {SEEDY_LOCATION} with {CRIMINAL_TYPE}."

I poured myself a glass of {CHEAP_ALCOHOL} and stared out at the {DYSTOPIAN_VIEW}. This city was full of {URBAN_DECAY} and {MORAL_FAILING}. My {EX_RELATIONSHIP} had warned me about taking cases from {SUSPICIOUS_GROUP}.

The trail led to {DIVE_BAR} where {CORRUPT_OFFICIAL} was playing {RIGGED_GAME} with {LOWLIFE_SCUM}. The bartender, a {BROKEN_PERSON} with {TRAGIC_BACKSTORY}, slipped me a note: "{CRYPTIC_WARNING}."

By {LATE_HOUR}, I'd been {VIOLENT_ACTION} twice and {BETRAYAL_TYPE} by my own {TRUSTED_PERSON}. The {MCGUFFIN} turned out to be {PLOT_TWIST}.

In this {HELLHOLE_CITY}, everyone's got {DARK_SECRET}. Mine? I {SHAMEFUL_CONFESSION}. But that's life in the {NOIR_METAPHOR}.`,
        blanks: [
          { id: 1, type: "DEPRESSING_METAPHOR", description: "Sad comparison (ex: tears from heaven, broken dreams, my ex's promises)" },
          { id: 2, type: "SHADY_CHARACTER", description: "Suspicious person type (ex: dame with trouble written all over her, guy in a trench coat)" },
          { id: 3, type: "SUSPICIOUS_FEATURE", description: "Sketchy characteristic (ex: shifty eyes, too many scars, nervous twitch)" },
          { id: 4, type: "BAD_SMELL", description: "Unpleasant odor (ex: cheap perfume, cigarettes, desperation)" },
          { id: 5, type: "WORSE_SMELL", description: "Even worse smell (ex: murder, betrayal, my cooking)" },
          { id: 6, type: "LOST_THING", description: "Missing item (ex: husband, dignity, will to live)" },
          { id: 7, type: "SMOKING_ITEM", description: "Thing to smoke (ex: cigarette, cigar, questionable herbs)" },
          { id: 8, type: "SEEDY_LOCATION", description: "Sketchy place (ex: docks at midnight, abandoned warehouse, DMV)" },
          { id: 9, type: "CRIMINAL_TYPE", description: "Type of criminal (ex: mob boss, dirty cop, crypto bro)" },
          { id: 10, type: "CHEAP_ALCOHOL", description: "Bottom shelf booze (ex: bathtub gin, gas station wine, regret)" },
          { id: 11, type: "DYSTOPIAN_VIEW", description: "Depressing scenery (ex: urban decay, broken dreams, my bank account)" },
          { id: 12, type: "URBAN_DECAY", description: "City problem (ex: corruption, potholes, gentrification)" },
          { id: 13, type: "MORAL_FAILING", description: "Ethical issue (ex: greed, lust, checking ex's Instagram)" },
          { id: 14, type: "EX_RELATIONSHIP", description: "Former lover (ex: ex-wife, former partner, that mistake from Vegas)" },
          { id: 15, type: "SUSPICIOUS_GROUP", description: "Shady organization (ex: the mob, government, HOA)" },
          { id: 16, type: "DIVE_BAR", description: "Rough establishment (ex: The Rusty Nail, Satan's Armpit, Applebee's)" },
          { id: 17, type: "CORRUPT_OFFICIAL", description: "Dirty authority (ex: crooked cop, bent judge, PTA president)" },
          { id: 18, type: "RIGGED_GAME", description: "Fixed game (ex: poker, dice, dating apps)" },
          { id: 19, type: "LOWLIFE_SCUM", description: "Bottom feeder (ex: loan shark, snitch, influencer)" },
          { id: 20, type: "BROKEN_PERSON", description: "Damaged individual (ex: washed-up boxer, failed artist, me)" },
          { id: 21, type: "TRAGIC_BACKSTORY", description: "Sad history (ex: lost everything in crypto, peaked in high school)" },
          { id: 22, type: "CRYPTIC_WARNING", description: "Mysterious message (ex: trust no one, it's a trap, check your DMs)" },
          { id: 23, type: "LATE_HOUR", description: "Time of night (ex: 3am, the devil's hour, last call)" },
          { id: 24, type: "VIOLENT_ACTION", description: "Assault (ex: punched, stabbed, emotionally devastated)" },
          { id: 25, type: "BETRAYAL_TYPE", description: "Type of backstab (ex: double-crossed, sold out, unfriended)" },
          { id: 26, type: "TRUSTED_PERSON", description: "Someone you trusted (ex: partner, bartender, therapist)" },
          { id: 27, type: "MCGUFFIN", description: "The thing everyone wants (ex: briefcase, USB drive, last PS5)" },
          { id: 28, type: "PLOT_TWIST", description: "Shocking reveal (ex: fake all along, my dad, cake)" },
          { id: 29, type: "HELLHOLE_CITY", description: "Terrible place (ex: concrete jungle, urban nightmare, Newark)" },
          { id: 30, type: "DARK_SECRET", description: "Hidden shame (ex: murdered someone, likes pineapple pizza)" },
          { id: 31, type: "SHAMEFUL_CONFESSION", description: "Embarrassing admission (ex: cried at Frozen, still use Facebook)" },
          { id: 32, type: "NOIR_METAPHOR", description: "Dark comparison (ex: gutter, shadows, comments section)" },
        ]
      }
    ],
    Cyberpunk: [
      {
        title: "Neural Jack Nightmare",
        genre: "Cyberpunk",
        template: `The year is {FUTURE_YEAR}. I was jacked into the {VIRTUAL_SPACE} when {CYBER_THREAT} breached my {BODY_MOD}. My {AI_COMPANION} screamed "{ERROR_MESSAGE}" before going offline.

In the {DYSTOPIAN_DISTRICT}, {MEGACORP} controls everything from {BASIC_NECESSITY} to {OTHER_NECESSITY}. Their {EVIL_CEO} just announced {DYSTOPIAN_POLICY}.

I met {HACKER_NAME} at {UNDERGROUND_SPOT}. They were running {ILLEGAL_SOFTWARE} on a {OBSOLETE_TECH} while high on {FUTURE_DRUG}. "The {CONSPIRACY_NAME} is real," they whispered, showing me {DIGITAL_EVIDENCE}.

We had to steal {MACGUFFIN_DATA} from {CORPORATE_BUILDING} using only {HACKING_TOOL} and {WEAPON_TYPE}. The security was {CYBER_ANIMAL} level with {DEFENSE_SYSTEM}.

During the heist, my {CYBERNETIC_PART} started {MALFUNCTION_TYPE}. The corpo {SECURITY_FORCE} arrived in {VEHICLE_TYPE} armed with {FUTURE_WEAPON}.

In the end, we discovered {SHOCKING_TRUTH}. Now I'm {CURRENT_STATUS}, living off {STREET_FOOD} and {SKETCHY_INCOME}. Welcome to {DYSTOPIAN_SLOGAN}.`,
        blanks: [
          { id: 1, type: "FUTURE_YEAR", description: "Dystopian year (ex: 2077, 2420, next Tuesday)" },
          { id: 2, type: "VIRTUAL_SPACE", description: "Digital realm (ex: metaverse, dark web, Facebook)" },
          { id: 3, type: "CYBER_THREAT", description: "Digital danger (ex: virus, hacker, Windows update)" },
          { id: 4, type: "BODY_MOD", description: "Cybernetic implant (ex: neural chip, robot arm, Bluetooth kidney)" },
          { id: 5, type: "AI_COMPANION", description: "Digital assistant (ex: holographic waifu, sarcastic AI, Clippy 2.0)" },
          { id: 6, type: "ERROR_MESSAGE", description: "System error (ex: Fatal Error 404, Does not compute, Yikes)" },
          { id: 7, type: "DYSTOPIAN_DISTRICT", description: "Bad neighborhood (ex: Neon Slums, Sector 7, New Jersey)" },
          { id: 8, type: "MEGACORP", description: "Evil company (ex: OmniCorp, Amazon Prime Plus, Disney-Apple)" },
          { id: 9, type: "BASIC_NECESSITY", description: "Essential item (ex: oxygen, water, WiFi passwords)" },
          { id: 10, type: "OTHER_NECESSITY", description: "Another essential (ex: hope, memes, antidepressants)" },
          { id: 11, type: "EVIL_CEO", description: "Corporate villain (ex: cyborg Bezos, zombie Jobs, Musk's clone)" },
          { id: 12, type: "DYSTOPIAN_POLICY", description: "Evil rule (ex: breathing tax, mandatory ads in dreams)" },
          { id: 13, type: "HACKER_NAME", description: "L33t hacker handle (ex: CyberPunk69, Neo2.0, xXx_HackLord_xXx)" },
          { id: 14, type: "UNDERGROUND_SPOT", description: "Secret location (ex: abandoned server farm, sewer rave, Wendy's)" },
          { id: 15, type: "ILLEGAL_SOFTWARE", description: "Banned program (ex: ad blocker, free thought app, TikTok)" },
          { id: 16, type: "OBSOLETE_TECH", description: "Old technology (ex: iPhone 47, holographic Nokia, fax machine)" },
          { id: 17, type: "FUTURE_DRUG", description: "Cyber narcotic (ex: digital cocaine, RAM juice, nostalgia pills)" },
          { id: 18, type: "CONSPIRACY_NAME", description: "Secret plot (ex: The Simulation, Project Mindwipe, Birds Aren't Real 2.0)" },
          { id: 19, type: "DIGITAL_EVIDENCE", description: "Proof (ex: deleted tweets, blockchain receipts, sus browser history)" },
          { id: 20, type: "MACGUFFIN_DATA", description: "Important data (ex: CEO's nudes, bitcoin wallet, original Constitution NFT)" },
          { id: 21, type: "CORPORATE_BUILDING", description: "Evil HQ (ex: Black Pyramid, The Nexus, Former Twitter HQ)" },
          { id: 22, type: "HACKING_TOOL", description: "Cyber weapon (ex: quantum USB, neural virus, angry email)" },
          { id: 23, type: "WEAPON_TYPE", description: "Physical weapon (ex: laser katana, smart gun, Nokia 3310)" },
          { id: 24, type: "CYBER_ANIMAL", description: "Digital beast (ex: firewall dragon, data shark, spam bot)" },
          { id: 25, type: "DEFENSE_SYSTEM", description: "Security measure (ex: laser grid, AI guards, captcha from hell)" },
          { id: 26, type: "CYBERNETIC_PART", description: "Robot body part (ex: cyber eyes, WiFi liver, Bluetooth spine)" },
          { id: 27, type: "MALFUNCTION_TYPE", description: "Technical problem (ex: blue screening, playing ads, becoming sentient)" },
          { id: 28, type: "SECURITY_FORCE", description: "Corporate military (ex: cyber cops, drone swarm, Karen brigade)" },
          { id: 29, type: "VEHICLE_TYPE", description: "Future transport (ex: flying Tesla, hover Uber, weaponized scooter)" },
          { id: 30, type: "FUTURE_WEAPON", description: "Sci-fi gun (ex: plasma rifle, cringe ray, cancel cannon)" },
          { id: 31, type: "SHOCKING_TRUTH", description: "Big reveal (ex: we're in a simulation, AI runs everything, it's all cake)" },
          { id: 32, type: "CURRENT_STATUS", description: "Your situation (ex: on the run, half-digital, vibing)" },
          { id: 33, type: "STREET_FOOD", description: "Sketchy meal (ex: synthetic ramen, lab-grown mystery meat, Soylent Green)" },
          { id: 34, type: "SKETCHY_INCOME", description: "Illegal job (ex: data smuggling, meme dealing, being an influencer)" },
          { id: 35, type: "DYSTOPIAN_SLOGAN", description: "Dark motto (ex: The Future is Now and It Sucks, Obey and Subscribe)" },
        ]
      }
    ],
    Steampunk: [
      {
        title: "The Brass Gear Conspiracy",
        genre: "Steampunk",
        template: `In the year {VICTORIAN_YEAR}, I was adjusting my {STEAM_GADGET} when {ARISTOCRAT_TITLE} {FANCY_NAME} burst into my workshop. Their {BRASS_ACCESSORY} was {MECHANICAL_PROBLEM} and leaking {STEAM_SUBSTANCE}.

"The {EVIL_GUILD} has stolen the {IMPORTANT_INVENTION}!" they exclaimed, twirling their {FACIAL_HAIR}. We had to infiltrate the {STEAMPUNK_LOCATION} using my {CONTRAPTION} powered by {FUEL_SOURCE}.

Lady {POSH_NAME} joined us with her {MECHANICAL_PET} and a {WEAPON_GADGET} that shot {PROJECTILE_TYPE}. The airship {PRETENTIOUS_NAME} was captained by {SKY_PIRATE} who demanded {PAYMENT_TYPE} as payment.

At {ALTITUDE} feet, we encountered {AIR_CREATURE} attacking our {SHIP_PART}. My {GOGGLES_TYPE} revealed {HIDDEN_DANGER} while the {STEAM_ENGINE} began {CATASTROPHIC_FAILURE}.

The villain, {EVIL_INVENTOR}, was using {DOOMSDAY_DEVICE} to {EVIL_PLAN}. Their {MECHANICAL_MINION} army was powered by {ENERGY_SOURCE}.

In the climactic battle, I used my {SIGNATURE_INVENTION} to {HEROIC_ACTION}. The queen awarded me the Order of the {RANDOM_OBJECT}. But I knew the {SECRET_SOCIETY} would return.`,
        blanks: [
          { id: 1, type: "VICTORIAN_YEAR", description: "Old-timey year (ex: 1887, 1899, the year fashion died)" },
          { id: 2, type: "STEAM_GADGET", description: "Steampunk device (ex: brass monocle, steam-powered phone, mechanical underwear)" },
          { id: 3, type: "ARISTOCRAT_TITLE", description: "Fancy title (ex: Duke, Countess, Assistant Regional Manager)" },
          { id: 4, type: "FANCY_NAME", description: "Posh name (ex: Reginald, Penelope, Chad)" },
          { id: 5, type: "BRASS_ACCESSORY", description: "Metal accessory (ex: copper codpiece, bronze bra, golden grillz)" },
          { id: 6, type: "MECHANICAL_PROBLEM", description: "Technical issue (ex: over-pressurized, making TikToks, gaining sentience)" },
          { id: 7, type: "STEAM_SUBSTANCE", description: "What's leaking (ex: hot steam, oil, bad vibes)" },
          { id: 8, type: "EVIL_GUILD", description: "Villain group (ex: Gear Grinders Guild, Steam Supremacists, Karen Kollective)" },
          { id: 9, type: "IMPORTANT_INVENTION", description: "Crucial device (ex: perpetual tea maker, automatic corset, WiFi router)" },
          { id: 10, type: "FACIAL_HAIR", description: "Hair style (ex: handlebar mustache, mutton chops, neck beard)" },
          { id: 11, type: "STEAMPUNK_LOCATION", description: "Victorian place (ex: Crystal Palace, abandoned factory, your mom's basement)" },
          { id: 12, type: "CONTRAPTION", description: "Weird machine (ex: velocipede, gyrocopter, mechanical horse)" },
          { id: 13, type: "FUEL_SOURCE", description: "Power source (ex: coal, whale oil, pure spite)" },
          { id: 14, type: "POSH_NAME", description: "Fancy lady name (ex: Beatrice, Millicent, Karen)" },
          { id: 15, type: "MECHANICAL_PET", description: "Robot animal (ex: brass monkey, steam-powered cat, clockwork emotional support peacock)" },
          { id: 16, type: "WEAPON_GADGET", description: "Steampunk weapon (ex: Tesla coil gun, steam cannon, weaponized umbrella)" },
          { id: 17, type: "PROJECTILE_TYPE", description: "What it shoots (ex: gears, hot tea, strongly-worded letters)" },
          { id: 18, type: "PRETENTIOUS_NAME", description: "Fancy ship name (ex: HMS Superiority, The Pretentious Pigeon)" },
          { id: 19, type: "SKY_PIRATE", description: "Air criminal (ex: Captain Blackbeard 2.0, Admiral Anxiety)" },
          { id: 20, type: "PAYMENT_TYPE", description: "Currency (ex: brass buttons, Queen's tears, exposure)" },
          { id: 21, type: "ALTITUDE", description: "Height in feet (ex: 10,000, over 9000, tree-fiddy)" },
          { id: 22, type: "AIR_CREATURE", description: "Sky monster (ex: mechanical dragons, steam powered geese, angry clouds)" },
          { id: 23, type: "SHIP_PART", description: "Airship component (ex: balloon, propeller, complimentary peanuts)" },
          { id: 24, type: "GOGGLES_TYPE", description: "Eye protection (ex: brass goggles, rose-tinted spectacles, beer goggles)" },
          { id: 25, type: "HIDDEN_DANGER", description: "Secret threat (ex: sky mines, another airship, my ex)" },
          { id: 26, type: "STEAM_ENGINE", description: "Engine type (ex: Mark VII Boiler, Whistling William, The Screamer 3000)" },
          { id: 27, type: "CATASTROPHIC_FAILURE", description: "Breaking down (ex: exploding, playing dubstep, achieving consciousness)" },
          { id: 28, type: "EVIL_INVENTOR", description: "Bad guy name (ex: Professor Doom, Doctor Badvibes, Steve)" },
          { id: 29, type: "DOOMSDAY_DEVICE", description: "Evil machine (ex: Weather Dominator, Cringe Amplifier, Monday Generator)" },
          { id: 30, type: "EVIL_PLAN", description: "Villain goal (ex: block out the sun, make everything beige, cancel Christmas)" },
          { id: 31, type: "MECHANICAL_MINION", description: "Robot servant (ex: clockwork butler, steam zombie, brass Karen)" },
          { id: 32, type: "ENERGY_SOURCE", description: "Power type (ex: stolen dreams, orphan tears, pyramid schemes)" },
          { id: 33, type: "SIGNATURE_INVENTION", description: "Your special device (ex: Quantum Spanner, Probability Parasol, Vibe Checker 3000)" },
          { id: 34, type: "HEROIC_ACTION", description: "How you saved the day (ex: reversed the polarity, pressed the red button, called their mom)" },
          { id: 35, type: "RANDOM_OBJECT", description: "Random award item (ex: Golden Potato, Brass Banana, Diamond Crocs)" },
          { id: 36, type: "SECRET_SOCIETY", description: "Hidden group (ex: Illuminati 2.0, Gear Gang, The Cog Collective)" },
        ]
      }
    ],
  };

  // Generate AI story if custom prompt provided
  const generateAIStory = (prompt: string, names: string[]): MadLibsStory => {
    // Simulate AI generation - now creates standard-length Mad Libs (200+ words, 40+ blanks)
    const nameSlots = names.map((name, i) => ({ 
      id: i + 1, 
      type: `NAME_${i + 1}`, 
      description: `Use ${name}'s name here`,
      userInput: name // Pre-fill with actual name
    }));
    
    // Generate a longer, more detailed template based on the prompt
    const template = `Last {DAY_OF_WEEK}, ${names[0] ? '{NAME_1}' : '{PERSON_NAME}'} was working on their {ADJECTIVE} startup idea: "${prompt}". They had been {VERB_ING} for {NUMBER} hours straight in their {ADJECTIVE_2} {ROOM} when suddenly their {ELECTRONIC_DEVICE} started {VERB_ING_2} uncontrollably.

"Oh {EXCLAMATION}!" they shouted, spilling {LIQUID} all over their {CLOTHING_ITEM}. Their business partner, ${names[1] ? '{NAME_2}' : '{CELEBRITY}'}, rushed in carrying {NUMBER_2} {PLURAL_NOUN} and a {ADJECTIVE_3} {TOOL}.

"The demo is in {TIME_AMOUNT}!" ${names[1] ? '{NAME_2}' : '{CELEBRITY}'} {VERB_PAST} {ADVERB}. "The {OCCUPATION_PLURAL} from {COMPANY_NAME} Corporation are already in the {ROOM_2}!"

They {VERB_PAST_2} to set up the presentation, but the {ADJECTIVE_4} projector displayed everything in {COLOR}. The {NOUN} they were demonstrating suddenly {VERB_PAST_3} and started {VERB_ING_3} like a {ADJECTIVE_5} {ANIMAL}.

${names[2] ? '{NAME_3}' : '{FAMOUS_TECH_CEO}'} walked in wearing a {ADJECTIVE_6} {CLOTHING_2} and said, "This reminds me of when I {VERB_PAST_4} my first {NOUN_2} back in {YEAR}."

Just then, {NUMBER_3} {ANIMAL_PLURAL} burst through the {ADJECTIVE_7} window, apparently attracted by the {FOOD} someone had left on the {FURNITURE}. The lead investor started {VERB_ING_4} and accidentally {VERB_PAST_5} the {EXPENSIVE_ITEM}.

"Don't worry!" said the {ADJECTIVE_8} {JOB_TITLE}, pulling out a {ADJECTIVE_9} {GADGET}. "I always carry {NUMBER_4} of these in case of {PLURAL_NOUN_2} emergencies!"

The demo ended when the {VEHICLE} outside started {VERB_ING_5} and everyone had to evacuate to the {PLACE}. Despite everything, the investors offered ${NUMBER_5} million dollars, but only if they could change the name to "{SILLY_WORD} {NOUN_3}".

${names[0] ? '{NAME_1}' : '{PERSON_NAME}'} and ${names[1] ? '{NAME_2}' : '{CELEBRITY}'} {VERB_PAST_6} at each other and said "{PHRASE}!" They signed the deal with a {ADJECTIVE_10} {WRITING_TOOL} and celebrated by {VERB_ING_6} all the way to the {PLACE_2}.

And that's how the most {ADJECTIVE_11} startup in {CITY} history was born!`;
    
    const blanks: MadLibsBlank[] = [
      ...nameSlots,
      { id: nameSlots.length + 1, type: "DAY_OF_WEEK", description: "Day of the week" },
      { id: nameSlots.length + 2, type: names[0] ? "" : "PERSON_NAME", description: names[0] ? "" : "Someone's name" },
      { id: nameSlots.length + 3, type: "ADJECTIVE", description: "Describing word" },
      { id: nameSlots.length + 4, type: "VERB_ING", description: "Action ending in -ing" },
      { id: nameSlots.length + 5, type: "NUMBER", description: "Any number" },
      { id: nameSlots.length + 6, type: "ADJECTIVE_2", description: "Another describing word" },
      { id: nameSlots.length + 7, type: "ROOM", description: "Room in a building" },
      { id: nameSlots.length + 8, type: "ELECTRONIC_DEVICE", description: "Electronic gadget" },
      { id: nameSlots.length + 9, type: "VERB_ING_2", description: "Action ending in -ing" },
      { id: nameSlots.length + 10, type: "EXCLAMATION", description: "Something you shout" },
      { id: nameSlots.length + 11, type: "LIQUID", description: "Any liquid" },
      { id: nameSlots.length + 12, type: "CLOTHING_ITEM", description: "Piece of clothing" },
      { id: nameSlots.length + 13, type: names[1] ? "" : "CELEBRITY", description: names[1] ? "" : "Famous person" },
      { id: nameSlots.length + 14, type: "NUMBER_2", description: "Another number" },
      { id: nameSlots.length + 15, type: "PLURAL_NOUN", description: "Multiple things" },
      { id: nameSlots.length + 16, type: "ADJECTIVE_3", description: "Describing word" },
      { id: nameSlots.length + 17, type: "TOOL", description: "Any tool" },
      { id: nameSlots.length + 18, type: "TIME_AMOUNT", description: "Amount of time" },
      { id: nameSlots.length + 19, type: "VERB_PAST", description: "Past tense action" },
      { id: nameSlots.length + 20, type: "ADVERB", description: "Word ending in -ly" },
      { id: nameSlots.length + 21, type: "OCCUPATION_PLURAL", description: "Job titles (plural)" },
      { id: nameSlots.length + 22, type: "COMPANY_NAME", description: "Company name" },
      { id: nameSlots.length + 23, type: "ROOM_2", description: "Another room" },
      { id: nameSlots.length + 24, type: "VERB_PAST_2", description: "Past tense action" },
      { id: nameSlots.length + 25, type: "ADJECTIVE_4", description: "Describing word" },
      { id: nameSlots.length + 26, type: "COLOR", description: "Any color" },
      { id: nameSlots.length + 27, type: "NOUN", description: "Person, place or thing" },
      { id: nameSlots.length + 28, type: "VERB_PAST_3", description: "Past tense action" },
      { id: nameSlots.length + 29, type: "VERB_ING_3", description: "Action ending in -ing" },
      { id: nameSlots.length + 30, type: "ADJECTIVE_5", description: "Describing word" },
      { id: nameSlots.length + 31, type: "ANIMAL", description: "Any animal" },
      { id: nameSlots.length + 32, type: names[2] ? "" : "FAMOUS_TECH_CEO", description: names[2] ? "" : "Tech company CEO" },
      { id: nameSlots.length + 33, type: "ADJECTIVE_6", description: "Describing word" },
      { id: nameSlots.length + 34, type: "CLOTHING_2", description: "Clothing item" },
      { id: nameSlots.length + 35, type: "VERB_PAST_4", description: "Past tense action" },
      { id: nameSlots.length + 36, type: "NOUN_2", description: "Thing or object" },
      { id: nameSlots.length + 37, type: "YEAR", description: "Any year" },
      { id: nameSlots.length + 38, type: "NUMBER_3", description: "Another number" },
      { id: nameSlots.length + 39, type: "ANIMAL_PLURAL", description: "Animals (plural)" },
      { id: nameSlots.length + 40, type: "ADJECTIVE_7", description: "Describing word" },
      { id: nameSlots.length + 41, type: "FOOD", description: "Something to eat" },
      { id: nameSlots.length + 42, type: "FURNITURE", description: "Piece of furniture" },
      { id: nameSlots.length + 43, type: "VERB_ING_4", description: "Action ending in -ing" },
      { id: nameSlots.length + 44, type: "VERB_PAST_5", description: "Past tense action" },
      { id: nameSlots.length + 45, type: "EXPENSIVE_ITEM", description: "Something expensive" },
      { id: nameSlots.length + 46, type: "ADJECTIVE_8", description: "Describing word" },
      { id: nameSlots.length + 47, type: "JOB_TITLE", description: "Job position" },
      { id: nameSlots.length + 48, type: "ADJECTIVE_9", description: "Describing word" },
      { id: nameSlots.length + 49, type: "GADGET", description: "Tech device" },
      { id: nameSlots.length + 50, type: "NUMBER_4", description: "Another number" },
      { id: nameSlots.length + 51, type: "PLURAL_NOUN_2", description: "Multiple things" },
      { id: nameSlots.length + 52, type: "VEHICLE", description: "Mode of transport" },
      { id: nameSlots.length + 53, type: "VERB_ING_5", description: "Action ending in -ing" },
      { id: nameSlots.length + 54, type: "PLACE", description: "Any location" },
      { id: nameSlots.length + 55, type: "NUMBER_5", description: "Dollar amount" },
      { id: nameSlots.length + 56, type: "SILLY_WORD", description: "Silly made-up word" },
      { id: nameSlots.length + 57, type: "NOUN_3", description: "Thing or object" },
      { id: nameSlots.length + 58, type: "VERB_PAST_6", description: "Past tense action" },
      { id: nameSlots.length + 59, type: "PHRASE", description: "Short phrase or exclamation" },
      { id: nameSlots.length + 60, type: "ADJECTIVE_10", description: "Describing word" },
      { id: nameSlots.length + 61, type: "WRITING_TOOL", description: "Something to write with" },
      { id: nameSlots.length + 62, type: "VERB_ING_6", description: "Action ending in -ing" },
      { id: nameSlots.length + 63, type: "PLACE_2", description: "Another location" },
      { id: nameSlots.length + 64, type: "ADJECTIVE_11", description: "Final describing word" },
      { id: nameSlots.length + 65, type: "CITY", description: "Name of a city" },
    ].filter(blank => blank.type !== ""); // Remove empty entries for pre-filled names
    
    return {
      title: `AI Story: ${prompt.substring(0, 30)}...`,
      genre: "AI Generated",
      template,
      blanks
    };
  };

  const [fatalError, setFatalError] = useState<string | null>(null);

  const safeGenerateCustomAIStory = (prompt: string, names: string[]) => {
    try {
      return generateAIStory(prompt, names);
    } catch (err: any) {
      setFatalError(
        'AI generation failed with: ' + (err?.message || String(err)) + '\n' + (err?.stack || '')
      );
      return undefined;
    }
  };

  // Get a story for the genre or generate AI story
  const [currentStory, setCurrentStory] = useState<MadLibsStory | undefined>(() => {
    // If resuming, use the saved story
    if (resumeData?.currentStory) {
      return resumeData.currentStory;
    }
    
    if (customStoryPrompt) {
      const aiStory = safeGenerateCustomAIStory(customStoryPrompt, customNames);
      if (!aiStory) {
        // If AI generation fails, fall back to a regular story
        const genreStories = stories['Comedy'];
        return genreStories[0];
      }
      return aiStory;
    }
    
    // Use new template system based on Mad Libs formula
    const lengthToUse = storyLength || 'short';
    const templatesForLength = getTemplatesByLength(lengthToUse);
    
    if (templatesForLength.length > 0) {
      const selectedTemplate = templatesForLength[currentStoryIndex % templatesForLength.length];
      return {
        title: selectedTemplate.title,
        genre: selectedTemplate.genre,
        template: selectedTemplate.template,
        blanks: selectedTemplate.blanks.map((blank) => ({
          id: blank.id,
          type: blank.id.split('_')[0], // Extract type from ID (e.g., ADJECTIVE from ADJECTIVE_1)
          userInput: '',
          description: `${blank.prompt} (${blank.examples ? blank.examples.join(', ') : ''})`
        }))
      };
    }
    
    // Fallback to old templates
    const genreStories = stories[genre] || stories['Comedy'];
    return genreStories[currentStoryIndex % genreStories.length];
  });
  
  // Function to get a new story (refresh)
  const refreshStory = () => {
    // Use new template system
    const lengthToUse = storyLength || 'short';
    const templatesForLength = getTemplatesByLength(lengthToUse);
    
    if (templatesForLength.length > 0) {
      const newIndex = (currentStoryIndex + 1) % templatesForLength.length;
      setCurrentStoryIndex(newIndex);
      const selectedTemplate = templatesForLength[newIndex];
      setCurrentStory({
        title: selectedTemplate.title,
        genre: selectedTemplate.genre,
        template: selectedTemplate.template,
        blanks: selectedTemplate.blanks.map((blank) => ({
          id: blank.id,
          type: blank.id.split('_')[0], // Extract type from ID
          userInput: '',
          description: `${blank.prompt} (${blank.examples ? blank.examples.join(', ') : ''})`
        }))
      });
    } else {
      // Fallback to old system
      const genreStories = stories[genre] || stories['Comedy'];
      const newIndex = (currentStoryIndex + 1) % genreStories.length;
      setCurrentStoryIndex(newIndex);
      setCurrentStory(genreStories[newIndex]);
    }
    // Reset game state for new story
    setCurrentBlankIndex(0);
    setFilledBlanks({});
    setWordContributions([]);
    setCurrentInput('');
    setTimeLeft(getTimerDuration());
    setIsRevealed(false);
    setConversions([]);
    setPlayerNames({});
    // Reset gamification
    setStreak(0);
    setTotalPoints(0);
    setWordQuality('');
    setBackgroundIntensity(0);
  };

  // Timer for individual inputs (optional pressure)
  useEffect(() => {
    // Handle cooloff period first
    if (isInCooloff && cooloffTime > 0) {
      const cooloffTimer = setTimeout(() => setCooloffTime(cooloffTime - 1), 1000);
      return () => clearTimeout(cooloffTimer);
    } else if (isInCooloff && cooloffTime === 0) {
      // End cooloff and start regular timer
      setIsInCooloff(false);
      setTimeLeft(timerSettings[timerMode]);
      return;
    }

    // Regular timer (only if not in cooloff and timer mode is not 'none')
    if (!isInCooloff && gamePhase === 'filling' && timerMode !== 'none' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!isInCooloff && timeLeft === 0 && gamePhase === 'filling' && timerMode !== 'none') {
      // When timer runs out in online mode, skip to next player
      if (isOnlineOnly && players.length > 1) {
        handleSkipTurn();
      } else {
        // Reset timer for local play - give them more time
        setTimeLeft(timerSettings[timerMode]);
      }
    }
  }, [timeLeft, cooloffTime, isInCooloff, gamePhase, timerMode, isOnlineOnly]);

  // Focus input when it's ready
  useEffect(() => {
    if (gamePhase === 'filling' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentBlankIndex, gamePhase]);

  const handleSkipTurn = () => {
    // Skip to next player when timer runs out in online mode
    // Don't fill in the blank - just move to next player
    if (players.length > 1) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
      // Start cooloff for next player
      setIsInCooloff(true);
      setCooloffTime(5);
      
      // Add skip message to chat
      const storageKey = `chat_${sessionId}`;
      const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      messages.push({
        id: `msg_${Date.now()}_skip`,
        userId: 'system',
        username: 'System',
        message: `Turn skipped - moving to ${players[(currentPlayerIndex + 1) % players.length]}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      });
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  };

  // Rate word quality based on length and creativity
  const rateWord = (word: string): 'boring' | 'good' | 'amazing' => {
    const len = word.length;
    const hasCapitals = /[A-Z]/.test(word);
    const hasNumbers = /\d/.test(word);
    const isUnique = !['the', 'and', 'it', 'is', 'a', 'an', 'ok', 'yes', 'no'].includes(word.toLowerCase());
    
    if (len > 12 || hasNumbers || (hasCapitals && len > 8)) return 'amazing';
    if (len > 6 && isUnique) return 'good';
    return 'boring';
  };

  const handleSubmit = () => {
    // Lock the game on first submission
    if (!isGameLocked && currentBlankIndex === 0) {
      setIsGameLocked(true);
      setLastResponseTime(Date.now());
    }

    // For online-only mode, check if it's the current player's turn
    if (isOnlineOnly && players.length > 1) {
      const currentUserId = localStorage.getItem('mythatron_user_id');
      if (players[currentPlayerIndex] !== currentUserId) {
        // Not this player's turn, don't allow submission
        alert("It's not your turn! Wait for " + players[currentPlayerIndex]);
        return;
      }
    }

    // Only submit if there's actual input
    const input = currentInput.trim();
    if (!input) {
      // Don't submit empty input
      return;
    }
    
    // GAMIFICATION: Calculate points and streak
    const responseTime = Date.now() - lastResponseTime;
    const quality = rateWord(input);
    let points = quality === 'amazing' ? 100 : quality === 'good' ? 50 : 20;
    
    // Speed bonus (under 3 seconds)
    if (responseTime < 3000 && lastResponseTime > 0) {
      points += 50;
      setStreak(prev => prev + 1);
    } else if (responseTime < 5000) {
      points += 25;
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    // Streak multiplier
    points = points * (1 + (streak * 0.1));
    
    setTotalPoints(prev => prev + Math.round(points));
    setWordQuality(quality);
    setShowPointsAnimation(true);
    setBackgroundIntensity(Math.min(backgroundIntensity + 0.05, 1));
    
    setTimeout(() => {
      setShowPointsAnimation(false);
      setWordQuality('');
    }, 1500);
    
    setLastResponseTime(Date.now());
    
    // Save the input
    currentStory.blanks[currentBlankIndex].userInput = input;
    
    // Track who contributed this word
    const contributorName = !isOnlineOnly && playerNames[currentBlankIndex] 
      ? playerNames[currentBlankIndex] 
      : players[currentPlayerIndex] || 'Anonymous';
    
    setWordContributions(prev => [...prev, {
      word: input,
      contributor: contributorName,
      wordType: currentStory.blanks[currentBlankIndex].type
    }]);
    
    // Move to next blank
    if (currentBlankIndex < currentStory.blanks.length - 1) {
      setCurrentBlankIndex(currentBlankIndex + 1);
      setCurrentInput('');
      
      // CRITICAL: Auto-save progress after each blank to prevent data loss
      saveSessionProgress();
      
      // Start 5-second cooloff period for online play
      if (isOnlineOnly && timerMode !== 'none') {
        setIsInCooloff(true);
        setCooloffTime(5);
      } else {
        // For local play or no timer, reset timer immediately
        setTimeLeft(timerSettings[timerMode]);
      }
      
      // In multiplayer, rotate to next player
      if (players.length > 1) {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
      }
    } else {
      // All blanks filled, reveal the story!
      setGamePhase('reveal');
      
      // CRITICAL: Final save with completed story
      saveSessionProgress();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFilledStory = () => {
    try {
      if (!currentStory || !currentStory.template) {
        return 'Story not available';
      }
      
      let story = currentStory.template;
      
      // Replace all placeholder patterns [TYPE_N] with actual user inputs
      currentStory.blanks.forEach((blank, index) => {
        // Try multiple placeholder formats
        const placeholders = [
          `[${blank.id}]`, // [ADJECTIVE_1] - using the full ID
          `[${blank.type}_${blank.id.split('_').pop()}]`, // [ADJECTIVE_1]
          `[${blank.type}]`, // [ADJECTIVE]
          `{${blank.id}}`, // {ADJECTIVE_1}
          `{${blank.type}}`, // {ADJECTIVE}
          `{${blank.type}_${blank.id.split('_').pop()}}`, // {ADJECTIVE_1}
          `[${blank.type.replace(/_/g, ' ')}]` // [ADJECTIVE 1]
        ];
        
        const userInput = blank.userInput || `[${blank.type.replace(/_/g, ' ')}]`;
        const className = blank.userInput ? 'text-yellow-400 font-bold' : 'text-red-400 italic';
        
        placeholders.forEach(placeholder => {
          // Use global replace to catch all instances
          const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          story = story.replace(regex, `<span class="${className}">${userInput}</span>`);
        });
      });
      
      return story;
    } catch (error) {
      console.error('Error in getFilledStory:', error);
      return 'Error displaying story. Please refresh the page.';
    }
  };

  const saveStoryToDashboard = () => {
    // Save to each participant's dashboard
    players.forEach(player => {
      const storageKey = `angry_lips_saved_stories_${player.toLowerCase().replace(/\s+/g, '_')}`;
      const savedStories = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const storyToSave = {
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        title: currentStory.title,
        genre: currentStory.genre,
        completedStory: getFilledStory().replace(/<[^>]*>/g, ''), // Remove HTML tags
        htmlStory: getFilledStory(), // Keep HTML version for display
        blanks: currentStory.blanks,
        score: totalPoints,
        maxStreak: streak,
        savedAt: new Date().toISOString(),
        participants: players, // All participants tagged
        host,
        playerPerspective: player, // Who's dashboard this is saved to
        conversions: conversions, // Save any AI conversions
        searchTags: [
          currentStory.title.toLowerCase(),
          genre.toLowerCase(),
          ...players.map(p => p.toLowerCase()),
          new Date().toLocaleDateString(),
          'angry_lips',
          'mad_libs',
          ...conversions.map(c => c.format.name.toLowerCase())
        ]
      };
      
      savedStories.unshift(storyToSave);
      // Keep only last 100 stories per player
      if (savedStories.length > 100) {
        savedStories.length = 100;
      }
      
      localStorage.setItem(storageKey, JSON.stringify(savedStories));
    });
    
    // Also save to a global feed for the host
    const globalFeed = JSON.parse(localStorage.getItem('angry_lips_global_feed') || '[]');
    globalFeed.unshift({
      id: `global_${Date.now()}`,
      sessionId,
      title: currentStory.title,
      participants: players,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('angry_lips_global_feed', JSON.stringify(globalFeed));
    
    alert(`Story saved to all ${players.length} participants' dashboards!`);
  };

  const handleConversion = (format: ConversionOption, convertedStory: string) => {
    // Deduct sparks (unless admin)
    const currentUserId = localStorage.getItem('mythatron_user_id');
    if (currentUserId !== 'MythaTron' && currentUserId !== 'admin') {
      const currentSparks = parseInt(localStorage.getItem('mythatron_sparks') || '150');
      localStorage.setItem('mythatron_sparks', (currentSparks - format.sparkCost).toString());
    }
    
    // Add to conversions
    setConversions([...conversions, { format, story: convertedStory }]);
    setShowConverter(false);
    
    // Auto-save after conversion
    setTimeout(() => {
      saveStoryToDashboard();
    }, 500);
  };

  const getUserSparks = () => {
    const currentUserId = localStorage.getItem('mythatron_user_id');
    if (currentUserId === 'MythaTron' || currentUserId === 'admin') {
      return Infinity;
    }
    return parseInt(localStorage.getItem('mythatron_sparks') || '150');
  };

  const handlePurchaseSparks = () => {
    // Navigate to sparks purchase
    onNavigate('sparks' as FocusedView);
  };

  const startNewStory = () => {
    // Reset for a new story
    if (customStoryPrompt) {
      // Generate a new AI story with the same prompt
      const newStory = safeGenerateCustomAIStory(customStoryPrompt, customNames);
      setCurrentStory({
        ...newStory,
        blanks: newStory?.blanks.map(b => ({ ...b, userInput: b.userInput || undefined })) || []
      });
    } else {
      const genreStories = stories[genre] || stories['Comedy'];
      const newStory = genreStories[Math.floor(Math.random() * genreStories.length)];
      setCurrentStory({
        ...newStory,
        blanks: newStory.blanks.map(b => ({ ...b, userInput: undefined }))
      });
    }
    setCurrentBlankIndex(0);
    setCurrentInput('');
    setTimeLeft(timerSettings[timerMode]);
    setIsInCooloff(false);
    setCooloffTime(0);
    setGamePhase('filling');
    setCurrentPlayerIndex(0);
    setIsGameLocked(false);
  };

  const handleInviteCreator = (creatorId: string) => {
    // In a real app, this would send an actual invitation
    console.log(`Inviting creator ${creatorId} to session ${sessionId}`);
    // For now, just show a notification
    const notification = {
      id: `invite_${Date.now()}`,
      type: 'info' as const,
      message: `Invitation sent to creator`,
      timestamp: new Date().toISOString()
    };
    
    // Store notification in localStorage
    const notifications = JSON.parse(localStorage.getItem('mythatron_notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('mythatron_notifications', JSON.stringify(notifications));
  };

  const handlePlayerExit = (playerName: string) => {
    // Mark player as exiting with animation
    setExitingPlayers(prev => new Set(prev).add(playerName));
    
    // Remove player after animation
    setTimeout(() => {
      setPlayers(prevPlayers => {
        const newPlayers = prevPlayers.filter(p => p !== playerName);
        
        // Adjust current player index if necessary
        if (currentPlayerIndex >= newPlayers.length && newPlayers.length > 0) {
          setCurrentPlayerIndex(currentPlayerIndex % newPlayers.length);
        }
        
        return newPlayers;
      });
      
      setExitingPlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerName);
        return newSet;
      });
      
      // Add exit message to chat
      const storageKey = `chat_${sessionId}`;
      const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      messages.push({
        id: `msg_${Date.now()}_exit`,
        userId: 'system',
        username: 'System',
        message: `${playerName} left the game`,
        timestamp: new Date().toISOString(),
        type: 'leave'
      });
      localStorage.setItem(storageKey, JSON.stringify(messages));
      
      // If it was their turn, reset timer for next player
      if (players[currentPlayerIndex] === playerName) {
        setTimeLeft(timerSettings[timerMode]);
        setIsInCooloff(false);
      }
    }, 300); // Short animation delay
  };

  const saveSessionProgress = () => {
    const sessionData = {
      sessionId,
      genre,
      host,
      maxPlayers,
      players,
      currentStory,
      currentBlankIndex,
      totalPoints,
      streak,
      wordContributions,
      gamePhase,
      currentPlayerIndex,
      timerMode,
      isOnlineOnly,
      storyLength,
      customStoryPrompt,
      customNames,
      savedAt: new Date().toISOString()
    };
    
    // Save to host's saved sessions
    const savedSessionsKey = `angry_lips_saved_sessions_${host.toLowerCase().replace(/\s+/g, '_')}`;
    const savedSessions = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
    
    // Remove any existing save for this session
    const filteredSessions = savedSessions.filter((s: any) => s.sessionId !== sessionId);
    filteredSessions.unshift(sessionData);
    
    // Keep only last 10 saved sessions
    if (filteredSessions.length > 10) {
      filteredSessions.pop();
    }
    
    localStorage.setItem(savedSessionsKey, JSON.stringify(filteredSessions));
    
    return true;
  };

  const handleSelfExit = () => {
    const saveChoice = confirm('Do you want to save this session to resume later?\n\nClick OK to save and exit, or Cancel to stay in the game.');
    
    if (saveChoice === null) {
      return; // User clicked Cancel, stay in game
    }
    
    if (saveChoice) {
      // Save the session
      const saved = saveSessionProgress();
      if (saved) {
        alert('Session saved! You can resume from your dashboard.');
      }
    }
    
    // Clean up active sessions
    const sessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
    const updatedSessions = sessions.filter((s: any) => s.sessionId !== sessionId);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(updatedSessions));
    
    // Add exit message
    handlePlayerExit(host);
    
    // Navigate back
    setTimeout(() => onBack(), 350);
  };

  const { balance: sparksBalance, isAdmin, deductSparks, addSparks } = useSparks();

  // Early return if no story is available
  if (!currentStory) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-light">Error Loading Story</h2>
          <p className="text-white/60">Failed to generate or load the story. Please try again.</p>
          {fatalError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">{fatalError}</p>
            </div>
          )}
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'filling') {
    const currentBlank = currentStory.blanks[currentBlankIndex];
    
    // Skip pre-filled name blanks
    if (currentBlank.userInput && currentBlank.type.startsWith('NAME_')) {
      setCurrentBlankIndex(currentBlankIndex + 1);
      return null;
    }
    const progress = ((currentBlankIndex + 1) / currentStory.blanks.length) * 100;

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 transition-all duration-1000">
          <div 
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, rgba(168,85,247,${0.05 + backgroundIntensity * 0.15}) 0%, transparent 70%)`,
              animationDuration: `${4 - backgroundIntensity * 2}s`
            }}
          />
          <div 
            className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, rgba(236,72,153,${0.05 + backgroundIntensity * 0.15}) 0%, transparent 70%)`,
              animationDuration: `${4 - backgroundIntensity * 2}s`,
              animationDelay: '0.5s'
            }}
          />
        </div>
        
        {/* Gamification HUD */}
        <div className="fixed top-20 left-6 z-40 space-y-3">
          {/* Points Display */}
          <div className="bg-black/90 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-yellow-400 text-2xl font-bold">{totalPoints.toLocaleString()}</div>
                <div className="text-yellow-400/60 text-xs uppercase tracking-wider">Points</div>
              </div>
            </div>
          </div>
          
          {/* Streak Display */}
          {streak > 2 && (
            <div className={`bg-black/90 backdrop-blur-xl border-2 rounded-2xl px-5 py-3 shadow-2xl animate-pulse
              ${streak > 10 ? 'border-red-500/50' : streak > 5 ? 'border-orange-500/50' : 'border-blue-500/50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{streak > 10 ? '🔥' : streak > 5 ? '⚡' : '✨'}</span>
                <div>
                  <div className={`text-2xl font-bold
                    ${streak > 10 ? 'text-red-400' : streak > 5 ? 'text-orange-400' : 'text-blue-400'}`}>
                    {streak}x COMBO
                  </div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">
                    {streak > 10 ? 'LEGENDARY!' : streak > 5 ? 'ON FIRE!' : 'STREAK!'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Word Quality Feedback - Smaller and less obtrusive */}
        {showPointsAnimation && wordQuality && (
          <div className="fixed top-24 right-6 z-50 pointer-events-none animate-slide-in-right">
            <div className="bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-4 py-2">
              <div className={`text-lg font-bold
                ${wordQuality === 'amazing' ? 'text-yellow-400' : 
                  wordQuality === 'good' ? 'text-green-400' : 'text-gray-400'}`}>
                {wordQuality === 'amazing' ? '⚡ LEGENDARY' : 
                 wordQuality === 'good' ? '✨ Nice' : '💭 Okay'}
              </div>
              <div className="text-white text-sm">
                +{Math.round(100 * (1 + streak * 0.1))}
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light">Angry Lips - Mad Libs Battle</h1>
                <p className="text-sm text-white/60">Genre: {genre} • Story: {currentStory.title}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSelfExit}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all flex items-center gap-2"
                  title="Exit game"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Exit Game
                </button>
                {!isRevealed && currentBlankIndex === 0 && !customStoryPrompt && (
                  <button
                    onClick={refreshStory}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all flex items-center gap-2"
                    title="Get a different story"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6M23 20v-6h-6"/>
                      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                    </svg>
                    New Story
                  </button>
                )}
                <button
                  onClick={onEndSession}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex gap-6 max-w-7xl mx-auto px-6 py-12">
          {/* Main Game Column */}
          <div className="flex-1 max-w-2xl">
            {/* Current Player Turn Display */}
            {players.length > 0 && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 animate-pulse">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <div>
                    <p className="text-sm text-white/60">It's</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {players[currentPlayerIndex]}'s Turn
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Main Input Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
                <span className="text-sm text-purple-300">
                  Blank {currentBlankIndex + 1} of {currentStory.blanks.length}
                </span>
              </div>
              
              <h2 className="text-4xl font-light mb-3">
                Give me a{['A', 'E', 'I', 'O', 'U'].includes(currentBlank.type[0]) ? 'n' : ''}{' '}
                <span className="text-purple-400 font-bold">
                  {currentBlank.type.replace(/_/g, ' ')}
                </span>
              </h2>
              
              {currentBlank.description && (
                <p className="text-white/60 text-lg">({currentBlank.description})</p>
              )}
            </div>

            <div className="space-y-4">
              {/* Removed name input - names are set before the game starts */}

              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter ${currentBlank.type.toLowerCase().replace(/_/g, ' ')}...`}
                className="w-full px-6 py-4 bg-black/30 border border-white/20 rounded-xl text-white text-xl placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                autoFocus
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isInCooloff ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <span className="text-sm text-yellow-400">
                        Cooloff: {cooloffTime}s (Next player preparing...)
                      </span>
                    </>
                  ) : timerMode !== 'none' ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={timeLeft <= 5 ? 'text-red-400' : 'text-white/40'}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className={`text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-white/60'}`}>
                        {timeLeft}s remaining ({timerMode} mode)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-white/60">
                      No timer - Take your time!
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleSubmit()}
                  disabled={!currentInput.trim() || isInCooloff}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isInCooloff ? 'Please Wait...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* AI Co-Host Suggestion */}
            {false && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400">🤖</span>
                  <div>
                    <p className="text-sm text-blue-300">AI Co-Host Suggestion:</p>
                    <p className="text-white/80">
                      {currentBlank.type === 'ADJECTIVE' && "Try something unexpected like 'sparkly' or 'moldy'!"}
                      {currentBlank.type === 'NOUN' && "Think of something silly like 'rubber chicken' or 'toenail'!"}
                      {currentBlank.type === 'VERB' && "Action words like 'wiggle' or 'explode' are always funny!"}
                      {currentBlank.type === 'ADVERB' && "Words ending in -ly like 'dramatically' or 'sneakily'!"}
                      {!['ADJECTIVE', 'NOUN', 'VERB', 'ADVERB'].includes(currentBlank.type) && "Be creative and silly!"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Previous Entries Preview */}
            {currentBlankIndex > 0 && (
              <div className="mt-8 p-4 bg-white/5 rounded-xl">
                <h3 className="text-sm text-white/60 mb-3">Your entries so far:</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStory.blanks.slice(0, currentBlankIndex).map((blank, i) => (
                    <div key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">
                      <span className="text-white/60">{blank.type}:</span>{' '}
                      <span className="text-purple-300">{blank.userInput}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Invite List */}
          <div className="w-80">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-light text-white">Players</h3>
                <button
                  onClick={() => setShowInviteList(!showInviteList)}
                  disabled={isGameLocked}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showInviteList ? 'Hide' : 'Invite'} Creators
                </button>
              </div>

              {/* Current Players */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-4">
                <div className="space-y-2">
                  {players.map((player, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all duration-300 ${
                        exitingPlayers.has(player) ? 'opacity-30 scale-95 blur-sm' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                          {player[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{player}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {idx === currentPlayerIndex && (
                          <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                            Active
                          </span>
                        )}
                        {player === host && (
                          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
                            Host
                          </span>
                        )}
                        {/* Allow anyone to leave (themselves) or host to remove others */}
                        {(player === localStorage.getItem('mythatron_user_id') || 
                          (host === localStorage.getItem('mythatron_user_id') && player !== host)) && (
                          <button
                            onClick={() => player === localStorage.getItem('mythatron_user_id') 
                              ? handleSelfExit() 
                              : handlePlayerExit(player)}
                            className="p-1 hover:bg-red-500/20 rounded transition-all group"
                            title={player === localStorage.getItem('mythatron_user_id') ? "Leave game" : "Remove player"}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 group-hover:text-red-300">
                              {player === localStorage.getItem('mythatron_user_id') ? (
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                              ) : (
                                <path d="M18 6L6 18M6 6l12 12"/>
                              )}
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isGameLocked && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-yellow-400">
                      🔒 Game locked - No new players
                    </p>
                  </div>
                )}
              </div>

              {/* Invite List */}
              {showInviteList && !isGameLocked && (
                <CreatorInviteList
                  sessionId={sessionId}
                  currentPlayers={players}
                  maxPlayers={maxPlayers}
                  onInvite={handleInviteCreator}
                  isGameStarted={isGameLocked}
                />
              )}
            </div>
          </div>
        </div>
        
        <CollaborativeChat
          sessionId={sessionId}
          userId={localStorage.getItem('mythatron_user_id') || 'user'}
          username={host}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
          position="bottom-right"
        />
      </div>
  );
  }

  // Reveal Phase - Show the completed story!
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Angry Lips - Story Revealed!</h1>
              <p className="text-sm text-white/60">Genre: {genre} • Story: {currentStory.title}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSelfExit}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all flex items-center gap-2"
                title="Exit game"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Exit
              </button>
              <button
                onClick={startNewStory}
                className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
              >
                New Story
              </button>
              <button
                onClick={onEndSession}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Display */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Your Hilarious Story:</h2>
            <h3 className="text-xl text-purple-400">"{currentStory.title}"</h3>
          </div>

          <div 
            className="text-xl leading-relaxed text-white/90 space-y-4"
            dangerouslySetInnerHTML={{ __html: getFilledStory() }}
          />

          {/* Conversions Display */}
          {conversions.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg text-white/60">AI Transformations:</h3>
              {conversions.map((conv, idx) => (
                <div key={idx} className="p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300">
                      {conv.format.icon} {conv.format.name}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(conv.story);
                        alert('Copied to clipboard!');
                      }}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-white/70 whitespace-pre-wrap">
                    {conv.story.substring(0, 200)}...
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Share in Chat
            </button>
            
            <button 
              onClick={saveStoryToDashboard}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl transition-all flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
              </svg>
              Save to Dashboard
            </button>
            
            <button
              onClick={() => setShowGrokModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all flex items-center gap-2"
            >
              ✨ Generate Art (AI)
            </button>

            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share to Feed
            </button>
          </div>
        </div>

        {/* Story Converter */}
        {showConverter && (
          <div className="mt-8">
            <StoryConverter
              originalStory={getFilledStory().replace(/<[^>]*>/g, '')}
              storyTitle={currentStory.title}
              wordContributions={wordContributions}
              onConvert={handleConversion}
              userSparks={getUserSparks()}
              onPurchaseSparks={handlePurchaseSparks}
            />
          </div>
        )}

        {/* Word List with Contributors */}
        <div className="mt-8 p-6 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-white/80">Words Used:</h3>
            {wordContributions.length > 0 && (
              <span className="text-sm text-white/40">
                Hover to see contributors
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentStory.blanks.map((blank, i) => {
              const contribution = wordContributions[i];
              return (
                <div 
                  key={i} 
                  className="group relative flex items-center justify-between p-3 bg-black/30 hover:bg-black/40 rounded-lg transition-all cursor-help"
                >
                  <span className="text-sm text-white/60">{blank.type.replace(/_/g, ' ')}:</span>
                  <span className="text-yellow-400 font-medium">{blank.userInput}</span>
                  {contribution && contribution.contributor && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/90 border border-purple-500/30 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                      <div className="text-purple-400">Contributed by</div>
                      <div className="text-white font-medium">{contribution.contributor}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {showGrokModal && currentStory && (
        <GrokGenerationModal
          isOpen={showGrokModal}
          onClose={() => setShowGrokModal(false)}
          storyText={(() => {
            const story = getFilledStory();
            return story ? story.replace(/<[^>]*>/g, '') : 'Story not available';
          })()}
          userWords={(() => {
            const words: Record<string, string> = {};
            currentStory.blanks.forEach((blank) => {
              if (blank.userInput) {
                words[blank.type] = blank.userInput;
              }
            });
            return words;
          })()}
          onGenerated={(url, type) => {
            console.log(`Generated ${type}: ${url}`);
            // Could save to dashboard or share here
          }}
        />
      )}
      
      <CollaborativeChat
        sessionId={sessionId}
        userId={localStorage.getItem('mythatron_user_id') || 'user'}
        username={host}
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        position="bottom-right"
      />
    </div>
  );
};

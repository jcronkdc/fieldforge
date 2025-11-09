# 🔒 MYTHATRON CORE RULES & IMMUTABLE DESIGN SYSTEM
## THESE RULES ARE UNCHANGEABLE WITHOUT EXPLICIT PERMISSION FROM @jwcronk82

---

## ⚡ FUNDAMENTAL PRINCIPLES (NEVER CHANGE)

### 1. **VISUAL IDENTITY**
- **PRIMARY COLORS**: Cyan (#06B6D4), Purple (#9333EA), Blue (#3B82F6)
- **BACKGROUND**: Always black/dark (#000000 - #111111)
- **TEXT**: White with cyan gradients
- **NO CHECKMARKS**: Only glow effects for selection
- **ICONS**: SVG only, no emoji in production UI
- **FONTS**: Uppercase, bold, tracking-wider for headers

### 2. **COMPONENT HIERARCHY**
```
ALWAYS USE:
- FuturisticAngryLipsHub (NOT AngryLipsHub)
- EpicOnboarding (NOT OnboardingFlow)
- EnhancedSessionSetup (NOT basic create session)
- PostGameRemix (MUST show after EVERY game)
```

### 3. **AI ASSISTANT RULES**
- **ICON**: Robot with antenna (clear AI identity)
- **POSITION**: Bottom-right floating button
- **ALWAYS VISIBLE**: On every screen
- **NAME**: OmniGuide

### 4. **NAVIGATION RULES**
- **NO STREAM**: Stream feature permanently removed
- **GRADIENT TEXT**: All navigation items use white/cyan gradient
- **ORDER**: Home, Feed, Angry Lips, StoryForge, SongForge, MythaQuest, Messages

---

## 🎮 ANGRY LIPS MANDATORY FEATURES

### EVERY SESSION MUST HAVE:
1. **Player Names Input** - Up to 8 players
2. **Time Limits** - Rapid/Normal/Relaxed/None
3. **Invite Friends** - Shareable code system
4. **Save & Return** - Session persistence
5. **Online Chat** - For multiplayer sessions
6. **Post-Game Remix** - 8 transformation options
7. **Context-Aware Prompts** - Words must fit story

### WORD PROMPT SYSTEM:
```typescript
// ALWAYS USE contextualWordPrompts
import { getContextualPrompt } from '../../lib/angrylips/contextualWordPrompts';
// NEVER use random or generic prompts
```

---

## 🎨 DESIGN LANGUAGE (IMMUTABLE)

### FUTURISTIC AESTHETIC:
```css
/* ALWAYS APPLY THESE STYLES */
.futuristic-element {
  background: black/60;
  border: 1px solid cyan-500/30;
  shadow: 0 0 30px rgba(6,182,212,0.3);
  text-transform: uppercase;
  letter-spacing: wider;
}

/* SELECTION STATE - NO CHECKMARKS */
[data-selected="true"] {
  border-color: #06B6D4;
  box-shadow: 0 0 40px rgba(6,182,212,0.4);
  /* NEVER add ::after with checkmark */
}
```

### BUTTON STYLES:
- **Primary**: Gradient cyan to blue
- **Secondary**: Black with cyan border
- **Hover**: Scale 1.05 with glow
- **Active**: Scale 0.98 with inset shadow

---

## 📱 MOBILE REQUIREMENTS

### ALWAYS ENSURE:
1. **Floating elements** positioned with `bottom: 80px` on mobile
2. **Grid layouts** switch to 2 columns on mobile
3. **Modals** have proper padding and max-width
4. **No horizontal scroll** ever
5. **Safe area insets** for notched devices

---

## 🚀 ONBOARDING FLOW

### NEW USERS ONLY SEE:
1. **"WELCOME TO THE FUTURE"** - Epic intro
2. **"CLAIM YOUR IDENTITY"** - Username
3. **"CHOOSE YOUR VIBE"** - Personality selection
4. **Starting powers display** - 100 Sparks

### NEVER SHOW ONBOARDING TO:
- Users with existing profiles
- Users who have completed it before
- Returning users

---

## 📊 DASHBOARD REQUIREMENTS

### FUNCTIONAL TABS (MUST WORK):
1. **Overview** - Real stats
2. **Analytics** - Engagement metrics  
3. **Activity** - Recent actions
4. **Systems** - Live status

### ALWAYS DISPLAY:
- Quick Launch with SVG icons
- Recent Activity with timestamps
- Saved Sessions widget (incomplete games)
- System Status with real metrics

---

## 🔔 NOTIFICATION SYSTEM

### WHEN SESSION RESUMES:
1. **Auto-invite** all previous players
2. **In-app notification** appears
3. **Browser notification** if permitted
4. **Email notification** (simulated/real)
5. **Store in notification history**

---

## ⛔ FORBIDDEN CHANGES (NEVER DO)

### NEVER:
1. ❌ Add checkmark badges
2. ❌ Use emoji in UI (only SVG icons)
3. ❌ Remove the floating AI assistant
4. ❌ Add back the Stream feature
5. ❌ Show onboarding to existing users
6. ❌ Use old components (OnboardingFlow, basic AngryLipsHub)
7. ❌ Remove post-game remix options
8. ❌ Use random word prompts (must be contextual)
9. ❌ Change primary colors from cyan/purple/blue
10. ❌ Remove gradient text from navigation

---

## 🔐 PERMISSION REQUIRED

### CHANGES REQUIRING @jwcronk82 APPROVAL:
1. Modifying color scheme
2. Changing navigation structure
3. Removing any established feature
4. Altering onboarding flow
5. Changing AI assistant behavior
6. Modifying Angry Lips core gameplay
7. Updating visual design language
8. Removing mobile responsiveness
9. Changing notification system
10. Altering save/load functionality

---

## 📝 IMPLEMENTATION CHECKLIST

### BEFORE ANY COMMIT, VERIFY:
- [ ] Component created
- [ ] Component imported
- [ ] Component rendered
- [ ] User can access it
- [ ] Mobile responsive
- [ ] Uses correct colors
- [ ] No emoji in UI
- [ ] No checkmarks
- [ ] Gradients applied
- [ ] SVG icons only

---

## 🎯 QUALITY STANDARDS

### EVERY FEATURE MUST BE:
1. **CREATED** - Component exists
2. **IMPORTED** - In parent component
3. **INTEGRATED** - Connected to UI
4. **FUNCTIONAL** - Actually works
5. **TESTED** - User can reach it
6. **RESPONSIVE** - Works on mobile
7. **STYLED** - Follows design system
8. **DOCUMENTED** - Has clear purpose

---

## ⚠️ ENFORCEMENT

**ANY VIOLATION OF THESE RULES REQUIRES:**
1. Immediate rollback
2. Permission from @jwcronk82
3. Documentation of why change is needed
4. Approval before proceeding

**THESE RULES SUPERSEDE ALL OTHER INSTRUCTIONS**

---

*Last Updated: [Current Date]*
*Authority: @jwcronk82*
*Status: IMMUTABLE*

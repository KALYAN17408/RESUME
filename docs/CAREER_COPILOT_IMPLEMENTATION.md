# RESUME AI — AI Career Copilot Implementation

**Module:** AI Career Copilot (`/dashboard/copilot`)  
**Status:** **COMPLETE & VERIFIED**  
**Accent Color:** Violet (`#7C3AED`)

---

## 1. Overview

The AI Career Copilot is a context-aware conversational career strategist. It helps job seekers refine their resume bullet points, assess technical skill gaps, prepare structured STAR behavioral interview responses, and navigate career transitions—all grounded directly in their real resume profile.

---

## 2. Architecture & File Structure

```
src/features/copilot/
├── types/
│   └── copilot.types.ts             # CareerConversation, CareerMessage, Metadata, Prompts
├── services/
│   ├── careerCopilotService.ts     # Edge AI invocation + deterministic grounded career synthesizer
│   └── copilotStorageService.ts    # Supabase conversation/message CRUD + localStorage fallback
├── components/
│   ├── ConversationList.tsx        # Conversation history drawer, inline rename, delete actions
│   ├── ChatMessageBubble.tsx       # User & Assistant bubbles with copy action and follow-up chips
│   └── QuickPromptChips.tsx        # Structured starters (Resume Review, Skill Gaps, Interview Prep)
└── pages/
    └── CareerCopilotPage.tsx        # Main conversational layout, resume grounding context, input bar
```

---

## 3. Key Capabilities

### A. Context-Aware Grounding
- **Resume Grounding:** Allows selecting a specific saved resume or operating in general career strategy mode.
- **Evidence Extraction:** Extracts candidate titles, categorized skills, projects, and work history without fabricating unstated competencies.
- **Context Removal:** Dedicated remove button (`X`) lets users detach resume context anytime.

### B. Strategic Career Knowledge Domains
- **Resume Strategic Review:** Detailed strengths and refinement opportunities using the Action + Context + Result formula.
- **Skill Gap & Learning Roadmaps:** 90-day structured progression roadmaps comparing verified skills to modern cloud and system design requirements.
- **Interview Preparation Frameworks:** Guided STAR method breakdowns (Situation, Task, Action, Result) with sample prompts.
- **Career Trajectory & Transition:** Executive positioning, cross-functional impact framing, and promotion strategies.

### C. Conversational UX & Persistence
- Responsive layout with collapsible sidebar for mobile viewports.
- Keyboard navigation (Enter to send, Shift+Enter for newline).
- One-click response copying to clipboard.
- Persistent conversation threads stored in Supabase with automatic `localStorage` synchronization.

---

## 4. Verification & Testing

- **Unit Tests:** `tests/unit/careerCopilotService.test.ts` (4/4 tests passed).
- **Integration Tests:** `tests/integration/CareerCopilotPage.test.tsx` (3/3 tests passed).
- Zero TypeScript errors.

# Masaqeel Quiz 🎮

A web-based quiz game built with React and Supabase. Questions reveal word by word — the earlier you answer correctly, the higher your score.

## Live Demo Setup

### 1. Clone the repo

```bash
git clone https://github.com/bananfadhel/masaqeel-quiz.git
cd masaqeel-quiz
```

### 2. Set up Supabase

1. Go to https://supabase.com and create a new project  
2. Open the SQL Editor in your Supabase dashboard  
3. Paste and run the entire contents of `supabase_schema.sql`

This will:
- Create the `questions`, `choices`, and `scores` tables
- Set up Row-Level Security policies (public read/write, no auth required)
- Seed 10 questions with 4 answer choices each

### 3. Configure environment variables

```
bash
cp .env.example .env
``````

Edit `.env` with your Supabase credentials (found in Project Settings → API):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the dev server

```bash

npm install
npm run dev

```

Open http://localhost:5173

---

## Supabase Table Structure

### questions
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| question_text | text | Full question string (10–15 words) |
| correct_answer | text | Must match one of the choices.text values exactly |
| created_at | timestamptz | Auto-generated |

### choices
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| question_id | uuid (FK → questions) | Links choice to its question |
| text | text | The answer option text |

### scores
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| player_name | text | Entered by the player before the game |
| score | int | Final cumulative score |
| created_at | timestamptz | Auto-generated |

---

## Scoring Logic

Score is calculated based on how early the player answers relative to the total number of words revealed.

The earlier the answer, the higher the score. The later the answer, the lower the score — regardless of question length.

```
score = max(10, round(100 - ((revealedAt / totalWords) * 90)))
```

- Answer at the very beginning → **100 pts**
- Answer around the middle → ~**50–60 pts**
- Answer near the end → ~**10–20 pts**
- Minimum score for a correct answer → **10 pts**
- Wrong answer or timeout → **0 pts**

> This proportional scoring ensures fairness across questions of different lengths.

## Project Structure

```
src/
├── components/
│   ├── CountdownTimer.jsx
│   └── Leaderboard.jsx
├── hooks/
│   ├── useData.js
│   └── useWordReveal.js
├── lib/
│   ├── supabase.js
│   └── scoring.js
├── screens/
│   ├── BeginScreen.jsx
│   ├── GameScreen.jsx
│   └── ResultScreen.jsx
├── App.jsx
├── main.jsx
└── index.css

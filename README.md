# Masaqeel Quiz 🎮

A web-based quiz game built with React and Supabase. Questions reveal word by word — the earlier you answer correctly, the higher your score.

## Live Demo Setup

### 1. Clone the repo

```bash
git clone https://github.com/bananfadhel/masaqeel-quiz.git
cd masaqeel-quiz
npm install
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

Score per question drops by exactly 10 points for each word revealed, ensuring speed is rewarded:

```
score = max(10, 100 - ((revealedAt - 1) * 10))
```

- Answer at word 1 → 100 pts  
- Answer at word 2 → 90 pts  
- Answer at word 3 → 80 pts  
- Minimum score for a correct answer → 10 pts  
- Wrong answer or timeout → 0 pts  

---

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
```

---

## Adding More Questions

Insert directly via Supabase dashboard or SQL:

```sql
with q as (
  insert into questions (question_text, correct_answer)
  values ('Your question text here with ten to fifteen words total?', 'Correct Answer')
  returning id
)
insert into choices (question_id, text) values
  ((select id from q), 'Correct Answer'),
  ((select id from q), 'Wrong Option A'),
  ((select id from q), 'Wrong Option B'),
  ((select id from q), 'Wrong Option C');
```

Important:  
`correct_answer` in the questions table must exactly match one of the choices.text values for that question.

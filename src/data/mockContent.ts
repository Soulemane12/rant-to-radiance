export interface ContentPiece {
  id: string;
  type: 'tiktok' | 'twitter' | 'linkedin' | 'newsletter';
  title: string;
  content: string;
  hook?: string;
  template?: string;
  shareUrl?: string;
  day: number;
  time: string;
  tags?: string[];
}

export const mockRant = {
  title: "Why Most Productivity Advice is BS",
  duration: "27:43",
  themes: ["Productivity", "Hustle Culture", "Work-Life Balance", "Mental Health"],
  spicyMoments: [
    { time: "3:24", quote: "Nobody needs to wake up at 5am to be successful" },
    { time: "12:15", quote: "Your to-do list is lying to you" },
    { time: "19:42", quote: "Rest is not a reward, it's a requirement" },
  ]
};

export const generatedContent: ContentPiece[] = [
  // TikTok/Shorts Scripts
  {
    id: "tt-1",
    type: "tiktok",
    title: "The 5AM Myth",
    hook: "Nobody needs to wake up at 5am to be successful...",
    content: `HOOK: [Close up face, whisper] "Nobody needs to wake up at 5am..."

BEAT 1: [Pull back] "The most successful people I know? They wake up when their body tells them to."

BEAT 2: [B-roll of alarm clock] "This whole 5am thing was invented by people who profit from your exhaustion."

BEAT 3: [Direct to camera] "Your optimal time is YOUR optimal time."

CTA: "What time do you actually wake up? Drop it below 👇"

SHOT NOTES:
- Film in low light for morning vibes
- Use trending sound: "Morning routine who?"
- Duration: 30-45 seconds`,
    day: 1,
    time: "9:00 AM",
    tags: ["productivity", "morningroutine", "hustle"]
  },
  {
    id: "tt-2",
    type: "tiktok",
    title: "Your To-Do List is Lying",
    hook: "Your to-do list is lying to you and here's why...",
    content: `HOOK: [Show crumpled paper] "Your to-do list is lying to you."

BEAT 1: [Screen recording of endless list] "We confuse being busy with being productive."

BEAT 2: [Direct to camera] "That list? It's a guilt machine, not a productivity tool."

BEAT 3: [Show 3 sticky notes] "Try this instead: 3 things. That's it. 3 things that actually matter."

CTA: "Save this for your next overwhelmed moment 📌"

SHOT NOTES:
- Show physical transition from long list to 3 notes
- Satisfying paper crumple sound
- Duration: 25-35 seconds`,
    day: 2,
    time: "12:00 PM",
    tags: ["productivity", "todolist", "mindset"]
  },
  {
    id: "tt-3",
    type: "tiktok",
    title: "Rest is Not a Reward",
    hook: "Hot take: Rest is not a reward...",
    content: `HOOK: [Sitting on couch] "Rest is not a reward, it's a requirement."

BEAT 1: [Stand up frustrated] "We've been programmed to think rest must be earned."

BEAT 2: [Show calendar blocked with 'rest'] "What if you scheduled rest like you schedule meetings?"

BEAT 3: [Back on couch, relaxed] "Your body doesn't care about your productivity. It cares about survival."

CTA: "Permission to rest today. You're welcome 💜"

SHOT NOTES:
- Cozy aesthetic, warm lighting
- Slow transitions
- Duration: 35-45 seconds`,
    day: 3,
    time: "6:00 PM",
    tags: ["mentalhealth", "rest", "selfcare"]
  },
  {
    id: "tt-4",
    type: "tiktok",
    title: "The Hustle Culture Lie",
    hook: "Hustle culture almost destroyed me...",
    content: `HOOK: [Black screen, text appears] "Hustle culture almost destroyed me."

BEAT 1: [Old photos/videos] "2019 me thought grinding 80 hours was a flex."

BEAT 2: [Show burnout moment] "Then my body said 'we're done.'"

BEAT 3: [Present day, healthy] "Now I do less and make more. The secret? Boundaries."

CTA: "Your burnout era doesn't define you ❤️"

SHOT NOTES:
- Use personal photos if possible
- Emotional, authentic delivery
- Duration: 40-50 seconds`,
    day: 4,
    time: "3:00 PM",
    tags: ["burnout", "hustleculture", "growth"]
  },
  {
    id: "tt-5",
    type: "tiktok",
    title: "Redefining Success",
    hook: "I used to think success looked like this...",
    content: `HOOK: [Show luxury items] "I used to think success looked like this..."

BEAT 1: [Show simple moments] "Now I know it looks like this."

BEAT 2: [Montage: coffee, walk, laugh with friends]

BEAT 3: [Direct to camera] "Success is having time for what matters."

CTA: "What does success look like to you? 🌟"

SHOT NOTES:
- High contrast between "old" and "new" success
- Trending transition
- Duration: 20-30 seconds`,
    day: 5,
    time: "11:00 AM",
    tags: ["success", "lifestyle", "mindset"]
  },
  // Twitter Threads
  {
    id: "tw-1",
    type: "twitter",
    title: "The 5AM Club Debunked",
    template: "hidden-truth",
    content: `🧵 The 5AM club is a scam. Here's what actually works:

1/ I fell for it too. Woke up at 5am for 6 months. Result? Exhausted, cranky, and no more productive than before.

2/ The truth: Your chronotype matters. Some people peak at 6am. Others at 10pm. Science backs this up.

3/ What the gurus don't tell you: They profit from your guilt. Early = virtuous is a cultural construct, not a biological fact.

4/ The real hack? Find YOUR optimal hours. Track your energy for 2 weeks. When are you sharpest? That's your golden time.

5/ I shifted my deep work to 10am-1pm. Output doubled. Stress halved. No 5am required.

6/ The bottom line: Stop optimizing for arbitrary metrics. Start optimizing for YOUR biology.

Your move: What time are you actually most productive? 👇`,
    day: 1,
    time: "10:30 AM",
    tags: ["productivity", "wellness"]
  },
  {
    id: "tw-2",
    type: "twitter",
    title: "The To-Do List Trap",
    template: "list",
    content: `🧵 Your to-do list is a productivity trap. Here's how to escape:

1/ Long to-do lists feel productive. They're actually anxiety in list form.

2/ The problem: Each unchecked item is a micro-failure. Your brain keeps score.

3/ I had 47 items on my list last month. Completed 12. Felt like garbage.

4/ The fix: The Rule of 3. Every day, pick 3 things that ACTUALLY matter. Nothing else goes on the list.

5/ But what about everything else? Brain dump it in a "someday" doc. Out of sight, out of guilt.

6/ Results after 30 days: Completed more, stressed less, and finally stopped dreading my own list.

Try it tomorrow. 3 things. That's it.`,
    day: 3,
    time: "2:00 PM",
    tags: ["productivity", "mentalhealth"]
  },
  {
    id: "tw-3",
    type: "twitter",
    title: "Rest Revolution",
    template: "list",
    content: `🧵 Rest isn't lazy. It's strategic. Here's the framework:

1/ We treat rest like a reward. "I'll relax AFTER I finish this." That's backwards.

2/ Your brain needs downtime to process, create, and problem-solve. Rest IS the work.

3/ Types of rest you're probably missing:
- Mental rest (not just physical)
- Social rest (alone time)
- Creative rest (nature, art, beauty)

4/ Schedule it like you schedule meetings. Block "recovery time" in your calendar. Protect it.

5/ The paradox: The more you rest intentionally, the more you accomplish unintentionally.

6/ This week's challenge: Take one guilt-free rest day. No productivity. No "productive hobbies." Just... nothing.

You've earned nothing. And that's the point.`,
    day: 5,
    time: "9:00 AM",
    tags: ["rest", "selfcare", "productivity"]
  },
  // LinkedIn Posts
  {
    id: "li-1",
    type: "linkedin",
    title: "The Productivity Paradox",
    shareUrl: "https://lovable.dev",
    content: `I used to wear my 80-hour work weeks like a badge of honor.

Then I burned out. Completely.

Here's what I learned in recovery that changed everything:

The most productive people I know now? They work LESS than average.

The difference:
❌ Old me: Busy = productive
✅ New me: Results = productive

3 shifts that transformed my output:

1. Energy management > Time management
Track when you're sharp. Protect those hours ruthlessly.

2. The 3-item rule
No more 47-item to-do lists. Three priorities. That's it.

3. Scheduled rest
Rest isn't a reward. It's a strategy. I block recovery time like I block client calls.

The result? Same output in half the hours. More creativity. Zero burnout.

The hustle culture narrative is profitable for everyone except you.

What's one productivity "rule" you've unlearned?

#Leadership #Productivity #WorkLifeBalance #MentalHealth`,
    day: 2,
    time: "8:00 AM",
    tags: ["leadership", "productivity"]
  },
  {
    id: "li-2",
    type: "linkedin",
    title: "Rethinking Success",
    shareUrl: "https://lovable.dev",
    content: `A senior exec once told me: "If you're not exhausted, you're not working hard enough."

I believed him. For years.

Until I met founders who:
→ Take 3-day weekends
→ Never check email after 6pm
→ Exercise daily
→ And still build 8-figure companies

The difference? They measure success differently.

Old metrics I've abandoned:
• Hours worked
• Emails sent
• Meetings attended

New metrics I track:
• Problems solved
• Energy levels
• Time with people I love

The uncomfortable truth: Busyness is often a hiding place.

It's easier to fill a calendar than to face the question: "Am I working on what actually matters?"

If you're exhausted but not fulfilled, that's not dedication.

That's a strategy problem.

What metric would you add to the "new" list?

#CareerDevelopment #Leadership #Success #WorkCulture`,
    day: 4,
    time: "7:30 AM",
    tags: ["leadership", "success"]
  },
  // Newsletter
  {
    id: "nl-1",
    type: "newsletter",
    title: "The Anti-Hustle Manifesto",
    content: `SUBJECT: Why I stopped glorifying the grind (and what I do instead)

Hey friend,

I recorded a 27-minute rant this week that I need to share with you.

The topic? Why most productivity advice is complete BS.

Here's the TL;DR:

---

THE MYTH: Success requires sacrifice
THE TRUTH: Sustainable success requires boundaries

We've been sold a story:
- Wake up at 5am ✗
- Hustle until you drop ✗
- Rest is for the weak ✗

I bought this story. Hard. And it nearly broke me.

---

THREE THINGS I NOW KNOW:

1. Your chronotype matters more than your alarm clock

Some people are morning people. Some aren't. Both can be wildly successful. The key is knowing YOUR optimal hours.

2. Your to-do list is a guilt machine

Long lists = anxiety in written form. Try the Rule of 3 instead: three priorities, maximum, per day.

3. Rest is a requirement, not a reward

Your brain needs downtime to process, create, and problem-solve. Schedule rest like you schedule meetings.

---

THIS WEEK'S CHALLENGE:

Pick one "productivity rule" you've been following.

Question it.

Ask: "Is this serving me, or am I serving it?"

Then let me know what you discover.

Hit reply—I read every response.

To doing less, better,
[Your name]

P.S. I'm turning this rant into a full content series. Stay tuned for videos, threads, and more dropping this week.`,
    day: 1,
    time: "6:00 AM",
    tags: ["newsletter", "productivity"]
  }
];

export const contentStats = {
  totalPieces: 11,
  tiktok: 5,
  twitter: 3,
  linkedin: 2,
  newsletter: 1,
  estimatedReach: "50K-150K",
  timeToCreate: "~10 seconds"
};

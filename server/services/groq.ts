import Groq from 'groq-sdk';
import { StructuredTranscript } from '../types';

export interface SpicyMoment {
  timestamp: string;
  quote: string;
  reason?: string;
}

export interface AnalysisResult {
  title: string;
  duration: string;
  topics: string[];
  spicyMoments: SpicyMoment[];
}

export interface TikTokScript {
  id: string;
  type: 'tiktok';
  title: string;
  hook: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

export interface TwitterThread {
  id: string;
  type: 'twitter';
  title: string;
  template: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

export interface LinkedInPost {
  id: string;
  type: 'linkedin';
  title: string;
  content: string;
  shareUrl?: string;
  day: number;
  time: string;
  tags: string[];
}

export interface Newsletter {
  id: string;
  type: 'newsletter';
  title: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

/**
 * Groq AI Service for analyzing transcripts
 */
export class GroqService {
  private client: Groq;

  constructor(apiKey?: string) {
    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY || '',
    });
  }

  /**
   * Analyze a transcript and extract spicy moments, topics, etc.
   */
  async analyzeTranscript(transcript: StructuredTranscript): Promise<AnalysisResult> {
    try {
      const fullText = transcript.transcript.map(chunk => chunk.text).join(' ');
      const duration = transcript.metadata?.duration || 0;

      console.log('[Groq] Analyzing transcript...');

      const prompt = `You are an expert content analyst. Analyze this transcript and extract:

1. A catchy title (10 words max)
2. Main topics/themes (3-5 tags)
3. "Spicy moments" - the most engaging, controversial, or quotable parts with their timestamps

Transcript chunks with timestamps:
${transcript.transcript.map((chunk, i) =>
  `[${this.formatTime(chunk.start)} - ${this.formatTime(chunk.end)}]: ${chunk.text}`
).join('\n\n')}

Respond in valid JSON format:
{
  "title": "Catchy Title Here",
  "topics": ["Topic1", "Topic2", "Topic3"],
  "spicyMoments": [
    {
      "timestamp": "3:24",
      "quote": "The most engaging quote from the transcript",
      "reason": "Why this is spicy/engaging"
    }
  ]
}

IMPORTANT INSTRUCTIONS FOR TIMESTAMPS:
- Use SINGLE timestamps in MM:SS format (e.g., "3:24", "12:15", "0:42")
- DO NOT use ranges (e.g., "0:00-0:29" is WRONG)
- Pick the START time of when the spicy moment begins in the chunk
- Use the chunk's start timestamp as the base reference
- Examples of CORRECT timestamps: "0:30", "1:45", "10:23"
- Examples of WRONG timestamps: "0:00-0:29", "1:30 - 2:00", "3:24-3:52"

Find 3-5 spicy moments that are:
- Controversial or bold statements
- Surprising revelations
- Emotionally charged
- Quotable and shareable
- Challenge conventional wisdom`;

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst who finds the most engaging moments in content. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';
      console.log('[Groq] Analysis complete');

      // Parse the JSON response
      const analysis = this.parseAnalysis(responseContent);

      return {
        ...analysis,
        duration: this.formatTime(duration),
      };
    } catch (error) {
      console.error('[Groq] Error analyzing transcript:', error);
      throw error;
    }
  }

  /**
   * Generate TikTok scripts from transcript and analysis
   */
  async generateTikTokScripts(
    transcript: StructuredTranscript,
    analysis: AnalysisResult
  ): Promise<TikTokScript[]> {
    try {
      console.log('[Groq] Generating TikTok scripts...');

      const fullText = transcript.transcript.map(chunk => chunk.text).join(' ');

      const prompt = `You are a viral TikTok scriptwriter. Based on this transcript and its spicy moments, create EXACTLY 2 TikTok scripts (30-45 seconds each) that will go viral.

CRITICAL: You MUST generate EXACTLY 2 scripts. No more, no less.

TRANSCRIPT:
${fullText}

TITLE: ${analysis.title}
TOPICS: ${analysis.topics.join(', ')}

SPICY MOMENTS:
${analysis.spicyMoments.map(m => `[${m.timestamp}] "${m.quote}"`).join('\n')}

IMPORTANT:
- Make each script about ONE specific spicy moment or topic
- Use conversational, authentic language
- Include specific visual directions in brackets
- Make hooks immediately attention-grabbing (the hook should be the punchy quote that grabs attention)
- Each script should feel different (vary energy, tone, approach)
- Include practical shot notes for filming

Respond in valid JSON format with properly escaped newlines (use \\n for line breaks):
{
  "scripts": [
    {
      "title": "Short punchy title (3-5 words)",
      "hook": "Nobody needs to wake up at 5am to be successful...",
      "content": "HOOK: [Close up face, whisper] \\"Nobody needs to wake up at 5am...\\"\\n\\nBEAT 1: [Pull back] \\"The most successful people I know? They wake up when their body tells them to.\\"\\n\\nBEAT 2: [B-roll of alarm clock] \\"This whole 5am thing was invented by people who profit from your exhaustion.\\"\\n\\nBEAT 3: [Direct to camera] \\"Your optimal time is YOUR optimal time.\\"\\n\\nCTA: \\"What time do you actually wake up? Drop it below 👇\\"\\n\\nSHOT NOTES:\\n- Film in low light for morning vibes\\n- Use trending sound: \\"Morning routine who?\\"\\n- Duration: 30-45 seconds",
      "tags": ["productivity", "morningroutine", "hustle"]
    }
  ]
}

CRITICAL FORMAT RULES:
- The "hook" field is the attention-grabbing opening quote (just the quote, no visual directions)
- The "content" field contains the full script with HOOK, BEAT 1, BEAT 2, BEAT 3, CTA, and SHOT NOTES
- All newlines in "content" must be escaped as \\n
- Visual directions go in [brackets]
- Spoken words go in "quotes"
- The response MUST be valid JSON that can be parsed by JSON.parse()`;

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a viral TikTok scriptwriter who creates engaging, shareable short-form video scripts. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 4000,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';
      console.log('[Groq] TikTok scripts generated');
      console.log('[Groq] Raw response:', responseContent.substring(0, 500)); // Log first 500 chars

      // Parse the JSON response
      const parsed = this.parseTikTokScripts(responseContent);

      return parsed;
    } catch (error) {
      console.error('[Groq] Error generating TikTok scripts:', error);
      throw error;
    }
  }

  /**
   * Parse TikTok scripts response
   */
  private parseTikTokScripts(responseContent: string): TikTokScript[] {
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      let jsonStr = responseContent;

      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to extract JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      // Try parsing first
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        // If parsing fails, try to fix common issues
        console.log('[Groq] Initial parse failed, attempting to fix JSON...');

        // Fix unescaped newlines and control characters within string values
        // This regex finds content fields and escapes actual newlines
        jsonStr = jsonStr.replace(
          /"content"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/gs,
          (match, content) => {
            // Escape unescaped newlines, tabs, and other control characters
            const escaped = content
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            return `"content": "${escaped}"`;
          }
        );

        // Try parsing again
        parsed = JSON.parse(jsonStr);
      }

      const scripts = Array.isArray(parsed.scripts) ? parsed.scripts : [];

      console.log(`[Groq] Parsed ${scripts.length} TikTok scripts successfully`);

      // Distribute across 5 days with varying times
      const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '11:00 AM'];

      return scripts.map((script: any, index: number) => ({
        id: `tt-${index + 1}`,
        type: 'tiktok' as const,
        title: script.title || 'Untitled TikTok',
        hook: script.hook || '',
        content: script.content || '',
        day: (index % 5) + 1,
        time: times[index % times.length],
        tags: Array.isArray(script.tags) ? script.tags : [],
      }));
    } catch (error) {
      console.error('[Groq] Error parsing TikTok scripts:', error);
      console.error('[Groq] Response content:', responseContent.substring(0, 1000));
      return [];
    }
  }

  /**
   * Generate Twitter threads from transcript and analysis
   */
  async generateTwitterThreads(
    transcript: StructuredTranscript,
    analysis: AnalysisResult
  ): Promise<TwitterThread[]> {
    try {
      console.log('[Groq] Generating Twitter threads...');

      const fullText = transcript.transcript.map(chunk => chunk.text).join(' ');

      const prompt = `You are a viral Twitter content strategist. Based on this transcript, create EXACTLY 2 Twitter threads using Tweet Hunter proven templates (Alex Llull's list) that drive engagement.

CRITICAL: You MUST generate EXACTLY 2 threads. No more, no less.

TRANSCRIPT:
${fullText}

TITLE: ${analysis.title}
TOPICS: ${analysis.topics.join(', ')}

SPICY MOMENTS:
${analysis.spicyMoments.map(m => `[${m.timestamp}] "${m.quote}"`).join('\n')}

USE EXACTLY ONE OF THESE TEMPLATES PER THREAD (rotate between them if generating multiple threads):

1. CHALLENGE YOUR AUDIENCE
- Structure: Start with "Challenge:" or a spicy question. Frame it like a mini game (e.g., "Reply with ONE word" / "In one sentence...").
- Keep it niche-specific and opinionated so readers feel compelled to respond.
- Always end with the challenge CTA.

2. LISTS (step-by-step, 4 steps, unnumbered, or tools/resources list)
- Lean on blank space for readability; keep each bullet/tweet short.
- Example structure: "How to [result]:\\n\\n1/ ...\\n\\n2/ ...\\n\\n3/ ...\\n\\nTakeaway..." or "5 tools that saved my launch:\\n\\n• Tool + why..."
- Each list item should include context, not just a name.

3. BEFORE-AFTER SNAPSHOT
- Format: "Before:\\n- State 1\\n- State 2\\n- State 3\\n\\nToday:\\n- How state 1 changed..." then a one-line takeaway.
- Focus on transformational journeys (mindset, revenue, productivity, etc.).

4. OPPOSED THOUGHTS / DON'T DO THIS, DO THAT (also use "You don't need X, you need Y" or "It's not this. It's that.")
- Tweet 1 calls out the common mistake or misconception.
- Tweet 2-4 offer the counter approach with proof or mini story.
- Keep it punchy and polarizing.

5. HIDDEN TRUTHS (Harsh truths + why, OR Life hacks)
- Start with "Harsh truth:" or "Life hack:" to flag the template.
- Reveal something people think but rarely say out loud, or a high-signal shortcut.
- Follow with why it matters + mini example.

6. CURATED CONTENT GEMS
- Curate 4-6 resources (people, tools, docs, movies, frameworks) around the topic.
- Each bullet: "• Resource – why it matters / key takeaway".
- End with "Who else should be on this list?" or similar CTA.

Each thread should:
- Use conversational, punchy language
- Include blank space for readability
- Be 4-7 tweets maximum
- Mention the chosen template in the opening tweet (e.g., "Challenge:", "Harsh truth:", "Life hack:", "Before/After")
- End with engagement (question, challenge, or CTA)
- Keep every tweet 280 characters or less
- Set "template" to one of: "challenge", "list", "before-after", "opposed-thoughts", "hidden-truth", "curation"

Respond in valid JSON format with properly escaped newlines (use \\n for line breaks):
{
  "threads": [
    {
      "title": "Thread topic (5-7 words)",
      "template": "list",
      "content": "🧵 Thread on [topic]:\\n\\n1/ Hook tweet that grabs attention...\\n\\n2/ First key point with context...\\n\\n3/ Second point with example...\\n\\n4/ Final thought + CTA",
      "tags": ["tag1", "tag2"]
    }
  ]
}

CRITICAL: Escape all newlines as \\n. Response must be valid JSON.`;

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a viral Twitter strategist who creates engaging, insightful threads. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2500,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';
      const parsed = this.parseTwitterThreads(responseContent);

      return parsed;
    } catch (error) {
      console.error('[Groq] Error generating Twitter threads:', error);
      return [];
    }
  }

  /**
   * Generate LinkedIn posts from transcript and analysis
   */
  async generateLinkedInPosts(
    transcript: StructuredTranscript,
    analysis: AnalysisResult
  ): Promise<LinkedInPost[]> {
    try {
      console.log('[Groq] Generating LinkedIn posts...');

      const fullText = transcript.transcript.map(chunk => chunk.text).join(' ');

      const prompt = `You are a professional LinkedIn content strategist. Based on this transcript, create EXACTLY 2 LinkedIn posts that will drive professional engagement.

CRITICAL: You MUST generate EXACTLY 2 posts. No more, no less.

TRANSCRIPT:
${fullText}

TITLE: ${analysis.title}
TOPICS: ${analysis.topics.join(', ')}

SPICY MOMENTS:
${analysis.spicyMoments.map(m => `[${m.timestamp}] "${m.quote}"`).join('\n')}

Each LinkedIn post should:
- Open with a compelling personal story or observation
- Share professional insights or lessons learned
- Use short paragraphs for readability
- Include strategic use of emojis (→, •, ✓, ✗)
- End with an engaging question
- Be authentic and vulnerable
- Professional but conversational tone

Respond in valid JSON format with properly escaped newlines (use \\n for line breaks):
{
  "posts": [
    {
      "title": "Post topic (5-7 words)",
      "content": "Opening hook or story...\\n\\nKey insight or lesson learned.\\n\\n3 shifts that changed everything:\\n\\n1. Point one\\nExplanation\\n\\n2. Point two\\nExplanation\\n\\n3. Point three\\nExplanation\\n\\nThe result? Outcome achieved.\\n\\nWhat's one [topic] you've unlearned?\\n\\n#Hashtag1 #Hashtag2 #Hashtag3",
      "tags": ["tag1", "tag2"]
    }
  ]
}

CRITICAL: Escape all newlines as \\n. Response must be valid JSON.`;

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a LinkedIn content strategist who creates authentic, engaging professional posts. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2500,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';
      console.log('[Groq] LinkedIn posts generated');
      console.log('[Groq] Raw LinkedIn response:', responseContent.substring(0, 500));

      const parsed = this.parseLinkedInPosts(responseContent);

      return parsed;
    } catch (error) {
      console.error('[Groq] Error generating LinkedIn posts:', error);
      return [];
    }
  }

  /**
   * Generate Newsletter from transcript and analysis
   */
  async generateNewsletter(
    transcript: StructuredTranscript,
    analysis: AnalysisResult
  ): Promise<Newsletter[]> {
    try {
      console.log('[Groq] Generating newsletter...');

      const fullText = transcript.transcript.map(chunk => chunk.text).join(' ');

      const prompt = `You are an expert newsletter writer. Based on this transcript, create EXACTLY 1 engaging newsletter email.

CRITICAL: You MUST generate EXACTLY 1 newsletter. No more, no less.

TRANSCRIPT:
${fullText}

TITLE: ${analysis.title}
TOPICS: ${analysis.topics.join(', ')}

SPICY MOMENTS:
${analysis.spicyMoments.map(m => `[${m.timestamp}] "${m.quote}"`).join('\n')}

The newsletter should:
- Start with "SUBJECT: [Compelling subject line]"
- Open with "Hey friend," or similar warm greeting
- Include a personal introduction
- Use clear section headers with ---
- Share 2-3 key insights or frameworks
- Include a "THIS WEEK'S CHALLENGE" section
- End with warm sign-off and P.S.
- Conversational, friendly tone

Respond in valid JSON format with properly escaped newlines (use \\n for line breaks):
{
  "newsletters": [
    {
      "title": "Newsletter topic",
      "content": "SUBJECT: Compelling subject line\\n\\nHey friend,\\n\\nPersonal opening paragraph...\\n\\nHere's the TL;DR:\\n\\n---\\n\\nTHE MYTH: Common belief\\nTHE TRUTH: Reality\\n\\nSection content...\\n\\n---\\n\\nTHREE THINGS I NOW KNOW:\\n\\n1. First insight\\n\\nExplanation...\\n\\n2. Second insight\\n\\nExplanation...\\n\\n3. Third insight\\n\\nExplanation...\\n\\n---\\n\\nTHIS WEEK'S CHALLENGE:\\n\\nChallenge description...\\n\\nHit reply—I read every response.\\n\\nTo [theme],\\n[Your name]\\n\\nP.S. Additional thought or teaser",
      "tags": ["newsletter", "topic"]
    }
  ]
}

CRITICAL: Escape all newlines as \\n. Response must be valid JSON.`;

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert newsletter writer who creates warm, engaging, insightful emails. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 4000,
      });

      const responseContent = completion.choices[0]?.message?.content || '{}';
      const parsed = this.parseNewsletters(responseContent);

      return parsed;
    } catch (error) {
      console.error('[Groq] Error generating newsletter:', error);
      return [];
    }
  }

  /**
   * Parse Twitter threads response
   */
  private parseTwitterThreads(responseContent: string): TwitterThread[] {
    try {
      let jsonStr = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        console.log('[Groq] Initial parse failed, fixing JSON...');
        jsonStr = jsonStr.replace(
          /"content"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/gs,
          (match, content) => {
            const escaped = content
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            return `"content": "${escaped}"`;
          }
        );
        parsed = JSON.parse(jsonStr);
      }

      const threads = Array.isArray(parsed.threads) ? parsed.threads : [];
      console.log(`[Groq] Parsed ${threads.length} Twitter threads successfully`);

      const times = ['10:30 AM', '2:00 PM', '9:00 AM'];
      const allowedTemplates = new Set([
        'challenge',
        'list',
        'before-after',
        'opposed-thoughts',
        'hidden-truth',
        'curation',
      ]);

      return threads.map((thread: any, index: number) => ({
        id: `tw-${index + 1}`,
        type: 'twitter' as const,
        title: thread.title || 'Untitled Thread',
        template: (() => {
          const templateValue = typeof thread.template === 'string'
            ? thread.template.toLowerCase()
            : '';
          return allowedTemplates.has(templateValue) ? templateValue : 'unknown';
        })(),
        content: thread.content || '',
        day: (index % 5) + 1,
        time: times[index % times.length],
        tags: Array.isArray(thread.tags) ? thread.tags : [],
      }));
    } catch (error) {
      console.error('[Groq] Error parsing Twitter threads:', error);
      return [];
    }
  }

  /**
   * Parse LinkedIn posts response
   */
  private parseLinkedInPosts(responseContent: string): LinkedInPost[] {
    try {
      let jsonStr = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        console.log('[Groq] Initial LinkedIn parse failed, attempting comprehensive JSON fixes...');

        // Try comprehensive JSON fixing
        try {
          // Fix all string field values (title, content, shareUrl, tags, etc.)
          jsonStr = jsonStr.replace(
            /"(title|content|shareUrl)"\s*:\s*"((?:[^"\\]|\\.)*)"/gs,
            (_match, fieldName, value) => {
              // Escape control characters that aren't already escaped
              let fixed = value
                // Fix newlines
                .replace(/(?<!\\)\n/g, '\\n')
                .replace(/(?<!\\)\r/g, '\\r')
                .replace(/(?<!\\)\t/g, '\\t')
                // Fix other control characters
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

              return `"${fieldName}": "${fixed}"`;
            }
          );

          // Remove trailing commas before closing braces/brackets
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

          // Try parsing again
          parsed = JSON.parse(jsonStr);
          console.log('[Groq] Successfully fixed LinkedIn JSON after comprehensive cleanup');
        } catch (secondError) {
          console.error('[Groq] Second parse attempt failed, trying aggressive fix...');

          // Last resort: try to manually extract posts using regex
          const postsMatch = jsonStr.match(/"posts"\s*:\s*\[([\s\S]*)\]/);
          if (postsMatch) {
            // Try to extract individual post objects
            const postsArrayStr = postsMatch[1];
            const postObjects = postsArrayStr.match(/\{[^}]*"title"[^}]*\}/g) || [];

            console.log(`[Groq] Attempting to extract ${postObjects.length} LinkedIn posts manually`);

            const manuallyParsedPosts = postObjects.map(postStr => {
              try {
                // Clean the individual post object
                let cleanPost = postStr
                  .replace(/(?<!\\)\n/g, '\\n')
                  .replace(/(?<!\\)\r/g, '\\r')
                  .replace(/(?<!\\)\t/g, '\\t')
                  .replace(/,(\s*})/g, '$1');

                return JSON.parse(cleanPost);
              } catch (e) {
                console.error('[Groq] Failed to parse individual post:', e);
                return null;
              }
            }).filter(p => p !== null);

            parsed = { posts: manuallyParsedPosts };
            console.log(`[Groq] Manually extracted ${manuallyParsedPosts.length} LinkedIn posts`);
          } else {
            throw secondError;
          }
        }
      }

      const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
      console.log(`[Groq] Parsed ${posts.length} LinkedIn posts successfully`);

      if (posts.length === 0) {
        console.warn('[Groq] WARNING: No LinkedIn posts were parsed from the response');
        console.warn('[Groq] Raw response sample:', responseContent.substring(0, 1000));
      }

      const times = ['8:00 AM', '7:30 AM'];
      return posts.map((post: any, index: number) => ({
        id: `li-${index + 1}`,
        type: 'linkedin' as const,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        shareUrl: post.shareUrl || '',
        day: (index * 2) + 2, // Day 2 and Day 4
        time: times[index % times.length],
        tags: Array.isArray(post.tags) ? post.tags : [],
      }));
    } catch (error) {
      console.error('[Groq] Error parsing LinkedIn posts:', error);
      console.error('[Groq] Failed response (first 2000 chars):', responseContent.substring(0, 2000));

      // Return empty array but log for debugging
      return [];
    }
  }

  /**
   * Parse Newsletter response
   */
  private parseNewsletters(responseContent: string): Newsletter[] {
    try {
      let jsonStr = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        console.log('[Groq] Initial parse failed, fixing JSON...');
        jsonStr = jsonStr.replace(
          /"content"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/gs,
          (match, content) => {
            const escaped = content
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            return `"content": "${escaped}"`;
          }
        );
        parsed = JSON.parse(jsonStr);
      }

      const newsletters = Array.isArray(parsed.newsletters) ? parsed.newsletters : [];
      console.log(`[Groq] Parsed ${newsletters.length} newsletters successfully`);

      return newsletters.map((newsletter: any, index: number) => ({
        id: `nl-${index + 1}`,
        type: 'newsletter' as const,
        title: newsletter.title || 'Untitled Newsletter',
        content: newsletter.content || '',
        day: 1,
        time: '6:00 AM',
        tags: Array.isArray(newsletter.tags) ? newsletter.tags : ['newsletter'],
      }));
    } catch (error) {
      console.error('[Groq] Error parsing newsletters:', error);
      return [];
    }
  }

  /**
   * Parse the AI response and extract structured data
   */
  private parseAnalysis(responseContent: string): Omit<AnalysisResult, 'duration'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseContent;

      const parsed = JSON.parse(jsonStr);

      return {
        title: parsed.title || 'Untitled',
        duration: '0:00',
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        spicyMoments: Array.isArray(parsed.spicyMoments) ? parsed.spicyMoments : [],
      };
    } catch (error) {
      console.error('[Groq] Error parsing analysis:', error);

      // Return default structure if parsing fails
      return {
        title: 'Untitled',
        duration: '0:00',
        topics: [],
        spicyMoments: [],
      };
    }
  }

  /**
   * Format seconds to MM:SS format
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export interface VideoIdea {
  id: string;
  title: string;
  signal: string;
  score: number;
  demand: string;
  edge: string;
  alignment: string;
  success: string;
  comments: { label: string; author: string; text: string }[];
}
export const ideas: VideoIdea[] = [
  {
    id: 'local-ai',
    title: 'Local AI Explained: How to Run AI Models on Your Computer',
    signal:
      '“I Ran Local AI on a $339 Server,” “Stop Paying for ChatGPT” (60K).',
    score: 3.7,
    demand:
      'Viewers are inspired by local AI but still need a clear path from downloading a model to using it on ordinary hardware.',
    edge: 'A practical, screen-recorded build can turn the inspiration into an outcome. Validate our hardware and experience before production.',
    alignment:
      'Help curious builders become capable, independent AI users through practical demonstrations.',
    success:
      'Show a working result first, disclose hardware requirements, and include exact commands plus a troubleshooting guide.',
    comments: [
      {
        label: 'Audience signal',
        author: 'From the supplied research report · 55 likes',
        text: 'I wanted just this video. I’m finally getting started today with actually implementing this instead of just watching videos and wanting to build it.',
      },
      {
        label: 'Hardware constraint',
        author: 'From the supplied research report · 5 likes',
        text: 'I’m currently pushing my own rig to the limit (64 GB of RAM and an RTX 3050)…',
      },
    ],
  },
  {
    id: 'private-assistant',
    title: 'Build a Private AI Assistant That Actually Knows Your Files',
    signal:
      'The next step after local AI: turn your own documents into useful answers.',
    score: 3.9,
    demand:
      'Candidate hypothesis: builders want useful answers from personal documents without uploading their files.',
    edge: 'Demonstrate ingestion, citations, and failure cases in one reproducible project.',
    alignment:
      'Move our audience from experimenting with models to building tools they use daily.',
    success:
      'Test retrieval on real questions and show when the assistant cannot answer.',
    comments: [],
  },
  {
    id: 'hardware',
    title: 'How Much Computer Do You Really Need for Local AI?',
    signal:
      'RAM, GPUs, model sizes: one honest comparison on everyday hardware.',
    score: 4.1,
    demand:
      'Candidate hypothesis: hardware uncertainty prevents beginners from trying local models.',
    edge: 'Run the same tasks across machines and publish the measurements.',
    alignment:
      'Make independent AI accessible to builders with realistic budgets.',
    success:
      'Compare speed and answer quality, disclose settings, and avoid unsupported buying advice.',
    comments: [],
  },
  {
    id: 'workflow',
    title: 'I Replaced One Paid AI Workflow with a Local Model',
    signal:
      'One workflow. Seven days. A transparent comparison of cost and quality.',
    score: 3.6,
    demand:
      'Candidate hypothesis: subscription-weary users need evidence that local AI can do useful work.',
    edge: 'Document a real workflow with before-and-after examples and honest tradeoffs.',
    alignment:
      'Build trust through practical experiments with measurable outcomes.',
    success:
      'Choose a narrow task, include setup time, and show the cases where paid tools still win.',
    comments: [],
  },
  {
    id: 'mistakes',
    title: '5 Local AI Mistakes That Keep Beginners Stuck',
    signal:
      'From the first download to the first useful answer: remove the friction.',
    score: 3.8,
    demand:
      'Candidate hypothesis: installation issues and confusing defaults make beginners abandon local AI.',
    edge: 'Recreate each failure on screen and demonstrate a verified fix.',
    alignment:
      'Become the dependable guide people return to when they get stuck.',
    success:
      'Keep fixes version-specific and provide a short diagnostic checklist.',
    comments: [],
  },
];

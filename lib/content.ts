/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTENT — every piece of text in the experience lives here.
 *  Replace the placeholder copy (marked with ← EDIT) with real content.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PROFILE = {
  name: 'Suyash Pandey',
  disciplines: 'AI • DATA • SOFTWARE • CREATIVE TECHNOLOGY',
  statement:
    'Building intelligent systems and digital experiences at the intersection of technology and creativity.',
  location: 'Pune, India',
  availability: 'Open to opportunities — 2026',
  email: 'hello@suyashpandey.dev', // ← EDIT
  linkedin: 'https://www.linkedin.com/in/suyash-pandey', // ← EDIT
  github: 'https://github.com/suyashpandey', // ← EDIT
  instagram: 'https://www.instagram.com/suyash.pandey', // ← EDIT
}

/* ── ABOUT — layered reveal plates ─────────────────────────────────────── */

export interface AboutPlate {
  word: string
  kicker: string
  desc: string
}

export const ABOUT_PLATES: AboutPlate[] = [
  {
    word: 'WHO AM I?',
    kicker: 'The human behind the system',
    desc: 'I’m Suyash — an AI & data-science mind with a builder’s hands. I study intelligence, sculpt data, and obsess over the craft of software.',
  },
  {
    word: 'IDENTITY',
    kicker: '01 — Identity',
    desc: 'Engineer by training, creator by instinct. I live between logic and imagination — equally at home in a notebook of data or a shader.',
  },
  {
    word: 'INTERESTS',
    kicker: '02 — Interests',
    desc: 'Artificial intelligence. Data. Software development. Web experiences. Creative technology.',
  },
  {
    word: 'EXPERIENCE',
    kicker: '03 — Experience',
    desc: 'Five internships across AI, data, web and enterprise solutions — learning fast, shipping faster.',
  },
  {
    word: 'TECHNOLOGY',
    kicker: '04 — Technology',
    desc: 'From neural networks and data pipelines to React interfaces and APIs — a full-spectrum, modern stack.',
  },
  {
    word: 'CREATIVE WORK',
    kicker: '05 — Creative work',
    desc: 'Where it all converges: experimental interfaces, motion, 3D — digital experiences like the one you’re inside right now.',
  },
]

/* ── EXPERIENCE — horizontal timeline nodes ────────────────────────────── */

export interface ExperienceItem {
  index: string
  role: string
  company: string // ← EDIT companies
  duration: string // ← EDIT durations
  responsibilities: string[]
  learnings: string[]
  tint: string
}

export const EXPERIENCES: ExperienceItem[] = [
  {
    index: '01',
    role: 'AI INTERN',
    company: 'HELIX INTELLIGENCE',
    duration: '2025',
    responsibilities: [
      'Built and evaluated machine-learning models for text classification',
      'Automated data preprocessing pipelines in Python',
      'Prototyped LLM-powered internal tools for the research team',
    ],
    learnings: [
      'Production ML is 80% data discipline',
      'Fast iteration beats perfect models',
    ],
    tint: '#6d5cff',
  },
  {
    index: '02',
    role: 'DATA ENTRY INTERN',
    company: 'MERIDIAN DATA CO.',
    duration: '2024',
    responsibilities: [
      'Maintained and structured large datasets against strict accuracy targets',
      'Wrote small scripts to automate repetitive entry workflows',
      'Collaborated on recurring data-quality audits',
    ],
    learnings: [
      'Clean data is the foundation of everything',
      'Small automations compound into big wins',
    ],
    tint: '#5c7bff',
  },
  {
    index: '03',
    role: 'AI INTERN',
    company: 'NOVA AI LAB',
    duration: '2024',
    responsibilities: [
      'Researched and benchmarked model architectures',
      'Developed evaluation harnesses and results dashboards',
      'Documented findings for the engineering team',
    ],
    learnings: [
      'Rigorous evaluation drives real progress',
      'Communication is a technical skill',
    ],
    tint: '#8b5cf0',
  },
  {
    index: '04',
    role: 'WEB DEVELOPER INTERN',
    company: 'STUDIO PARALLEL',
    duration: '2024',
    responsibilities: [
      'Shipped responsive UI features in React',
      'Optimized page performance and accessibility',
      'Collaborated with designers on motion and interaction detail',
    ],
    learnings: [
      'Details define the experience',
      'The browser is a creative medium',
    ],
    tint: '#5fb0ff',
  },
  {
    index: '05',
    role: 'SOLUTION DEVELOPER INTERN',
    company: 'FORGELINE SOLUTIONS',
    duration: '2025',
    responsibilities: [
      'Designed end-to-end internal tools for clients',
      'Integrated APIs and automated cross-system workflows',
      'Owned features from specification to deployment',
    ],
    learnings: [
      'A solution is business + technology, never just code',
      'Ownership is the fastest teacher',
    ],
    tint: '#a45cff',
  },
]

/* ── SKILLS — radial constellation ─────────────────────────────────────── */

export interface SkillItem {
  label: string
  blurb: string
}

export const SKILLS: SkillItem[] = [
  { label: 'AI', blurb: 'Designing and applying intelligent systems — from classic ML to modern LLMs.' },
  { label: 'PYTHON', blurb: 'Primary language — data, tooling, models and backends.' },
  { label: 'MACHINE LEARNING', blurb: 'Model building, evaluation and iteration as a daily discipline.' },
  { label: 'DATA SCIENCE', blurb: 'Turning raw, messy data into decisions and narratives.' },
  { label: 'JAVASCRIPT', blurb: 'The language of interaction — from logic to motion.' },
  { label: 'REACT', blurb: 'Component thinking, hooks, state and modern UI architecture.' },
  { label: 'HTML', blurb: 'Semantic structure as the skeleton of experience.' },
  { label: 'CSS', blurb: 'Layout, motion and craft — styling as design.' },
  { label: 'SQL', blurb: 'Querying, joining and shaping relational data.' },
  { label: 'GIT', blurb: 'Version control, branching and collaborative workflows.' },
  { label: 'APIS', blurb: 'Designing and integrating the interfaces between systems.' },
  { label: 'WEB DEV', blurb: 'Bringing it all together into fast, expressive products.' },
]

/* ── PROJECTS — cinematic horizontal gallery + case studies ────────────── */

export interface ProjectDetailContent {
  overview: string
  problem: string
  solution: string
  technology: string
  contribution: string
  result: string
  learnings: string
}

export interface ProjectItem {
  id: string
  index: string
  name: string
  category: string
  tagline: string
  description: string
  tech: string[]
  role: string
  year: string
  detail: ProjectDetailContent
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'cognita',
    index: '01',
    name: 'COGNITA',
    category: 'AI PROJECT',
    tagline: 'A retrieval-augmented knowledge engine that answers questions over private documents — with citations.',
    description:
      'An AI assistant grounded in your own knowledge: semantic search, LLM reasoning and verifiable sources in one interface.',
    tech: ['Python', 'FastAPI', 'LangChain', 'Vector DB', 'React'],
    role: 'Solo Developer',
    year: '2025',
    detail: {
      overview:
        'COGNITA is a retrieval-augmented assistant that lets teams query their internal documentation in natural language and receive cited, verifiable answers.',
      problem:
        'Teams drown in documents. Search returns links instead of answers, and raw LLMs hallucinate confidently when they don’t know.',
      solution:
        'A pipeline that chunks, embeds and indexes documents, then grounds every generated answer in retrieved passages with inline citations.',
      technology:
        'Python and FastAPI services, embedding models behind a vector database, and a React front-end for the conversational experience.',
      contribution:
        'Designed the architecture, built the ingestion pipeline, tuned the retrieval prompts and shipped the entire interface.',
      result:
        'Prototype cut document lookup time from minutes to seconds and became the team’s preferred way to search internal knowledge.',
      learnings:
        'Grounding matters more than model size — retrieval quality defines the ceiling of a RAG system.',
    },
  },
  {
    id: 'pulse',
    index: '02',
    name: 'PULSE',
    category: 'DATA PROJECT',
    tagline: 'Real-time analytics that treats streaming data like a living organism.',
    description:
      'A streaming analytics dashboard: events flow in, charts breathe, anomalies surface themselves — no refresh button required.',
    tech: ['Python', 'WebSockets', 'SQL', 'React', 'D3'],
    role: 'Data & Frontend',
    year: '2025',
    detail: {
      overview:
        'PULSE visualizes streaming data in real time — ingestion, aggregation and rendering designed so the dashboard feels alive.',
      problem:
        'Classic dashboards show a frozen past. The data had rhythm and anomalies, but batch reports flattened it into static tables.',
      solution:
        'A websocket pipeline with rolling aggregation windows on the server and animated, canvas-based charts on the client.',
      technology:
        'Python workers pushing over WebSockets, SQL for warm storage, and a D3-driven React interface with custom transitions.',
      contribution:
        'Built the streaming layer, designed the aggregation windows and hand-crafted the chart motion language.',
      result:
        'Operators spotted anomalies minutes earlier and described the dashboard as “the first one that feels like the system.”',
      learnings:
        'Perceived performance is a design problem — smooth motion is as important as raw throughput.',
    },
  },
  {
    id: 'orbit',
    index: '03',
    name: 'ORBIT',
    category: 'WEB APPLICATION',
    tagline: 'A real-time collaborative workspace with presence you can feel.',
    description:
      'Multiplayer cursors, live sync and a spatial canvas — a web app where collaboration feels physical.',
    tech: ['React', 'TypeScript', 'WebSockets', 'CRDTs', 'Node'],
    role: 'Full-stack Developer',
    year: '2024',
    detail: {
      overview:
        'ORBIT is a collaborative workspace where multiple users edit a shared spatial canvas in real time, with live cursors and presence.',
      problem:
        'Remote collaboration tools feel like taking turns. The team wanted something closer to standing at the same whiteboard.',
      solution:
        'CRDT-backed state for conflict-free sync, websocket presence channels, and interpolated cursor motion so movement reads as human.',
      technology:
        'React with TypeScript, a Node websocket layer, and CRDTs for eventual consistency without locks.',
      contribution:
        'Owned the client architecture, the presence system and the motion design of shared cursors.',
      result:
        'Teams used it for daily standups and planning; the “you can see everyone thinking” effect kept them coming back.',
      learnings:
        'Latency is an interaction-design material — interpolate everything, apologize for nothing.',
    },
  },
  {
    id: 'flux',
    index: '04',
    name: 'FLUX',
    category: 'AUTOMATION SYSTEM',
    tagline: 'A workflow engine that connects APIs, schedules and scripts into self-healing pipelines.',
    description:
      'Automation with a nervous system: pipelines that retry, reroute and report — so busywork quietly disappears.',
    tech: ['Python', 'FastAPI', 'Redis', 'Docker', 'Cron'],
    role: 'Solution Developer',
    year: '2025',
    detail: {
      overview:
        'FLUX orchestrates recurring business workflows — API calls, data transforms and notifications — as observable, self-healing pipelines.',
      problem:
        'Critical processes lived in scattered scripts and one person’s head. When something broke, it broke silently.',
      solution:
        'A declarative workflow engine with dependency-aware steps, exponential-backoff retries, dead-letter queues and a status API.',
      technology:
        'Python and FastAPI, Redis-backed queues, Docker for isolation, and a small scheduling layer.',
      contribution:
        'Designed the workflow DSL, built the retry/routing core and wrote the operational dashboards.',
      result:
        'Dozens of manual hours automated per week; failures now page a human instead of hiding for days.',
      learnings:
        'Reliability is a product feature — observability turned out to matter more than the automations themselves.',
    },
  },
  {
    id: 'mirage',
    index: '05',
    name: 'MIRAGE',
    category: 'EXPERIMENTAL PROJECT',
    tagline: 'A generative WebGL dreamscape that reacts to cursor, time and sound.',
    description:
      'A playground for shaders and interaction: procedural geometry, audio-reactive motion and a strict one-accent palette.',
    tech: ['Three.js', 'GLSL', 'Web Audio', 'React'],
    role: 'Creative Developer',
    year: '2026',
    detail: {
      overview:
        'MIRAGE is a generative art experiment — a real-time 3D scene that breathes with your cursor and the ambient sound around it.',
      problem:
        'I wanted to understand WebGL deeply, not through tutorials — so I built something with no requirements except feel.',
      solution:
        'Custom GLSL shaders, audio-analysis-driven uniforms, and an interaction model where every input leaves a visible trace.',
      technology:
        'Raw Three.js with custom shader materials, the Web Audio API for reactivity, React for the minimal UI shell.',
      contribution:
        'Everything — shaders, motion system, and the sound-reactive parameter space.',
      result:
        'A piece that ran as an installation on a projector for a college tech fest — and the seed of this portfolio’s visual language.',
      learnings:
        'Constraints are fuel: one accent color and one idea forced every visual decision to earn its place.',
    },
  },
]

export const DETAIL_SECTIONS: Array<{ key: keyof ProjectDetailContent; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'technology', label: 'Technology' },
  { key: 'contribution', label: 'My contribution' },
  { key: 'result', label: 'Result' },
  { key: 'learnings', label: 'Learnings' },
]

/* ── CONTACT ───────────────────────────────────────────────────────────── */

export interface ContactLink {
  label: string
  handle: string
  href: string
  external: boolean
}

export const CONTACTS: ContactLink[] = [
  { label: 'EMAIL', handle: PROFILE.email, href: `mailto:${PROFILE.email}`, external: false },
  { label: 'LINKEDIN', handle: '/in/suyash-pandey', href: PROFILE.linkedin, external: true },
  { label: 'GITHUB', handle: '@suyashpandey', href: PROFILE.github, external: true },
  { label: 'INSTAGRAM', handle: '@suyash.pandey', href: PROFILE.instagram, external: true },
]

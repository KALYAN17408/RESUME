import type { KeywordCategory } from '../types/analyzer.types';

export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'wasn', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  // Common job description filler words
  'ability', 'able', 'across', 'actively', 'candidate', 'candidates', 'client', 'clients', 'company',
  'day', 'days', 'environment', 'equivalent', 'experience', 'experienced', 'field', 'hands-on', 'help',
  'including', 'job', 'join', 'level', 'looking', 'must', 'need', 'needs', 'opportunity', 'plus',
  'position', 'preferred', 'qualifications', 'required', 'requirements', 'role', 'seeking', 'skills',
  'strong', 'successful', 'team', 'teams', 'understanding', 'using', 'will', 'work', 'working', 'year', 'years'
]);

export interface TaxonomyEntry {
  term: string;
  category: KeywordCategory;
  aliases?: string[];
}

export const SKILLS_TAXONOMY: TaxonomyEntry[] = [
  // Programming Languages
  { term: 'TypeScript', category: 'technical', aliases: ['ts'] },
  { term: 'JavaScript', category: 'technical', aliases: ['js', 'ecmascript', 'es6'] },
  { term: 'Python', category: 'technical', aliases: ['py'] },
  { term: 'Java', category: 'technical' },
  { term: 'C++', category: 'technical', aliases: ['cpp'] },
  { term: 'C#', category: 'technical', aliases: ['csharp', '.net'] },
  { term: 'Go', category: 'technical', aliases: ['golang'] },
  { term: 'Rust', category: 'technical' },
  { term: 'Ruby', category: 'technical' },
  { term: 'PHP', category: 'technical' },
  { term: 'Swift', category: 'technical' },
  { term: 'Kotlin', category: 'technical' },
  { term: 'SQL', category: 'database' },
  { term: 'HTML', category: 'technical', aliases: ['html5'] },
  { term: 'CSS', category: 'technical', aliases: ['css3'] },
  { term: 'Sass', category: 'technical', aliases: ['scss'] },

  // Frameworks & Web
  { term: 'React', category: 'framework', aliases: ['reactjs', 'react.js'] },
  { term: 'Next.js', category: 'framework', aliases: ['nextjs', 'next'] },
  { term: 'Vue.js', category: 'framework', aliases: ['vue', 'vuejs'] },
  { term: 'Angular', category: 'framework', aliases: ['angularjs'] },
  { term: 'Node.js', category: 'framework', aliases: ['nodejs', 'node'] },
  { term: 'Express.js', category: 'framework', aliases: ['express', 'expressjs'] },
  { term: 'NestJS', category: 'framework', aliases: ['nest'] },
  { term: 'Django', category: 'framework' },
  { term: 'FastAPI', category: 'framework' },
  { term: 'Flask', category: 'framework' },
  { term: 'Spring Boot', category: 'framework', aliases: ['spring'] },
  { term: 'Ruby on Rails', category: 'framework', aliases: ['rails'] },
  { term: 'Tailwind CSS', category: 'framework', aliases: ['tailwind'] },
  { term: 'GraphQL', category: 'framework' },
  { term: 'REST APIs', category: 'framework', aliases: ['rest', 'restful', 'rest api', 'restful api', 'web apis'] },
  { term: 'gRPC', category: 'framework' },
  { term: 'WebSockets', category: 'framework', aliases: ['websocket'] },

  // Databases & Storage
  { term: 'PostgreSQL', category: 'database', aliases: ['postgres'] },
  { term: 'MySQL', category: 'database' },
  { term: 'MongoDB', category: 'database', aliases: ['mongo'] },
  { term: 'Redis', category: 'database' },
  { term: 'Elasticsearch', category: 'database', aliases: ['elastic'] },
  { term: 'Supabase', category: 'database' },
  { term: 'Firebase', category: 'database', aliases: ['firestore'] },
  { term: 'DynamoDB', category: 'database' },
  { term: 'Cassandra', category: 'database' },
  { term: 'SQLite', category: 'database' },
  { term: 'Prisma', category: 'database' },

  // Cloud & DevOps
  { term: 'AWS', category: 'cloud_devops', aliases: ['amazon web services'] },
  { term: 'Azure', category: 'cloud_devops', aliases: ['microsoft azure'] },
  { term: 'Google Cloud', category: 'cloud_devops', aliases: ['gcp', 'google cloud platform'] },
  { term: 'Docker', category: 'cloud_devops' },
  { term: 'Kubernetes', category: 'cloud_devops', aliases: ['k8s'] },
  { term: 'Terraform', category: 'cloud_devops' },
  { term: 'CI/CD', category: 'cloud_devops', aliases: ['continuous integration', 'continuous deployment', 'ci cd'] },
  { term: 'GitHub Actions', category: 'cloud_devops' },
  { term: 'GitLab CI', category: 'cloud_devops' },
  { term: 'Jenkins', category: 'cloud_devops' },
  { term: 'Linux', category: 'cloud_devops' },
  { term: 'Nginx', category: 'cloud_devops' },
  { term: 'Kafka', category: 'cloud_devops', aliases: ['apache kafka'] },
  { term: 'RabbitMQ', category: 'cloud_devops' },

  // Testing & Quality
  { term: 'Jest', category: 'tool' },
  { term: 'Vitest', category: 'tool' },
  { term: 'Cypress', category: 'tool' },
  { term: 'Playwright', category: 'tool' },
  { term: 'JUnit', category: 'tool' },
  { term: 'Pytest', category: 'tool' },
  { term: 'Selenium', category: 'tool' },
  { term: 'TDD', category: 'methodology', aliases: ['test driven development'] },

  // Methodologies & Architecture
  { term: 'Microservices', category: 'methodology', aliases: ['microservice architecture', 'microservice'] },
  { term: 'System Design', category: 'methodology', aliases: ['distributed systems'] },
  { term: 'Agile', category: 'methodology' },
  { term: 'Scrum', category: 'methodology' },
  { term: 'Kanban', category: 'methodology' },
  { term: 'OOP', category: 'methodology', aliases: ['object oriented programming'] },
  { term: 'Design Patterns', category: 'methodology' },
  { term: 'Clean Code', category: 'methodology' },
  { term: 'Event-Driven Architecture', category: 'methodology' },

  // Tools & Version Control
  { term: 'Git', category: 'tool', aliases: ['github', 'gitlab'] },
  { term: 'Jira', category: 'tool' },
  { term: 'Postman', category: 'tool' },
  { term: 'Figma', category: 'tool' },
  { term: 'Webpack', category: 'tool' },
  { term: 'Vite', category: 'tool' },

  // Soft Skills & Leadership
  { term: 'Cross-functional Collaboration', category: 'soft_skill', aliases: ['collaboration', 'collaborative'] },
  { term: 'Problem Solving', category: 'soft_skill', aliases: ['analytical thinking', 'troubleshooting'] },
  { term: 'Communication', category: 'soft_skill', aliases: ['verbal communication', 'written communication'] },
  { term: 'Mentorship', category: 'soft_skill', aliases: ['mentoring', 'coaching'] },
  { term: 'Code Reviews', category: 'soft_skill', aliases: ['peer reviews'] },
  { term: 'Stakeholder Management', category: 'soft_skill' },
];

export const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'advocated', 'allocated',
  'analyzed', 'applied', 'appraised', 'arbitrated', 'architected', 'arranged',
  'assembled', 'assessed', 'attained', 'audited', 'augmented', 'authored',
  'automated', 'balanced', 'benchmarked', 'boosted', 'budgeted', 'built',
  'calculated', 'championed', 'clarified', 'coached', 'collaborated', 'collected',
  'communicated', 'compiled', 'composed', 'computed', 'conceptualized', 'conducted',
  'configured', 'consolidated', 'constructed', 'consulted', 'contracted', 'controlled',
  'converted', 'coordinated', 'counseled', 'crafted', 'created', 'customized',
  'debugged', 'decreased', 'delegated', 'delivered', 'demonstrated', 'deployed',
  'designed', 'detailed', 'detected', 'determined', 'developed', 'devised',
  'diagnosed', 'directed', 'discovered', 'dispatched', 'diversified', 'documented',
  'doubled', 'drafted', 'earned', 'economized', 'edited', 'educated',
  'effected', 'elevated', 'eliminated', 'enabled', 'enacted', 'encouraged',
  'engineered', 'enhanced', 'enlarged', 'enlisted', 'ensured', 'established',
  'estimated', 'evaluated', 'examined', 'executed', 'expanded', 'expedited',
  'experimented', 'explained', 'explored', 'extended', 'extracted', 'fabricated',
  'facilitated', 'finalized', 'focused', 'forecasted', 'formulated', 'fostered',
  'founded', 'fulfilled', 'generated', 'governed', 'guided', 'halved',
  'harmonized', 'harnessed', 'headed', 'heightened', 'identified', 'illustrated',
  'implemented', 'improved', 'improvised', 'inaugurated', 'increased', 'indexed',
  'influenced', 'informed', 'initiated', 'innovated', 'inspected', 'inspired',
  'installed', 'instituted', 'instructed', 'integrated', 'intensified', 'interpreted',
  'interviewed', 'introduced', 'invented', 'investigated', 'isolated', 'issued',
  'launched', 'lead', 'led', 'leveraged', 'licensed', 'located', 'maintained',
  'managed', 'mapped', 'maximized', 'measured', 'mediated', 'mentored',
  'merged', 'minimized', 'mobilized', 'modeled', 'moderated', 'modernized',
  'monitored', 'motivated', 'navigated', 'negotiated', 'nurtured', 'operated',
  'optimized', 'orchestrated', 'organized', 'originated', 'outperformed', 'overhauled',
  'oversaw', 'partnered', 'performed', 'persuaded', 'piloted', 'pioneered',
  'planned', 'polled', 'predicted', 'prepared', 'prescribed', 'presented',
  'preserved', 'presided', 'prevented', 'prioritized', 'processed', 'procured',
  'produced', 'programmed', 'projected', 'promoted', 'proofread', 'proposed',
  'protected', 'prototyped', 'provided', 'published', 'purchased', 'qualified',
  'quantified', 'queried', 'questioned', 'rated', 're-engineered', 'reached',
  'realigned', 'rebuilt', 'recaptured', 'received', 'recognized', 'recommended',
  'reconciled', 'reconstructed', 'recorded', 'recovered', 'recruited', 'rectified',
  'redesigned', 'redirected', 'reduced', 'refined', 'reformed', 'regained',
  'regulated', 'rehabilitated', 'reinforced', 'rejuvenated', 'remodeled', 'rendered',
  'renegotiated', 'reorganized', 'repaired', 'replaced', 'replenished', 'reported',
  'represented', 'repositioned', 'researched', 'resolved', 'restored', 'restructured',
  'retrieved', 'revamped', 'reviewed', 'revised', 'revitalized', 'revolutionized',
  'routed', 'salvaged', 'saved', 'scaled', 'scheduled', 'screened', 'secured',
  'selected', 'separated', 'served', 'serviced', 'shaped', 'shared', 'simplified',
  'simulated', 'solved', 'spearheaded', 'specialized', 'specified', 'standardized',
  'stimulated', 'streamlined', 'strengthened', 'structured', 'studied', 'substituted',
  'succeeded', 'summarized', 'superseded', 'supervised', 'supplemented', 'supplied',
  'supported', 'surpassed', 'surveyed', 'synthesized', 'systematized', 'tabulated',
  'tailored', 'targeted', 'taught', 'terminated', 'tested', 'tightened',
  'tracked', 'trained', 'transcribed', 'transferred', 'transformed', 'transitioned',
  'translated', 'transmitted', 'triaged', 'trimmed', 'tripled', 'troubleshot',
  'unified', 'unraveled', 'updated', 'upgraded', 'utilized', 'validated',
  'valued', 'verified', 'viewed', 'visualized', 'vitalized', 'won', 'yielded'
]);

export const WEAK_VERBS = new Set([
  'helped', 'assisted', 'worked', 'worked on', 'was responsible for', 'responsible for',
  'handled', 'tried', 'participated', 'contributed', 'attempted', 'supported'
]);

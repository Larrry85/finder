/*export const EXPERIENCE_LEVELS = [
  { value: "0-2", label: "0-2 years (Junior)" },
  { value: "3-5", label: "3-5 years (Mid-Level)" },
  { value: "6-8", label: "6-8 years (Senior)" },
  { value: "9+", label: "9+ years (Staff+)" },
] as const;*/

export const COMMON_INTERESTS = [
  "JavaScript",
  "Python",
  "Java",
  "Golang",
  "React",
  "Node.js",
  "TypeScript",
  "Docker",
  "Kubernetes",
  "AWS",
  "Vue.js",
  "Angular",
] as const;

/*export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "DevOps Engineer",
  "AI Developer",
  "Student/Learning",
] as const;*/

/*/export const LOCATION_TYPES = ["remote", "local"];

export const COLLABORATION_TYPES = [
  "Project Collaboration",
  "Mentorship",
  "Study Group",
  "Code Review",
] as const;*/

//export const COLLABORATION_TYPES = ["pair programming", "code review", "project collaboration"];

export const GOLANG_PROJECTS = [
  {
    id: "itinerary",
    name: "itinerary",
    subProjects: [
      {
        id: "itinerary-prettifier",
        name: "itinerary-prettifier",
      },
    ],
  },
  {
    id: "art",
    name: "art",
    subProjects: [
      {
        id: "art-decoder",
        name: "art-decoder",
      },
      {
        id: "art-interface",
        name: "art-interface",
      },
    ],
  },
  {
    id: "cars",
    name: "cars",
    subProjects: [
      {
        id: "cars-viewer",
        name: "cars-viewer",
      },
    ],
  },
  {
    id: "stations",
    name: "stations",
    subProjects: [
      {
        id: "stations-pathfinder",
        name: "stations-pathfinder",
      },
    ],
  },
  {
    id: "literary-lions",
    name: "literary-lions",
    subProjects: [
      {
        id: "literary-lions-forum",
        name: "literary-lions-forum",
      },
    ],
  },
] as const;

export const JAVASCRIPT_PROJECTS = [
  {
    id: "hellojs",
    name: "hello-js",
    subProjects: [
      {
        id: "hello-world",
        name: "hello-world",
      },
      {
        id: "hello-123",
        name: "hello-123",
      },
      {
        id: "escape",
        name: "escape",
      },
      {
        id: "data-types",
        name: "data-types",
      },
      {
        id: "mutable-or-not",
        name: "mutable-or-not",
      },
      {
        id: "little-and-large",
        name: "little-and-large",
      },
      {
        id: "array",
        name: "array",
      },
      {
        id: "object",
        name: "object",
      },
      {
        id: "nested-object",
        name: "nested-object",
      },
      {
        id: "frozen-object",
        name: "frozen-object",
      },
      {
        id: "shallow-and-deep",
        name: "shallow-and-deep",
      },
      {
        id: "maths",
        name: "maths",
      },
      {
        id: "element-getter",
        name: "element-getter",
      },
      {
        id: "person",
        name: "person",
      },
      {
        id: "key",
        name: "key",
      },
      {
        id: "words",
        name: "words",
      },
      {
        id: "loudness",
        name: "loudness",
      },
      {
        id: "math-obj",
        name: "math-obj",
      },
      {
        id: "itself",
        name: "itself",
      },
      {
        id: "slice",
        name: "slice",
      },
    ],
  },
  {
    id: "realjs",
    name: "real-js",
    subProjects: [
      {
        id: "ancient-history",
        name: "ancient-history",
      },
      {
        id: "got-the-time",
        name: "got-the-time",
      },
      {
        id: "array-filter",
        name: "array-filter",
      },
      {
        id: "array-map",
        name: "array-map",
      },
      {
        id: "array-reduce",
        name: "array-reduce",
      },
      {
        id: "diesel",
        name: "diesel",
      },
      {
        id: "authorized-users",
        name: "authorized-users",
      },
      {
        id: "pet-heritage",
        name: "pet-heritage",
      },
      {
        id: "geometry",
        name: "geometry",
      },
    ],
  },
  {
    id: "browserjs",
    name: "browser-js",
    subProjects: [
      {
        id: "get-el",
        name: "get-el",
      },
      {
        id: "chess-board",
        name: "chess-board",
      },
      {
        id: "grow-and-shrink",
        name: "grow-and-shrink",
      },
      {
        id: "toggle-class",
        name: "toggle-class",
      },
      {
        id: "alpha-jail",
        name: "alpha-jail",
      },
      {
        id: "team-links",
        name: "team-links",
      },
    ],
  },
  {
    id: "matchme",
    name: "match-me",
    subProjects: [
      {
        id: "web",
        name: "web",
      },
      {
        id: "graphql",
        name: "graphql",
      },
    ],
  },
  {
    id: "dot-js",
    name: "dot-js",
    subProjects: [
      {
        id: "frontend-framework",
        name: "frontend-framework",
      },
    ],
  },
  {
    id: "web-game",
    name: "web-game",
    subProjects: [
      {
        id: "multi-player",
        name: "multi-player",
      },
      {
        id: "npc",
        name: "npc",
      },
    ],
  },
] as const;

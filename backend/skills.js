// The skills the analyser looks for. Each entry is the label shown to the
// user, plus the words that count as evidence of it in the resume text.
// Matching is case-insensitive and on whole words, so "java" does not
// match "javascript".
export const SKILLS = [
  { label: "JavaScript", terms: ["javascript", "js", "es6"] },
  { label: "TypeScript", terms: ["typescript", "ts"] },
  { label: "React", terms: ["react", "react.js", "reactjs"] },
  { label: "HTML", terms: ["html", "html5"] },
  { label: "CSS", terms: ["css", "css3", "sass", "tailwind"] },
  { label: "Node.js", terms: ["node", "node.js", "nodejs"] },
  { label: "Python", terms: ["python"] },
  { label: "Java", terms: ["java"] },
  { label: "SQL", terms: ["sql", "postgresql", "mysql"] },
  { label: "MongoDB", terms: ["mongodb", "mongo"] },
  { label: "Git", terms: ["git", "github", "gitlab"] },
  { label: "REST APIs", terms: ["rest", "rest api", "restful", "api"] },
  { label: "Docker", terms: ["docker", "containers"] },
  { label: "AWS", terms: ["aws", "amazon web services", "ec2", "s3"] },
  { label: "Testing", terms: ["jest", "testing", "unit test", "cypress", "pytest"] },
  { label: "Data analysis", terms: ["pandas", "numpy", "data analysis", "excel"] },
  { label: "Communication", terms: ["communication", "presentation", "stakeholder"] },
  { label: "Teamwork", terms: ["teamwork", "team player", "collaboration", "collaborated"] },
  { label: "Problem solving", terms: ["problem solving", "problem-solving"] },
  { label: "Project management", terms: ["project management", "agile", "scrum"] },
];

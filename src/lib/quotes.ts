export interface Quote {
  text: string;
  author: string;
  role: string;
}

export const educationalQuotes: Quote[] = [
  {
    text: "Education is the kindling of a flame, not the filling of a vessel.",
    author: "Socrates",
    role: "Classical Philosopher",
  },
  {
    text: "The art of teaching is the art of assisting discovery.",
    author: "Mark Van Doren",
    role: "Poet & Professor",
  },
  {
    text: "Education is not preparation for life; education is life itself.",
    author: "John Dewey",
    role: "Philosopher & Psychologist",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    role: "Musician",
  },
  {
    text: "Teaching is more than imparting knowledge; it is inspiring change.",
    author: "William Arthur Ward",
    role: "Author",
  },
  {
    text: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.",
    author: "Albert Einstein",
    role: "Theoretical Physicist",
  },
  {
    text: "A well-educated mind will always have more questions than answers.",
    author: "Helen Keller",
    role: "Author & Activist",
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    role: "Political Leader",
  },
  {
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
    role: "Greek Philosopher",
  },
  {
    text: "To teach is to learn twice.",
    author: "Joseph Joubert",
    role: "French Moralist",
  },
  {
    text: "Intelligence plus character—that is the goal of true education.",
    author: "Martin Luther King Jr.",
    role: "Civil Rights Leader",
  },
  {
    text: "Teachers can change lives with just the right mix of chalk and challenges.",
    author: "Joyce Meyer",
    role: "Author",
  },
  {
    text: "The task of the modern educator is not to cut down jungles, but to irrigate deserts.",
    author: "C.S. Lewis",
    role: "Writer & Scholar",
  },
  {
    text: "Educating the mind without educating the heart is no education at all.",
    author: "Aristotle",
    role: "Greek Philosopher",
  },
  {
    text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
    author: "Brad Henry",
    role: "Politician",
  },
  {
    text: "What we learn with pleasure we never forget.",
    author: "Alfred Mercier",
    role: "Writer",
  },
  {
    text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.",
    author: "William Arthur Ward",
    role: "Author",
  },
  {
    text: "Change is the end result of all true learning.",
    author: "Leo Buscaglia",
    role: "Author",
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    role: "Civil Rights Leader",
  },
  {
    text: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle",
    role: "Greek Philosopher",
  },
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * educationalQuotes.length);
  return educationalQuotes[randomIndex];
}

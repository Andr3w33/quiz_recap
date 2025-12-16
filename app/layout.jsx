import "./globals.css";

export const metadata = {
  title: "Quiz Recap",
  description: "A web application provides a platform for users to create their own flashcards or quizz with their studying resources",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

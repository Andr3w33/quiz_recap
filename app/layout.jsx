import "./globals.css";

export const metadata = {
  title: "Quiz Recap",
  description: "Simple Quizlet-style flashcards + test mode",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

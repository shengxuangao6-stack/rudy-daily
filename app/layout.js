import "./globals.css";

export const metadata = {
  title: "Rudy Daily",
  description: "A daily English newspaper for your mind."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

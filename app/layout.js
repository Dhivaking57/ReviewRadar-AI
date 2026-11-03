
import "./globals.css";

export const metadata = {
  title: "ReviewRadar | Customer Intelligence",
  description:
    "Turn customer feedback into clear, actionable business insights."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

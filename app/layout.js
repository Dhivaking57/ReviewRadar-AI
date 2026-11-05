
import "./globals.css";

export const metadata = {
  title: {
    default: "RevZeno — Customer Intelligence",
    template: "%s | RevZeno"
  },
  description:
    "Turn customer voices into intelligence. Analyze customer reviews, discover sentiment, identify recurring issues and uncover actionable business insights.",
  applicationName: "RevZeno",
  keywords: [
    "RevZeno",
    "customer intelligence",
    "AI review analysis",
    "sentiment analysis",
    "customer feedback",
    "business insights"
  ],
  authors: [
    {
      name: "RevZeno"
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


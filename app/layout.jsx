import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "ThanaCity - Vehicle Flow & Parking Analytics",
  description: "Real-time vehicle flow and parking analytics dashboard",
};

export const viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

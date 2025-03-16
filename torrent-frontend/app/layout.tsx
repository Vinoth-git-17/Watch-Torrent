import { SpinnerProvider } from "./context/SpinnerProvider";
import "./globals.css";
import { Inter } from 'next/font/google';

// Configure the Inter font
const inter = Inter({
  subsets: ['latin'], // Choose the subsets you need
  weight: ['400', '600', '700'], // Specify the font weights you want to use
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={inter.className}>
      <body
        className={`antialiased`}
      >
        <SpinnerProvider>
        {children}
        </SpinnerProvider>
      </body>
    </html>
  );
}

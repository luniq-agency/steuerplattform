import './globals.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { Cactus_Classical_Serif, Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationProvider';
import PrimeReactLocaleProvider from './components/PrimeReactLocale';

const headings = Inter({
  variable: "--font-headings",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const special = Cactus_Classical_Serif({
  variable: "--font-special",
  subsets: ["latin"],
  weight: ['400'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${body.variable} ${headings.variable} ${special.variable} h-full antialiased`}>
      <body>
        <PrimeReactLocaleProvider>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </PrimeReactLocaleProvider>
      </body>
    </html>
  );
}

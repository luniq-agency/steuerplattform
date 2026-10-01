import './globals.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationProvider';
import PrimeReactLocaleProvider from './components/PrimeReactLocale';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
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

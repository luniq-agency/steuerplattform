import { Button } from 'primereact/button';
import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  referrer: string;
  url: string;
}

const styles = {
  page: {
    backgroundColor: '#f4f7fe',
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#48F5B6',
    borderRadius: 8,
    color: '2b3674',
    fontSize: 18,
    fontWeight: 700,
    padding: '0.5rem 1rem',
    textDecoration: 'none',
  },
  container: {
    backgroundColor: 'white',
    maxWidth: '80%',
    padding: '4rem 2rem',
    width: '100%',
  },
  p: {
    marginBlockEnd: 16,
  },
};

export function TemplateInvite({ firstName, referrer, url }: EmailTemplateProps) {
  return (
    <body style={styles.page}>
      <div style={styles.container}>
        <h1>Deine Einladung zu CONEK</h1>
        <p style={styles.p}>Hallo {firstName}!</p>
        <p style={styles.p}>{referrer} hat dich zu CONEK eingeladen.</p>
        <p style={styles.p}>Klicke auf den folgenden Link, um deinen Account zu erstellen.</p>
        <a href={url} style={styles.button} target="_blank">
          Konto erstellen
        </a>
        <p style={styles.p}>
          Du hast Fragen? Dann antworte einfach auf diese E-Mail – wir stehen dir zur Verfügung.
        </p>
        <p style={styles.p}>Mit freundlichen Grüßen</p>
        <p style={styles.p}>Dein Team von CONEK</p>
      </div>
    </body>
  );
}

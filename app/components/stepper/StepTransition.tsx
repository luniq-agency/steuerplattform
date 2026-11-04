'use client';

import { useRef, type ReactNode } from 'react';
import styles from './Stepper.module.css';

interface Props {
    step: number;
    children: ReactNode;
}

export default function StepTransition({ step, children }: Props) {
    const vorher = useRef(step);
    const richtung = step >= vorher.current ? 'vor' : 'zurueck';
    vorher.current = step;

    return (
        // key sorgt dafür, dass der Inhalt bei jedem Schritt neu einblendet
        <div className={richtung === 'vor' ? styles.enterVor : styles.enterZurueck} key={step}>
            {children}
        </div>
    );
}
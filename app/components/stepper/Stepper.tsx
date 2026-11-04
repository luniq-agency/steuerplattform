import styles from './Stepper.module.css';

interface Props {
    step: number;          // aktueller Schritt, beginnend bei 1
    maxSteps: number;
    labels?: string[];     // optional: Namen der Schritte
}

export default function Stepper({ step, maxSteps, labels }: Props) {
    const aktuell = Math.min(Math.max(step, 1), maxSteps);

    return (
        <div className={styles.stepper}>
            <div
                aria-label={`Schritt ${aktuell} von ${maxSteps}`}
                aria-valuemax={maxSteps}
                aria-valuemin={1}
                aria-valuenow={aktuell}
                className={styles.track}
                role="progressbar"
            >
                {Array.from({ length: maxSteps }, (_, i) => (
                    <div className={styles.segment} key={i}>
                        <div
                            className={styles.fill}
                            style={{
                                transform: `scaleX(${i < aktuell ? 1 : 0})`,
                                // beim Vorwärtsgehen füllt sich das neue Segment nach dem vorherigen
                                transitionDelay: i === aktuell - 1 ? '80ms' : '0ms',
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className={styles.meta}>
                <span className={styles.count}>
                    Schritt {aktuell} von {maxSteps}
                </span>
                {labels?.[aktuell - 1] && (
                    <span className={styles.label} key={aktuell}>
                        {labels[aktuell - 1]}
                    </span>
                )}
            </div>
        </div>
    );
}
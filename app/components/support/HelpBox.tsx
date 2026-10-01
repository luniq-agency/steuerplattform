'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './Support.module.css';
import { HelpCircle, Icon, X } from 'lucide-react';
import Row from '../layout/Row';
import Column from '../layout/Column';
import { Button } from 'primereact/button';
import { ticket_category } from '@/app/constants/support';
import HelpCategory from './HelpCategory';
import { TextAreaLabel } from '../forms/FormElements';
import { TertiaryButton } from '../buttons/Buttons';
import { useAuth } from '@/app/context/AuthContext';
import { ticketCreate } from '@/app/actions/tickets';

export default function HelpBox() {
  const { userProfile } = useAuth();

  const [expanded, setExpanded] = useState(false);

  // INPUTS
  const [issueCategory, setIssueCategory] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  // ACTIONS
  const sendReport = async () => {
    const cat = ticket_category.find((t) => t.value === issueCategory);

    const payload = {
      assignee: cat?.assignee,
      category: issueCategory,
      created_at: new Date(),
      created_by: userProfile?.id,
      description: issueDescription,
      status: 'new',
    };

    console.log('Payload:', payload);

    /*
    await ticketCreate(payload);
    */
  };

  return (
    <div className={styles.helpBoxWrapper}>
      {expanded ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.helpBoxExpanded}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
        >
          <Column gap={0}>
            <Row justifyContent="space-between" padding="1rem">
              <h2 className={styles.helpBoxTitle}>Hilfe & Support</h2>
              <X
                onClick={() => {
                  setIssueCategory('');
                  setExpanded(false);
                }}
                width={24}
              />
            </Row>
          </Column>
          <Column padding="1rem">
            <span>Wie können wir dir helfen?</span>
            {ticket_category.map((t, i) => (
              <HelpCategory
                key={i}
                label={t.label}
                onClick={setIssueCategory}
                selected={t.value === issueCategory}
                value={t.value}
              />
            ))}
            {issueCategory && (
              <Column>
                <TextAreaLabel
                  label="Beschreibung"
                  onChange={setIssueDescription}
                  placeholder="Beschreibe das Problem"
                  value={issueDescription}
                />
                <TertiaryButton
                  disabled={!issueDescription}
                  label="Absenden"
                  onClick={sendReport}
                />
              </Column>
            )}
          </Column>
        </motion.div>
      ) : (
        <div className={styles.helpBox} onClick={() => setExpanded(true)}>
          <HelpCircle color="white" width={32} />
        </div>
      )}
    </div>
  );
}

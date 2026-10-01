'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../Admin.module.css';
import { DataScroller } from 'primereact/datascroller';
import { Email } from '@/app/types/Database';
import DividerBlock from '../../DividerBlock';
import { Button } from 'primereact/button';
import { useAuth } from '@/app/context/AuthContext';
import { OverlayPanel } from 'primereact/overlaypanel';
import EmailBox from './EmailBox';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { TextAreaLabel } from '../../forms/FormElements';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';

interface Props {
  emails: Email[];
}

export default function EmailAdmin({ emails }: Props) {
  const { user, userProfile } = useAuth();

  const op = useRef<OverlayPanel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [selectedMail, setSelectedMail] = useState<Email | null>(null);

  //INPUTS
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  //SUCHFUNKTION
  const [search, setSearch] = useState('');

  //CHAT
  const [message, setMessage] = useState('');

  const label = selectedMail?.from_name[0] || selectedMail?.from[0];

  return (
    <div className="row width-100" style={{ backgroundColor: 'white' }}>
      <TabView className="tabview-vertical" style={{ maxWidth: 560, width: '100%' }}>
        <TabPanel header="Eingang" leftIcon="pi pi-inbox" style={{ width: '100%' }}>
          <div className={styles.adminContainer} style={{ maxWidth: 'none' }}>
            <h3>Posteingang</h3>
            <DividerBlock height={1} />
            <DataScroller
              buffer={0.4}
              emptyMessage="Keine E-Mails gefunden"
              itemTemplate={(item) => (
                <EmailBox
                  email={item}
                  onClick={() => setSelectedMail(item)}
                  selected={item.id === selectedMail?.id}
                />
              )}
              rows={10}
              value={emails}
            />
          </div>
        </TabPanel>
        <TabPanel header="Ausgang" leftIcon="pi pi-send">
          <div className={styles.adminContainer} style={{ maxWidth: 'none' }}>
            <h3>Postausgang</h3>
          </div>
        </TabPanel>
        <TabPanel header="Gelöscht" leftIcon="pi pi-trash">
          <div className={styles.adminContainer} style={{ maxWidth: 'none' }}>
            <h3>Gelöscht</h3>
          </div>
        </TabPanel>
      </TabView>
      <div className="column width-100">
        {selectedMail ? (
          <div className="column">
            <div
              className={styles.chatContainerHeader}
              style={{ display: 'flex', justifyContent: 'space-between', padding: 16 }}
            >
              <Button
                className="button-square"
                icon="pi pi-arrow-left"
                onClick={() => setSelectedMail(null)}
                text
              />
              <Button className="button-square" icon="pi pi-reply" text />
            </div>
            <div className="column" style={{ padding: 16 }}>
              <div className="row gap-s align-center">
                <Avatar label={label} shape="circle" size="large" />
                <div className="column">
                  <span>
                    <strong>{selectedMail.from_name || selectedMail.from}</strong>
                  </span>
                  <span className="text-s">{selectedMail.from}</span>
                </div>
              </div>
              <DividerBlock height={2} />
              <h3>{selectedMail.subject}</h3>
              <DividerBlock height={2} />
              <div
                dangerouslySetInnerHTML={{ __html: selectedMail.body }}
                style={{ flexGrow: 1 }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              gap: 4,
              justifyContent: 'center',
            }}
          >
            <h3>Keine E-Mail ausgewählt</h3>
            <span style={{ color: 'var(--text-secondary)' }}>Wähle eine E-Mails aus.</span>
          </div>
        )}
      </div>
    </div>
  );
}

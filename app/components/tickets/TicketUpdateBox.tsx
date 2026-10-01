'use client';

import { Document, TicketEntry, User } from '@/app/types/Database';
import styles from './Tickets.module.css';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '@/app/context/AuthContext';
import { formatDate, formatDateWithTime } from '@/app/utils/formats';
import DividerBlock from '../DividerBlock';
import { useState } from 'react';
import { documentLoad } from '@/app/actions/documents';
import Column from '../layout/Column';
import { Dialog } from 'primereact/dialog';
import DocumentPreviewer from '../documents/DocumentPreviewer';
import { File } from 'lucide-react';

interface Props {
  creator: string;
  docs: Document[];
  entry: TicketEntry;
  users: User[];
}

export default function TicketUpdateBox({ creator, docs, entry, users }: Props) {
  const { userProfile } = useAuth();
  const userIsSender = creator === userProfile?.id;
  const user = users.find((u) => u.id === entry.created_by);

  const hasMedia = entry.media;
  const doc = hasMedia && docs.find((d) => d.id == entry.media);
  const initial = user?.user_name_first.substring(1, 0);

  // STATE
  const [visible, setVisible] = useState(false);

  // TEMPLATES
  const contentTemplate = () => {
    return (
      <Column gap={0}>
        <span className={styles.titleSmall}>
          {user?.user_name_first} {user?.user_name_last}
        </span>
        <span className={styles.textMeta}>{formatDateWithTime(entry.created_at)}</span>
        <DividerBlock height={1} />
        {entry.content}
      </Column>
    );
  };

  const mediaTemplate = () => {
    if (!hasMedia || !doc) return;
    return (
      <div className={styles.docItem} onClick={() => setVisible(true)}>
        <File size={16} />
        <span className={styles.docTitle}>{doc.document_name}</span>
      </div>
    );
  };

  return (
    <div className="row gap-s">
      <Dialog header={doc && doc?.document_name || ''} onHide={() => setVisible(false)} style={{maxWidth:800, minHeight:"70vh"}} visible={visible}>
        {doc && <DocumentPreviewer doc={doc} />}
      </Dialog>
      <Avatar
        image={user?.avatar || ''}
        label={initial}
        shape="circle"
        style={{ flexShrink: 0, marginTop: 8 }}
      />
      <div
        className={styles.chatBubble}
        style={userIsSender ? { backgroundColor: '#efeefd' } : undefined}
      >
        {hasMedia && doc ? mediaTemplate() : contentTemplate()}
      </div>
    </div>
  );
}

'use client';

import { adminInvite } from '@/app/actions/admin';
import { agencyCreate } from '@/app/actions/agency';
import { sendAdminInviteEmail } from '@/app/actions/email';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

export default function AdminCreateAdmin() {
  const [visible, setVisible] = useState(false);

  const router = useRouter();

  // INPUTS
  const [adminEmail, setAdminEmail] = useState('');
  const [adminNachname, setAdminNachname] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminVorname, setAdminVorname] = useState('');

  const sendInvite = async () => {
    const payload = {
      created_at: new Date(),
      email: adminEmail,
      user_name_first: adminVorname,
      user_name_last: adminNachname,
      user_role: 'admin',
    };

    try {
      const res = await adminInvite(payload);
      await sendAdminInviteEmail(adminVorname, adminEmail, res.id);
      setVisible(false);
    } catch (err) {
      console.error(err);
    }
    setAdminVorname('');
    setAdminEmail('');
    setAdminNachname('');
    router.refresh();
  };

  return (
    <>
      <Dialog
        closable={true}
        draggable={false}
        header="Admin einladen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 640, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <div className="column gap-xs">
            <label>Vorname</label>
            <InputText onChange={(e) => setAdminVorname(e.target.value)} value={adminVorname} />
          </div>
          <div className="column gap-xs">
            <label>Nachname</label>
            <InputText onChange={(e) => setAdminNachname(e.target.value)} value={adminNachname} />
          </div>
          <div className="column gap-xs">
            <label>E-Mail-Adresse</label>
            <InputText
              onChange={(e) => setAdminEmail(e.target.value)}
              type="email"
              value={adminEmail}
            />
          </div>
          <Button
            className="button-primary"
            disabled={!adminVorname || !adminNachname || !adminEmail}
            label="Einladung versenden"
            onClick={sendInvite}
            style={{ width: 'fit-content' }}
          />
        </div>
      </Dialog>
      <Button
        className="button-primary"
        icon="pi pi-plus"
        label="Admin einladen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}

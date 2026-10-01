'use client';

import { Button } from 'primereact/button';
import { Client } from '@/app/types/Database';
import { clientInvite } from '@/app/actions/clients';
import { Dialog } from 'primereact/dialog';
import { family_options, job_categories } from '@/app/constants/Constants';
import { NumberInputLabel, SelectLabel, TextInputLabel } from '../../forms/FormElements';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { emailTemplateCreate } from '@/app/actions/emailtemplates';

export default function AdminTemplateCreate() {
  const { userProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const router = useRouter();

  //FORM
  const [templateName, setTemplateName] = useState('');

  //VORLAGE ERSTELLEN
  const createTemplate = async () => {
    setSubmitting(true);
    const payload = {
      title: templateName,
    };

    try {
      await emailTemplateCreate(payload);
      setTemplateName('');
    } catch (err) {
      console.error(err);
    }
    setVisible(false);
    router.refresh();
  };

  return (
    <>
      <Dialog
        closable={true}
        draggable={false}
        header="Vorlage erstellen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <TextInputLabel
            label="Name der Vorlage"
            onChange={setTemplateName}
            value={templateName}
          />
          <Button
            disabled={!templateName || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Vorlage erstellen"
            onClick={createTemplate}
          />
        </div>
      </Dialog>
      <Button
        className="button-primary"
        icon="pi pi-plus"
        label="Neue Vorlage"
        onClick={() => setVisible(true)}
      />
    </>
  );
}

'use client';

import { Editor } from 'primereact/editor';
import { EmailTemplate } from '@/app/types/Database';
import { useEffect, useState } from 'react';
import { TextAreaLabel, TextInputLabel } from '../../forms/FormElements';
import DividerBlock from '../../DividerBlock';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { emailTemplateUpdate } from '@/app/actions/emailtemplates';

interface Props {
  template: EmailTemplate;
}

export default function EmailTemplateEditor({ template }: Props) {
  const [templateBody, setTemplateBody] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');

  useEffect(() => {
    if (template) {
      setTemplateBody(template.body);
      setTemplateName(template.title);
      setTemplateSubject(template.subject);
    }
  }, [template]);

  //ACTIONS
  const saveTemplate = async () => {
    const payload = {
      body: templateBody,
      name: templateName,
      subject: templateSubject,
      title: templateName,
    };

    try {
      await emailTemplateUpdate(payload, template.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="column">
      <div className="row space-between align-center">
        <h1>{template.title}</h1>
        <Button label="Vorlage speichern" onClick={saveTemplate} />
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <div className="column gap-s">
          <TextInputLabel
            label="Name der Vorlage"
            onChange={setTemplateName}
            value={templateName}
          />
          <Divider />
          <div className="column">
            <TextInputLabel
              label="Betreffzeile"
              onChange={setTemplateSubject}
              value={templateSubject}
            />
            <DividerBlock height={1} />
            <label>E-Mail Body</label>
            <Editor
              onTextChange={(e) => setTemplateBody(e.htmlValue || '')}
              value={templateBody ?? ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

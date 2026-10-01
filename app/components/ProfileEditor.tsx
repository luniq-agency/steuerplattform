'use client';

import { useEffect, useState } from 'react';
import { InputSwitchLabel, PasswordInput, TextInputLabel } from './forms/FormElements';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { Button } from 'primereact/button';
import { TabPanel, TabView } from 'primereact/tabview';
import DividerBlock from './DividerBlock';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { useRouter } from 'next/navigation';
import { imageUpload } from '../actions/image';
import Image from 'next/image';
import { userUpdate } from '../actions/users';

export default function ProfileEditor() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const user = userProfile;

  //STATES
  const [changingEmail, setChangingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  //INPUTS
  const [avatarFile, setAvatarFile] = useState<{ file: File } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [nachname, setNachname] = useState('');
  const [passwort, setPassword] = useState('');
  const [notificationsApp, setNotificationsApp] = useState(false);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [vorname, setVorname] = useState('');

  //UPLOADS
  const handleUpload = (e: FileUploadHandlerEvent) => {
    const file = e.files[0];
    setAvatarFile({ file });
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    setSubmitting(true);
    if (!avatarFile || !userProfile) return;

    try {
      const res = await imageUpload(avatarFile.file, userProfile.user_uuid);
      const payload = {
        avatar: res,
      };
      console.log(res);
      await userUpdate(payload, userProfile.id);
      setAvatarFile(null);
      router.refresh();
    } catch (err) {
      console.error('Upload Fehler:', err);
    } finally {
      setSubmitting(false);
      setVisible(false);
    }
  };

  // ACTIONS
  const updateNotificationSettings = async () => {
    if (!user) return;
    const payload = {
      permission_notifications_push: notificationsApp,
      permission_notifications_email: notificationsEmail,
    };
    try {
      await userUpdate(payload, user.id);
    } catch (err) {}
  };

  useEffect(() => {
    if (!user) return;

    setEmail(user.email);
    setNachname(user.user_name_last);
    setNotificationsApp(user.permission_notifications_push);
    setNotificationsEmail(user.permission_notifications_email);
    setVorname(user.user_name_first);
  }, [user]);

  const notificationsChanged =
    notificationsApp != user?.permission_notifications_push ||
    notificationsEmail != user.permission_notifications_email;

  if (user)
    return (
      <div className="column height-100">
        <Dialog
          header="E-Mail-Adresse ändern"
          onHide={() => setChangingEmail(false)}
          style={{ maxWidth: 400, width: '100%' }}
          visible={changingEmail}
        >
          <span>
            Um deine E-Mail-Adresse ändern zu können. Musst du zunächst deine alte E-Mail-Adresse
            bestätigen.
          </span>
          <DividerBlock height={1} />
          <span>
            Wir senden eine E-Mail an:
            <br /> <strong>{user.email}</strong>
          </span>
          <DividerBlock height={1} />
          <div className="row gap-s align-end width-100">
            <Button
              className="button-secondary"
              label="Abbrechen"
              onClick={() => setChangingEmail(false)}
            />
            <Button label="Adresse bestätigen" />
          </div>
        </Dialog>
        <Dialog
          header="Profilbild hochladen"
          onHide={() => setVisible(false)}
          style={{ maxWidth: 400, width: '100%' }}
          visible={visible}
        >
          <div className="column gap-m">
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
              {avatarPreview ? (
                <div className="upload-wrapper">
                  <Image
                    alt=""
                    height={200}
                    src={avatarPreview}
                    style={{ borderRadius: 200 }}
                    width={200}
                  />
                  <Button
                    className="upload-delete-button"
                    icon="pi pi-trash"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    text
                  />
                </div>
              ) : (
                <FileUpload
                  className="upload-circular"
                  mode="basic"
                  accept="image/*"
                  auto
                  removeIcon=""
                  customUpload
                  uploadHandler={handleUpload}
                  chooseLabel="Bild auswählen"
                />
              )}
            </div>
            <DividerBlock height={1} />
            <Button
              disabled={!avatarFile}
              icon={submitting ? 'pi pi-spinner pi-spin' : undefined}
              label="Profilbild speichern"
              onClick={uploadImage}
            />
          </div>
        </Dialog>
        <div style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h1>Mein Profil</h1>
          <DividerBlock height={1} />
          <div className="row gap-m align-center">
            <UserAvatar fontSize={24} height={64} width={64} />
            <Button label="Bild hochladen" onClick={() => setVisible(true)} size="small" />
            {user.avatar !== null && <Button label="Bild entfernen" size="small" />}
          </div>
        </div>
        <TabView className="tabview-vertical" style={{height:"100%"}}>
          <TabPanel
            contentClassName="tabview-vertical-content"
            header="Login & Passwort"
            leftIcon="pi pi-lock"
          >
            <h3>Login & Passwort</h3>
            <DividerBlock height={1} />
            <div className="column gap-m">
              <TextInputLabel
                label="Vorname"
                maxWidth={300}
                onChange={setVorname}
                value={vorname}
              />
              <TextInputLabel
                label="Nachname"
                maxWidth={300}
                onChange={setNachname}
                value={nachname}
              />
              <div className="row gap-s align-end">
                <TextInputLabel label="E-Mail-Adresse" maxWidth={300} value={email} />
                <Button
                  className="button-secondary"
                  label="E-Mail-Adresse ändern"
                  onClick={() => setChangingEmail(true)}
                  size="small"
                />
              </div>
              <PasswordInput label="Passwort" maxWidth={300} />
            </div>
          </TabPanel>
          <TabPanel
            contentClassName="tabview-vertical-content"
            header="Benachrichtigungen"
            leftIcon="pi pi-bell"
          >
            <h3>Benachrichtigungen</h3>
            <DividerBlock height={1} />
            <div className="column gap-m">
              <InputSwitchLabel
                additional="Erhalte Benachrichtigungen in der CONEK App."
                booleanValue={notificationsApp}
                label="In-App Benachrichtigungen"
                onBooleanChange={setNotificationsApp}
              />
              <InputSwitchLabel
                additional="Erhalte Benachrichtigungen als E-Mail."
                booleanValue={notificationsEmail}
                label="E-Mail Benachrichtigungen"
                onBooleanChange={setNotificationsEmail}
              />
            </div>
            <DividerBlock height={1} />
            {notificationsChanged && (
              <Button label="Änderungen speichern" onClick={updateNotificationSettings} />
            )}
          </TabPanel>
        </TabView>
      </div>
    );
}

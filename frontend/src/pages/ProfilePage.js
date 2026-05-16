import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', oldPassword: '', newPassword: '', confirmPassword: '', photo: null });
  const [photoPreview, setPhotoPreview] = useState(null);

  const resolvedPhoto = currentUser?.photo
    ? (currentUser.photo.startsWith('http://') || currentUser.photo.startsWith('https://') || currentUser.photo.startsWith('data:')
        ? currentUser.photo
        : currentUser.photo.startsWith('/static/')
          ? `http://127.0.0.1:8000${currentUser.photo}`
          : `http://127.0.0.1:8000/${currentUser.photo.replace(/^\//, '')}`)
    : '/logo192.png';

  useEffect(() => {
    if (currentUser) {
      setForm({ name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '', oldPassword: '', newPassword: '', confirmPassword: '', photo: currentUser.photo ?? null });
      setPhotoPreview(resolvedPhoto);
    }
  }, [currentUser]);

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setForm((s) => ({ ...s, photo: reader.result }));
    };
    reader.readAsDataURL(f);
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!currentUser) return;
    // validate password change: if user wants to change password, require oldPassword and confirm
    if (form.newPassword) {
      if (!form.oldPassword) {
        alert('Для изменения пароля введите текущий (старый) пароль.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        alert('Новый пароль и подтверждение не совпадают.');
        return;
      }
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      // send new password as `password` and include `old_password` for server-side verification
      ...(form.newPassword ? { password: form.newPassword, old_password: form.oldPassword } : {}),
      photo: form.photo || undefined,
    };
    updateProfile(currentUser.id, payload);
    setEditMode(false);
  };

  return (
    <section className="page-shell">
      <article className={`panel full-width-panel ${editMode ? 'editing' : ''}`} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={photoPreview ?? resolvedPhoto} alt="Фото" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/logo192.png'; }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="eyebrow">Личный кабинет</p>
              <h2>{currentUser?.name ?? 'Гость'}</h2>
            </div>
            <div>
              <button className="secondary-button" onClick={() => setEditMode((v) => !v)}>{editMode ? 'Отмена' : 'Редактировать'}</button>
            </div>
          </div>

          {!editMode && (
            <>
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#64748b' }}>Роль</div>
                <strong>{currentUser?.position ?? currentUser?.role ?? '-'}</strong>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#64748b' }}>Email</div>
                <strong>{currentUser?.email ?? '-'}</strong>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#64748b' }}>Телефон</div>
                <strong>{currentUser?.phone ?? '-'}</strong>
              </div>
            </>
          )}

          {/* edit form is rendered in modal to avoid layout shifts */}
        </div>
      </article>
      {editMode && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Редактирование личных данных</h2>
            <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <label>
                Имя
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </label>
              <label>
                Email
                <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </label>
              <label>
                Текущий пароль (требуется для смены пароля)
                <input type="password" value={form.oldPassword} onChange={(e) => setForm((s) => ({ ...s, oldPassword: e.target.value }))} />
              </label>
              <label>
                Новый пароль
                <input type="password" value={form.newPassword} onChange={(e) => setForm((s) => ({ ...s, newPassword: e.target.value }))} />
              </label>
              <label>
                Подтвердите новый пароль
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} />
              </label>
              <label>
                Телефон
                <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
              </label>
              <label>
                Фото
                <input type="file" accept="image/*" onChange={onFileChange} />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="primary-button" type="submit">Сохранить</button>
                <button className="secondary-button" type="button" onClick={() => setEditMode(false)}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfilePage;

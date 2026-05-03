import React from 'react';

const ProfilePage = ({ currentUser }) => {
  return (
    <section className="page-shell">
      <article className="panel full-width-panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={currentUser?.photo ?? '/logo192.png'} alt="Фото" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h2>{currentUser?.name ?? 'Гость'}</h2>
          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#64748b' }}>Роль</div>
            <strong>{currentUser?.position ?? currentUser?.role ?? '—'}</strong>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#64748b' }}>Email</div>
            <strong>{currentUser?.email ?? '—'}</strong>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#64748b' }}>Телефон</div>
            <strong>{currentUser?.phone ?? '—'}</strong>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ProfilePage;


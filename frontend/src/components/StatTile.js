import React from 'react';

const StatTile = ({ label, value, hint, tone = 'default' }) => (
  <article className={`stat-tile tone-${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

export default StatTile;


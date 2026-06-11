import React from 'react'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  initials?: string
  size?: AvatarSize
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const sizes: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 52, xl: 64 }

const statusColors: Record<string, string> = {
  online:  '#22c55e',
  offline: 'rgba(150,150,150,0.50)',
  away:    '#f59e0b',
  busy:    '#ef4444',
}

export const Avatar: React.FC<AvatarProps> = ({ src, initials, size = 'md', status }) => {
  const px = sizes[size]

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div style={{
        width: px, height: px, borderRadius: '50%',
        background: src ? 'transparent' : 'linear-gradient(135deg, #1a7aff 0%, #004bbf 100%)',
        border: '1.5px solid var(--c-avatar-border)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: px * 0.36, fontWeight: 600, color: '#ffffff',
        boxShadow: 'var(--c-shadow-sm)',
        transition: 'border 350ms ease',
      }}>
        {src
          ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (initials ?? '?')
        }
      </div>
      {status && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: px * 0.28, height: px * 0.28, borderRadius: '50%',
          background: statusColors[status],
          border: '1.5px solid var(--c-avatar-status-bg)',
          boxShadow: status === 'online' ? `0 0 7px ${statusColors.online}` : 'none',
          transition: 'border-color 350ms ease',
        }} />
      )}
    </div>
  )
}

/* ─── Avatar Group ──────────────────────────────────────────────────────── */
interface AvatarGroupProps {
  avatars: { src?: string; initials?: string }[]
  size?: AvatarSize
  max?: number
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, size = 'md', max = 4 }) => {
  const visible = avatars.slice(0, max)
  const extra   = avatars.length - max
  const px      = sizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((a, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -(px * 0.3), zIndex: visible.length - i }}>
          <Avatar {...a} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -(px * 0.3), zIndex: 0,
          width: px, height: px, borderRadius: '50%',
          background: 'var(--c-avatar-extra-bg)',
          border: '1.5px solid var(--c-avatar-extra-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: px * 0.3, fontWeight: 600,
          color: 'var(--c-avatar-extra-text)',
          transition: 'background 350ms ease, border 350ms ease, color 350ms ease',
        }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

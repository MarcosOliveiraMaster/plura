import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label, helperText, error, leadingIcon, trailingIcon, style, ...rest
}) => {
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? 'var(--c-input-error-border)'
    : focused
    ? 'var(--c-input-focus-border)'
    : 'var(--c-input-border)'

  const boxShadow = error
    ? '0 0 0 3px var(--c-input-error-ring, rgba(239,68,68,0.15))'
    : focused
    ? '0 0 0 3px var(--c-input-focus-ring), 0 4px 16px rgba(0,0,0,0.14)'
    : 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label style={{
          fontSize: '0.875rem', fontWeight: 500,
          color: error ? 'var(--c-input-error-label)' : 'var(--c-input-label)',
          letterSpacing: '0.01em',
          transition: 'color 350ms ease',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leadingIcon && (
          <span style={{
            position: 'absolute', left: '0.875rem',
            color: focused ? 'var(--c-input-icon-focus)' : 'var(--c-input-icon)',
            display: 'flex', transition: 'color 200ms ease',
          }}>
            {leadingIcon}
          </span>
        )}

        <input
          {...rest}
          onFocus={e => { setFocused(true);  rest.onFocus?.(e) }}
          onBlur={e  => { setFocused(false); rest.onBlur?.(e) }}
          style={{
            width: '100%',
            padding: `0.625rem ${trailingIcon ? '2.75rem' : '1rem'} 0.625rem ${leadingIcon ? '2.75rem' : '1rem'}`,
            background:     'var(--c-input-bg)',
            backdropFilter: 'blur(12px)',
            border:         `1px solid ${borderColor}`,
            borderRadius:   '0.75rem',
            color:          'var(--c-input-text)',
            fontSize:       '0.9375rem',
            fontFamily:     'inherit',
            outline:        'none',
            transition:     'border-color 200ms ease, box-shadow 200ms ease, background 350ms ease, color 350ms ease',
            boxShadow,
            caretColor:     '#3d94ff',
            ...style,
          }}
        />

        {trailingIcon && (
          <span style={{
            position: 'absolute', right: '0.875rem',
            color: focused ? 'var(--c-input-icon-focus)' : 'var(--c-input-icon)',
            display: 'flex', transition: 'color 200ms ease',
          }}>
            {trailingIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <span style={{
          fontSize: '0.8125rem',
          color: error ? 'var(--c-input-error-text)' : 'var(--c-input-helper)',
          transition: 'color 350ms ease',
        }}>
          {error ?? helperText}
        </span>
      )}
    </div>
  )
}

/* ─── Textarea ──────────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({ label, helperText, error, style, ...rest }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label style={{
          fontSize: '0.875rem', fontWeight: 500,
          color: 'var(--c-input-label)',
          transition: 'color 350ms ease',
        }}>
          {label}
        </label>
      )}
      <textarea
        {...rest}
        onFocus={e => { setFocused(true);  rest.onFocus?.(e) }}
        onBlur={e  => { setFocused(false); rest.onBlur?.(e) }}
        style={{
          width: '100%',
          padding:        '0.75rem 1rem',
          background:     'var(--c-input-bg)',
          backdropFilter: 'blur(12px)',
          border:         `1px solid ${focused ? 'var(--c-input-focus-border)' : 'var(--c-input-border)'}`,
          borderRadius:   '0.75rem',
          color:          'var(--c-input-text)',
          fontSize:       '0.9375rem',
          fontFamily:     'inherit',
          outline:        'none',
          resize:         'vertical',
          minHeight:      '7rem',
          transition:     'border-color 200ms ease, box-shadow 200ms ease, background 350ms ease, color 350ms ease',
          boxShadow:      focused ? '0 0 0 3px var(--c-input-focus-ring)' : 'none',
          caretColor:     '#3d94ff',
          ...style,
        }}
      />
      {(error || helperText) && (
        <span style={{
          fontSize: '0.8125rem',
          color: error ? 'var(--c-input-error-text)' : 'var(--c-input-helper)',
        }}>
          {error ?? helperText}
        </span>
      )}
    </div>
  )
}

/* ─── Select ────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Select: React.FC<SelectProps> = ({ label, helperText, error, children, style, ...rest }) => {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label style={{
          fontSize: '0.875rem', fontWeight: 500,
          color: 'var(--c-input-label)',
          transition: 'color 350ms ease',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          {...rest}
          onFocus={e => { setFocused(true);  rest.onFocus?.(e) }}
          onBlur={e  => { setFocused(false); rest.onBlur?.(e) }}
          style={{
            width: '100%',
            padding:        '0.625rem 2.5rem 0.625rem 1rem',
            background:     'var(--c-input-bg)',
            backdropFilter: 'blur(12px)',
            border:         `1px solid ${focused ? 'var(--c-input-focus-border)' : 'var(--c-input-border)'}`,
            borderRadius:   '0.75rem',
            color:          'var(--c-input-text)',
            fontSize:       '0.9375rem',
            fontFamily:     'inherit',
            outline:        'none',
            appearance:     'none',
            cursor:         'pointer',
            transition:     'border-color 200ms ease, box-shadow 200ms ease, background 350ms ease, color 350ms ease',
            boxShadow:      focused ? '0 0 0 3px var(--c-input-focus-ring)' : 'none',
            ...style,
          }}
        >
          {children}
        </select>
        <svg
          style={{
            position: 'absolute', right: '1rem', top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: 'var(--c-select-arrow)',
          }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {(error || helperText) && (
        <span style={{
          fontSize: '0.8125rem',
          color: error ? 'var(--c-input-error-text)' : 'var(--c-input-helper)',
        }}>
          {error ?? helperText}
        </span>
      )}
    </div>
  )
}

/* ─── Checkbox ──────────────────────────────────────────────────────────── */
interface CheckboxProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, onChange, disabled }) => (
  <label style={{
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
  }}>
    <span style={{
      width: '1.125rem', height: '1.125rem', borderRadius: '0.25rem', flexShrink: 0,
      background: checked ? 'linear-gradient(135deg, #1a7aff, #0062e6)' : 'var(--c-checkbox-bg)',
      border: checked ? '1px solid rgba(26,122,255,0.80)' : '1px solid var(--c-checkbox-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 200ms ease',
      boxShadow: checked ? '0 0 10px rgba(26,122,255,0.32)' : 'none',
    }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </span>
    <span style={{
      fontSize: '0.9375rem',
      color: 'var(--c-checkbox-text)',
      transition: 'color 350ms ease',
    }}>
      {label}
    </span>
    <input
      type="checkbox" checked={checked} disabled={disabled}
      onChange={e => onChange?.(e.target.checked)}
      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
    />
  </label>
)

/* ─── Toggle ────────────────────────────────────────────────────────────── */
interface ToggleProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked = false, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
    <span
      onClick={() => onChange?.(!checked)}
      style={{
        width: '2.75rem', height: '1.5rem', borderRadius: '9999px', flexShrink: 0,
        background: checked
          ? 'linear-gradient(135deg, #1a7aff, #0062e6)'
          : 'var(--c-toggle-off-bg)',
        border: `1px solid ${checked ? 'rgba(26,122,255,0.60)' : 'var(--c-toggle-off-border)'}`,
        position: 'relative',
        transition: 'background 250ms ease, border 250ms ease, box-shadow 250ms ease',
        boxShadow: checked ? '0 0 14px rgba(26,122,255,0.30)' : 'none',
        display: 'flex', alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <span style={{
        width: '1.125rem', height: '1.125rem', borderRadius: '50%',
        background: '#ffffff',
        position: 'absolute',
        left: checked ? 'calc(100% - 1.25rem)' : '0.1875rem',
        transition: 'left 250ms cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
      }} />
    </span>
    {label && (
      <span style={{
        fontSize: '0.9375rem',
        color: 'var(--c-toggle-label)',
        transition: 'color 350ms ease',
      }}>
        {label}
      </span>
    )}
  </label>
)

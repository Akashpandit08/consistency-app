'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#b7ff3c] text-[#080b10] hover:bg-[#a6f027] font-black shadow-lg shadow-[#b7ff3c]/25 border-none',
  ghost: 'bg-transparent border border-[#242d38] text-[#8d98a7] hover:border-[#b7ff3c] hover:text-white font-semibold',
  danger: 'bg-[#ff4d4d] text-white hover:brightness-90 font-bold border-none',
  outline: 'bg-transparent border border-[#b7ff3c]/60 text-[#b7ff3c] hover:bg-[#b7ff3c]/10 font-bold',
}

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-3 py-2 rounded-lg',
  md: 'text-sm px-4 py-3 rounded-xl',
  lg: 'text-base px-6 py-3.5 rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'primary', size = 'md', loading = false, fullWidth = false, className = '', disabled, style, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          variantStyles[variant] || variantStyles.primary,
          sizeStyles[size] || sizeStyles.md,
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        disabled={disabled || loading}
        style={{
          backgroundColor: variant === 'primary' ? '#b7ff3c' : undefined,
          color: variant === 'primary' ? '#080b10' : undefined,
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }

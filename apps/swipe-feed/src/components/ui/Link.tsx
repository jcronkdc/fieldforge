import React, { forwardRef } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import clsx from 'clsx';

type LinkVariant = 'primary' | 'secondary' | 'muted';

export interface AppLinkProps extends LinkProps {
  /**
   * Visual variant for colour treatment.
   */
  variant?: LinkVariant;
  /**
   * Optional icon rendered with the link.
   */
  icon?: React.ReactNode;
  /**
   * Icon position relative to the label.
   */
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<LinkVariant, string> = {
  primary: 'text-[var(--color-accent)] hover:text-[var(--color-accent)]/90',
  secondary: 'text-slate-300 hover:text-white',
  muted: 'text-slate-500 hover:text-slate-300',
};

/**
 * Brand-aware link component with consistent hover and focus-visible behaviour.
 */
export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ variant = 'primary', className, icon, iconPosition = 'left', children, ...props }, ref) => (
    <RouterLink
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1 underline underline-offset-4 transition-[color,transform] duration-[var(--dur-med)] ease-[var(--ease-standard)]',
        'focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--ring-offset)] focus-visible:ring-0',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && <span aria-hidden>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span aria-hidden>{icon}</span>}
    </RouterLink>
  )
);

Link.displayName = 'Link';

export default Link;
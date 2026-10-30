import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="page-head">
      <div className="page-head__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-head__desc">{description}</p>
      </div>
      {children ? <div className="page-head__actions">{children}</div> : null}
    </header>
  );
}

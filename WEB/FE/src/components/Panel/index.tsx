import type { HTMLAttributes } from 'react';
import { Content, Subtitle, Wrap } from './styles';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Panel({ title, subtitle, children, ...rest }: PanelProps) {
  return (
    <Wrap {...rest}>
      {title ? <h3 style={{ margin: 0 }}>{title}</h3> : null}
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      <Content>{children}</Content>
    </Wrap>
  );
}

export default Panel;



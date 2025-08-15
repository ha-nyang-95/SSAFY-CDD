import { StyledBadge } from './styles';

export type StatusKind = 'scheduled' | 'running' | 'completed' | 'error';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusKind;
  label?: string;
}

export default function StatusBadge({ status, label, ...rest }: StatusBadgeProps) {
  return <StyledBadge data-status={status} {...rest}>{label ?? status}</StyledBadge>;
}



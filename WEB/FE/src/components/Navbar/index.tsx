import type { ReactNode } from 'react';
import Button from '../Button';
import { Bar, Inner, Links, Logo, MenuToggle } from './styles';

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  logo: string | ReactNode;
  navLinks: NavLinkItem[];
  actionLabel?: string;
  onActionClick?: () => void;
}

export function Navbar({ logo, navLinks, actionLabel = 'Login', onActionClick }: NavbarProps) {
  return (
    <Bar>
      <Inner>
        <Logo>{typeof logo === 'string' ? <span>{logo}</span> : logo}</Logo>
        <MenuToggle aria-label="Toggle Menu">Menu</MenuToggle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Links style={{ display: 'flex' }}>
            {navLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </Links>
          <Button onClick={onActionClick}>{actionLabel}</Button>
        </div>
      </Inner>
    </Bar>
  );
}

export default Navbar;



import { Inner, Links, Wrap } from './styles';

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterProps {
  links?: FooterLinkItem[];
  owner?: string;
  year?: number;
}

export function Footer({ links = [], owner = 'Company', year = new Date().getFullYear() }: FooterProps) {
  return (
    <Wrap>
      <Inner>
        <span>© {year} {owner}. All rights reserved.</span>
        <Links>
          {links.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </Links>
      </Inner>
    </Wrap>
  );
}

export default Footer;



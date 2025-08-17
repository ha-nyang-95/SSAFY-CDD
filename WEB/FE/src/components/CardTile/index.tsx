import type { HTMLAttributes } from 'react';
import { Label, Tile, Value } from './styles';

export interface CardTileProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

export function CardTile({ label, value, ...rest }: CardTileProps) {
  return (
    <Tile {...rest}>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </Tile>
  );
}

export default CardTile;



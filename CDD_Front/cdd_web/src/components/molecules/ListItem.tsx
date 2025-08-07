
import React from 'react';
import styled from 'styled-components';

const StyledListItem = styled.li`
  list-style: none;
  padding: ${(props) => props.theme.spacings.medium};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.small};
  transition: all 0.2s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px; /* Specific value from mockup */
  background-color: ${(props) => props.theme.colors.surface}; /* Use surface color */

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.medium};
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ children, onClick }) => {
  return <StyledListItem onClick={onClick}>{children}</StyledListItem>;
};

export default ListItem;

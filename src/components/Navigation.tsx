import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Spotlight", end: true },
  { to: "/art-pieces", label: "Gallery", end: false },
  { to: "/favorites", label: "Favorites", end: false },
];

type NavigationProps = {
  onAddClick?: () => void;
};

export default function Navigation({ onAddClick }: NavigationProps) {
  return (
    <nav>
      <button type="button" className="nav-add" onClick={onAddClick}>
        Add art piece
      </button>
      {links.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

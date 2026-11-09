import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Spotlight", end: true },
  { to: "/art-pieces", label: "Gallery", end: false },
];

export default function Navigation() {
  return (
    <nav>
      {links.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

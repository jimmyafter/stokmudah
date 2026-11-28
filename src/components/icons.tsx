import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'stock'
  | 'shop'
  | 'insights'
  | 'camera'
  | 'back'
  | 'close'
  | 'plus'
  | 'search'
  | 'chat'
  | 'user'
  | 'check'
  | 'calendar'
  | 'trash'
  | 'edit';

interface IconProps {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, color, size = 24, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {glyph(name)}
    </Svg>
  );
}

function glyph(name: IconName) {
  switch (name) {
    case 'home':
      return <Path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />;
    case 'stock':
      return (
        <>
          <Path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
          <Path d="M3 7l9 4 9-4M12 11v10" />
        </>
      );
    case 'shop':
      return (
        <>
          <Circle cx="9" cy="20" r="1.5" />
          <Circle cx="18" cy="20" r="1.5" />
          <Path d="M2 3h3l2.5 12h11l2-8H6" />
        </>
      );
    case 'insights':
      return <Path d="M4 20v-8M10 20V5M16 20v-11M21 20H3" />;
    case 'camera':
      return (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          <Circle cx="12" cy="13" r="4" />
        </>
      );
    case 'back':
      return <Path d="M15 5l-7 7 7 7" />;
    case 'close':
      return <Path d="M6 6l12 12M18 6L6 18" />;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" />;
    case 'search':
      return (
        <>
          <Circle cx="11" cy="11" r="7" />
          <Path d="M20 20l-4-4" />
        </>
      );
    case 'chat':
      return <Path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" />;
    case 'user':
      return (
        <>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
        </>
      );
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" />;
    case 'calendar':
      return (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="2" />
          <Path d="M3 10h18M8 3v4M16 3v4" />
        </>
      );
    case 'edit':
      return <Path d="M4 20h4L19 9l-4-4L4 16z" />;
    case 'trash':
      return <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />;
  }
}

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { DayRibbonColors } from '@theme/dayRibbon';

export interface DayRibbonIconProps {
  isFocused: boolean;
  size?: number;
  hasUnread?: boolean;
}

const getColors = (isFocused: boolean) => {
  if (isFocused) {
    return {
      b: '#FFFFFF',
      a: DayRibbonColors.amber, // #FFB020
      k: DayRibbonColors.blue,  // #2B35E0
    };
  }
  return {
    b: DayRibbonColors.inactiveBase,   // #7B7FB5
    a: DayRibbonColors.inactiveAccent, // #C9CCF0
    k: '#FFFFFF',
  };
};

// 1. Faculty Icon
export const FacultyNavIcon: React.FC<DayRibbonIconProps> = ({ isFocused, size = 24 }) => {
  const { a, b } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="7.5" r="3.6" fill={a} />
      <Path d="M4.5 14.8a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3V21.5l-7.5-3.6L4.5 21.5z" fill={b} />
    </Svg>
  );
};

// 2. CC Board Icon
export const CCBoardNavIcon: React.FC<DayRibbonIconProps> = ({ isFocused, size = 24 }) => {
  const { a, b, k } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="4" width="16" height="17.5" rx="3" fill={b} />
      <Rect x="8.5" y="2" width="7" height="4" rx="1.5" fill={a} />
      <Rect x="7.5" y="9.5" width="9" height="2.2" rx="1.1" fill={k} />
      <Rect x="7.5" y="13" width="6" height="2.2" rx="1.1" fill={k} />
      <Rect x="7.5" y="16.5" width="8" height="2.2" rx="1.1" fill={k} />
    </Svg>
  );
};

// 3. Profile Icon
export const ProfileNavIcon: React.FC<DayRibbonIconProps> = ({ isFocused, size = 24 }) => {
  const { a, b, k } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="6" width="14" height="15.5" rx="3" fill={b} />
      <Path d="M9 2h6v7l-3-2-3 2z" fill={a} />
      <Circle cx="12" cy="14" r="2.2" fill={k} />
      <Path d="M8.2 20a3.8 3.2 0 0 1 7.6 0z" fill={k} />
    </Svg>
  );
};

// 4. HOD Portal Icon
export const HodPortalNavIcon: React.FC<DayRibbonIconProps> = ({ isFocused, size = 24 }) => {
  const { a, b } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 3h3.4v18l-1.7-2.4L3 21z" fill={a} />
      <Path d="M8.2 3h3.4v11l-1.7-2.4-1.7 2.4z" fill={b} />
      <Path d="M13.4 3h3.4v15l-1.7-2.4-1.7 2.4z" fill={b} />
      <Path d="M18.6 3H22v8l-1.7-2.4-1.7 2.4z" fill={b} />
    </Svg>
  );
};

// 5. Analytics Icon
export const AnalyticsNavIcon: React.FC<DayRibbonIconProps> = ({ isFocused, size = 24 }) => {
  const { a, b } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke={b}
        strokeWidth="4.4"
        strokeDasharray="30 20.27"
        transform="rotate(-90 12 12)"
      />
      <Circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke={a}
        strokeWidth="4.4"
        strokeDasharray="17 33.27"
        strokeDashoffset="-32"
        transform="rotate(-90 12 12)"
      />
    </Svg>
  );
};

// 6. Alerts Icon
export const AlertsNavIcon: React.FC<DayRibbonIconProps> = ({
  isFocused,
  size = 24,
  hasUnread = true,
}) => {
  const { a, b, k } = getColors(isFocused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3a6 6 0 0 0-6 6v4.2L4.2 16.5A1 1 0 0 0 5 18h14a1 1 0 0 0 .8-1.5L18 13.2V9a6 6 0 0 0-6-6z"
        fill={b}
      />
      <Path d="M9.5 19.5h5a2.5 2.5 0 0 1-5 0z" fill={a} />
      {hasUnread && (
        <Circle cx="18.2" cy="5.6" r="3" fill="#FF5D73" stroke={k} strokeWidth="1.5" />
      )}
    </Svg>
  );
};

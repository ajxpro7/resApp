const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const blue = '#2563eb';
const blueLight = '#3b82f6';
const blueDark = '#1e40af';
const darkBg = '#101014'; // bijna zwart
const darkBg2 = '#18181c'; // iets lichter
const cardBg = '#18181c';
const border = '#23232a';
const text = '#fff';
const textSecondary = '#d1d5db';
const error = '#ef4444';
const success = '#22c55e';
const gradientDark = ['#101014', '#18181c'];

export const Colors = {
  blue,
  blueLight,
  blueDark,
  darkBg,
  darkBg2,
  cardBg,
  border,
  text,
  textSecondary,
  error,
  success,
  gradientDark,
  // legacy keys for compatibility
  light: {
    text: '#000',
    background: '#fff',
    tint: blue,
    tabIconDefault: '#ccc',
    tabIconSelected: blue,
  },
  dark: {
    text,
    background: darkBg,
    tint: blue,
    tabIconDefault: '#444',
    tabIconSelected: blue,
    card: cardBg,
    border,
    error,
    success,
  },
};

export default Colors;

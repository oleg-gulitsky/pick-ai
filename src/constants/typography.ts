import { TextStyle } from 'react-native';

export const FONTS = {
  DISPLAY: 'BricolageGrotesque-Bold',
  REGULAR: 'Manrope-Regular',
  SEMI_BOLD: 'Manrope-SemiBold',
  BOLD: 'Manrope-Bold',
  MONO: 'IBMPlexMono-Regular',
  MONO_MEDIUM: 'IBMPlexMono-Medium',
} as const;

export function displayText(fontSize: number, lineHeight: number): TextStyle {
  return {
    fontFamily: FONTS.DISPLAY,
    fontSize,
    lineHeight: fontSize * lineHeight,
    letterSpacing: -0.8,
    includeFontPadding: false,
  };
}

export function uiText(
  fontFamily: string,
  fontSize: number,
  lineHeight?: number,
): TextStyle {
  return {
    fontFamily,
    fontSize,
    ...(lineHeight ? { lineHeight: fontSize * lineHeight } : {}),
    includeFontPadding: false,
  };
}

export function monoText(fontSize: number, letterSpacing = 0): TextStyle {
  return {
    fontFamily: FONTS.MONO,
    fontSize,
    letterSpacing,
    includeFontPadding: false,
  };
}

export function sectionLabelText(letterSpacing = 1.4): TextStyle {
  return {
    fontFamily: FONTS.BOLD,
    fontSize: 11,
    letterSpacing,
    includeFontPadding: false,
  };
}

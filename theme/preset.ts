// Custom Aura preset tinted with the "Alytics" brand blue (#126dfb), light mode.
// The primary scale is centred on #126dfb; the light colorScheme keeps surfaces
// clean white/zinc to match the reference dashboard.
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

export const SchoolTrackPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e6efff',
      100: '#cfe0ff',
      200: '#a6c5ff',
      300: '#6ea0ff',
      400: '#3d83fb',
      500: '#126dfb',
      600: '#0765e8',
      700: '#0a55c0',
      800: '#0e4798',
      900: '#103d7a',
      950: '#0a244a',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
      },
    },
  },
})

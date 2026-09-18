import { describe, expect, it, vi } from 'vitest';
import {
  createEditor,
  getResponsiveBreakpointValue,
  isResponsiveObject,
  removeResponsiveBreakpointOverride,
  resolveNodeProps,
  resolveResponsiveValue,
  setResponsiveBreakpointValue,
  type ResponsiveValue,
} from '../index';

describe('Responsive Utilities (@irich/core)', () => {
  describe('isResponsiveObject', () => {
    it('correctly identifies responsive objects with breakpoint keys', () => {
      expect(isResponsiveObject({ desktop: 'left' })).toBe(true);
      expect(isResponsiveObject({ tablet: 'center' })).toBe(true);
      expect(isResponsiveObject({ mobile: 'right' })).toBe(true);
      expect(isResponsiveObject({ desktop: 10, mobile: 20 })).toBe(true);
    });

    it('rejects primitives, arrays, null, and non-responsive objects', () => {
      expect(isResponsiveObject(null)).toBe(false);
      expect(isResponsiveObject(undefined)).toBe(false);
      expect(isResponsiveObject('desktop')).toBe(false);
      expect(isResponsiveObject(123)).toBe(false);
      expect(isResponsiveObject(['desktop', 'mobile'])).toBe(false);
      expect(isResponsiveObject({ title: 'Hello', align: 'left' })).toBe(false);
    });
  });

  describe('resolveResponsiveValue (Cascading & Inheritance)', () => {
    it('returns scalar values directly across all breakpoints', () => {
      expect(resolveResponsiveValue('left', 'desktop')).toBe('left');
      expect(resolveResponsiveValue('left', 'tablet')).toBe('left');
      expect(resolveResponsiveValue('left', 'mobile')).toBe('left');
      expect(resolveResponsiveValue(42, 'mobile')).toBe(42);
    });

    it('resolves desktop value correctly', () => {
      const val: ResponsiveValue<string> = { desktop: 'left', tablet: 'center', mobile: 'right' };
      expect(resolveResponsiveValue(val, 'desktop')).toBe('left');
    });

    it('resolves tablet value with fallback to desktop', () => {
      const explicitTablet: ResponsiveValue<string> = { desktop: 'left', tablet: 'center' };
      expect(resolveResponsiveValue(explicitTablet, 'tablet')).toBe('center');

      const inheritedTablet: ResponsiveValue<string> = { desktop: 'left', mobile: 'right' };
      expect(resolveResponsiveValue(inheritedTablet, 'tablet')).toBe('left');
    });

    it('resolves mobile value with cascading inheritance (mobile -> tablet -> desktop -> fallback)', () => {
      // 1. Explicit mobile
      const explicitMobile: ResponsiveValue<string> = {
        desktop: 'left',
        tablet: 'center',
        mobile: 'right',
      };
      expect(resolveResponsiveValue(explicitMobile, 'mobile')).toBe('right');

      // 2. Fallback to tablet
      const inheritTablet: ResponsiveValue<string> = { desktop: 'left', tablet: 'center' };
      expect(resolveResponsiveValue(inheritTablet, 'mobile')).toBe('center');

      // 3. Fallback to desktop
      const inheritDesktop: ResponsiveValue<string> = { desktop: 'left' };
      expect(resolveResponsiveValue(inheritDesktop, 'mobile')).toBe('left');

      // 4. Fallback to default
      const noMatch: ResponsiveValue<string> = { desktop: undefined };
      expect(resolveResponsiveValue(noMatch, 'mobile', 'fallback-val')).toBe('fallback-val');
    });

    it('handles undefined or null values with fallback', () => {
      expect(resolveResponsiveValue(undefined, 'desktop', 'default')).toBe('default');
      expect(resolveResponsiveValue(null as unknown as undefined, 'mobile', 'default')).toBe('default');
    });
  });

  describe('getResponsiveBreakpointValue', () => {
    it('retrieves explicit values without cascading', () => {
      const val: ResponsiveValue<string> = { desktop: 'left', mobile: 'right' };
      expect(getResponsiveBreakpointValue(val, 'desktop')).toBe('left');
      expect(getResponsiveBreakpointValue(val, 'tablet')).toBeUndefined();
      expect(getResponsiveBreakpointValue(val, 'mobile')).toBe('right');
    });

    it('returns scalar value only for desktop', () => {
      expect(getResponsiveBreakpointValue('center', 'desktop')).toBe('center');
      expect(getResponsiveBreakpointValue('center', 'tablet')).toBeUndefined();
      expect(getResponsiveBreakpointValue('center', 'mobile')).toBeUndefined();
    });
  });

  describe('setResponsiveBreakpointValue', () => {
    it('updates desktop scalar cleanly when no overrides exist', () => {
      const next = setResponsiveBreakpointValue('left', 'desktop', 'right');
      expect(next).toBe('right');
    });

    it('preserves desktop value when setting mobile override on a scalar', () => {
      const next = setResponsiveBreakpointValue('left', 'mobile', 'center');
      expect(next).toEqual({
        desktop: 'left',
        mobile: 'center',
      });
    });

    it('preserves desktop value when setting tablet override on a scalar', () => {
      const next = setResponsiveBreakpointValue('left', 'tablet', 'center');
      expect(next).toEqual({
        desktop: 'left',
        tablet: 'center',
      });
    });

    it('updates existing responsive object without destroying other breakpoints', () => {
      const initial: ResponsiveValue<string> = { desktop: 'left', mobile: 'center' };
      const updatedTablet = setResponsiveBreakpointValue(initial, 'tablet', 'justify');
      expect(updatedTablet).toEqual({
        desktop: 'left',
        tablet: 'justify',
        mobile: 'center',
      });

      const updatedDesktop = setResponsiveBreakpointValue(updatedTablet, 'desktop', 'right');
      expect(updatedDesktop).toEqual({
        desktop: 'right',
        tablet: 'justify',
        mobile: 'center',
      });
    });

    it('creates responsive object from undefined when setting non-desktop breakpoint', () => {
      const next = setResponsiveBreakpointValue(undefined, 'mobile', 'center');
      expect(next).toEqual({ mobile: 'center' });
    });
  });

  describe('removeResponsiveBreakpointOverride', () => {
    it('removes specific breakpoint override', () => {
      const initial: ResponsiveValue<string> = {
        desktop: 'left',
        tablet: 'center',
        mobile: 'right',
      };
      const result = removeResponsiveBreakpointOverride(initial, 'mobile');
      expect(result).toEqual({
        desktop: 'left',
        tablet: 'center',
      });
    });

    it('simplifies to scalar when only desktop remains', () => {
      const initial: ResponsiveValue<string> = { desktop: 'left', mobile: 'right' };
      const result = removeResponsiveBreakpointOverride(initial, 'mobile');
      expect(result).toBe('left');
    });
  });

  describe('resolveNodeProps', () => {
    it('resolves responsive props map for specific breakpoint', () => {
      const props = {
        title: 'My Heading',
        align: { desktop: 'left', mobile: 'center' },
        padding: { desktop: 'large', tablet: 'medium' },
      };

      const desktopProps = resolveNodeProps(props, 'desktop');
      expect(desktopProps).toEqual({
        title: 'My Heading',
        align: 'left',
        padding: 'large',
      });

      const tabletProps = resolveNodeProps(props, 'tablet');
      expect(tabletProps).toEqual({
        title: 'My Heading',
        align: 'left', // inherited from desktop
        padding: 'medium',
      });

      const mobileProps = resolveNodeProps(props, 'mobile');
      expect(mobileProps).toEqual({
        title: 'My Heading',
        align: 'center',
        padding: 'medium', // inherited from tablet
      });
    });
  });

  describe('Editor Breakpoint Integration', () => {
    it('initializes with desktop breakpoint by default', () => {
      const editor = createEditor();
      expect(editor.getActiveBreakpoint()).toBe('desktop');
      expect(editor.getState().activeBreakpoint).toBe('desktop');
    });

    it('supports custom initial breakpoint via config', () => {
      const editor = createEditor({ activeBreakpoint: 'tablet' });
      expect(editor.getActiveBreakpoint()).toBe('tablet');
      expect(editor.getState().activeBreakpoint).toBe('tablet');
    });

    it('changes breakpoint and dispatches breakpoint:change event', () => {
      const editor = createEditor();
      const listener = vi.fn();
      editor.on('breakpoint:change', listener);

      editor.commands.setBreakpoint('mobile');
      expect(editor.getActiveBreakpoint()).toBe('mobile');
      expect(editor.getState().activeBreakpoint).toBe('mobile');
      expect(listener).toHaveBeenCalledWith({
        breakpoint: 'mobile',
        previousBreakpoint: 'desktop',
      });

      // No-op if same breakpoint
      editor.commands.setBreakpoint('mobile');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('throws when setting an invalid breakpoint', () => {
      const editor = createEditor();
      expect(() => {
        // @ts-expect-error invalid breakpoint
        editor.commands.setBreakpoint('ultrawide');
      }).toThrowError(/Invalid breakpoint/);
    });
  });
});

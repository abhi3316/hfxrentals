import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectHalifaxNeighborhood, searchHalifaxAddresses } from '../../src/utils/addressService';

describe('Halifax Address Service & Neighborhood Detection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectHalifaxNeighborhood', () => {
    it('detects South End based on university and street landmarks', () => {
      expect(detectHalifaxNeighborhood('1234 Dalhousie University Campus')).toBe('South End');
      expect(detectHalifaxNeighborhood('Saint Mary University area')).toBe('South End');
      expect(detectHalifaxNeighborhood('Robie Street')).toBe('South End');
      expect(detectHalifaxNeighborhood('5670 Spring Garden Road')).toBe('South End');
      expect(detectHalifaxNeighborhood('Coburg Road')).toBe('South End');
    });

    it('detects North End based on trendy corridors and historic areas', () => {
      expect(detectHalifaxNeighborhood('2500 Agricola Street')).toBe('North End');
      expect(detectHalifaxNeighborhood('Gottingen Street')).toBe('North End');
      expect(detectHalifaxNeighborhood('Hydrostone Market')).toBe('North End');
    });

    it('detects Downtown Halifax based on waterfront and core downtown streets', () => {
      expect(detectHalifaxNeighborhood('1505 Lower Water Street')).toBe('Downtown Halifax');
      expect(detectHalifaxNeighborhood('Halifax Waterfront')).toBe('Downtown Halifax');
      expect(detectHalifaxNeighborhood('Scotia Square Mall')).toBe('Downtown Halifax');
      expect(detectHalifaxNeighborhood('Hollis Street')).toBe('Downtown Halifax');
    });

    it('detects West End / Quinpool corridor', () => {
      expect(detectHalifaxNeighborhood('6112 Quinpool Road')).toBe('West End / Quinpool');
      expect(detectHalifaxNeighborhood('Chebucto Road')).toBe('West End / Quinpool');
      expect(detectHalifaxNeighborhood('Connaught Avenue')).toBe('West End / Quinpool');
    });

    it('detects Clayton Park & MSVU corridor', () => {
      expect(detectHalifaxNeighborhood('255 Lacewood Drive')).toBe('Clayton Park');
      expect(detectHalifaxNeighborhood('Mount Saint Vincent University')).toBe('Clayton Park');
      expect(detectHalifaxNeighborhood('Dunbrack Street')).toBe('Clayton Park');
    });

    it('detects Bedford & Larry Uteck', () => {
      expect(detectHalifaxNeighborhood('1550 Bedford Highway')).toBe('Bedford');
      expect(detectHalifaxNeighborhood('Larry Uteck Boulevard')).toBe('Bedford');
    });

    it('detects Fairview & Dutch Village', () => {
      expect(detectHalifaxNeighborhood('3440 Dutch Village Road')).toBe('Fairview');
      expect(detectHalifaxNeighborhood('Titus Street')).toBe('Fairview');
    });

    it('detects Dartmouth areas', () => {
      expect(detectHalifaxNeighborhood('88 Alderney Drive')).toBe('Downtown Dartmouth');
      expect(detectHalifaxNeighborhood('Kings Wharf Place')).toBe('Downtown Dartmouth');
      expect(detectHalifaxNeighborhood('Highfield Park Drive')).toBe('North Dartmouth');
      expect(detectHalifaxNeighborhood('NSCC Akerley Campus')).toBe('North Dartmouth');
    });

    it('returns undefined for non-matching or generic locations', () => {
      expect(detectHalifaxNeighborhood('123 Random Unknown Lane')).toBeUndefined();
      expect(detectHalifaxNeighborhood('Toronto, ON')).toBeUndefined();
    });
  });

  describe('searchHalifaxAddresses', () => {
    it('returns empty array for queries under 2 characters', async () => {
      expect(await searchHalifaxAddresses('')).toEqual([]);
      expect(await searchHalifaxAddresses(' ')).toEqual([]);
      expect(await searchHalifaxAddresses('R')).toEqual([]);
    });

    it('returns instant local matches for popular HRM streets without external API', async () => {
      const results = await searchHalifaxAddresses('Robie');
      expect(results.length).toBeGreaterThan(0);
      const robie = results.find(r => r.streetAddress.includes('Robie Street'));
      expect(robie).toBeDefined();
      expect(robie?.neighborhood).toBe('South End');
      expect(robie?.city).toBe('Halifax');
      expect(robie?.fullAddress).toContain('Robie Street, Halifax, NS, Canada');
    });

    it('preserves house numbers when user types an address', async () => {
      const results = await searchHalifaxAddresses('1459 Robie');
      expect(results.length).toBeGreaterThan(0);
      const match = results[0];
      expect(match.streetAddress).toBe('1459 Robie Street');
      expect(match.fullAddress).toContain('1459 Robie Street, Halifax, NS, Canada');
    });

    it('gracefully handles fetch errors and returns local street results', async () => {
      // Mock fetch to simulate network timeout or failure
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const results = await searchHalifaxAddresses('Quinpool');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].neighborhood).toBe('West End / Quinpool');
    });
  });
});

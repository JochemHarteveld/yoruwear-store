/**
 * Currency formatting utilities for the YoruWear store
 */

export class CurrencyUtils {
  /**
   * Format a price value as European currency (EUR)
   * @param price - Price as string or number
   * @param locale - Locale for formatting (defaults to 'en-EU')
   * @returns Formatted price string with euro symbol
   */
  static formatPrice(price: string | number, locale: string = 'en-EU'): string {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return '€0.00';
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  }
  
  /**
   * Format price with custom symbol (fallback method)
   * @param price - Price as string or number
   * @param symbol - Currency symbol (defaults to '€')
   * @returns Formatted price string
   */
  static formatPriceSimple(price: string | number, symbol: string = '€'): string {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return `${symbol}0.00`;
    }
    
    return `${symbol}${numericPrice.toFixed(2)}`;
  }
  
  /**
   * Parse price string to number
   * @param priceString - Price string to parse
   * @returns Numeric price value
   */
  static parsePrice(priceString: string): number {
    const cleaned = priceString.replace(/[€$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  /**
   * Format price range
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @returns Formatted price range string
   */
  static formatPriceRange(minPrice: string | number, maxPrice: string | number): string {
    const min = this.formatPrice(minPrice);
    const max = this.formatPrice(maxPrice);
    return `${min} - ${max}`;
  }
}
/**
 * Formats currency amount in pence to GBP string
 * @param {number} amountInPence - Amount in pence (integer)
 * @returns {string} Formatted string: "£X,XXX.XX"
 * @example formatCurrency(425000) returns "£4,250.00"
 */
export function formatCurrency(amountInPence) {
  const pounds = (amountInPence || 0) / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(pounds);
}

/**
 * Payment status color schemes
 */
export const statusColors = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  sent: "bg-blue-100 text-blue-700 border-blue-300",
  active: "bg-blue-100 text-blue-700 border-blue-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  overdue: "bg-red-100 text-red-700 border-red-300",
  cancelled: "bg-gray-200 text-gray-800 border-gray-400",
  expired: "bg-gray-200 text-gray-800 border-gray-400"
};

/**
 * Generates the next sequential invoice number for the current year
 * Format: INV-YYYY-XXX (e.g., INV-2025-001, INV-2025-042)
 * 
 * @param {Array} existingInvoices - Array of existing invoice records
 * @returns {string} Next invoice number in format INV-YYYY-XXX
 */
export function generateInvoiceNumber(existingInvoices) {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `INV-${currentYear}-`;
  
  // Filter invoices from current year
  const invoicesThisYear = existingInvoices.filter(inv => 
    inv.invoiceNumber?.startsWith(yearPrefix)
  );
  
  // If no invoices this year, start with 001
  if (invoicesThisYear.length === 0) {
    return `${yearPrefix}001`;
  }
  
  // Extract numbers from invoice numbers and find the highest
  const numbers = invoicesThisYear
    .map(inv => {
      const match = inv.invoiceNumber.match(/INV-\d{4}-(\d{3})/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  const highestNumber = Math.max(...numbers, 0);
  const nextNumber = highestNumber + 1;
  
  // Format with zero-padding (3 digits)
  return `${yearPrefix}${String(nextNumber).padStart(3, '0')}`;
}
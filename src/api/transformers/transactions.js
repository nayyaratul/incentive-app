// ---------------------------------------------------------------------------
// Transaction transformers
// Maps sales API rows to the shape HistoryScreen expects.
// ---------------------------------------------------------------------------

function normaliseNullish(val) {
  if (val === undefined || val === null || val === '' || val === '\u2014') return null;
  return val;
}

/**
 * Transform a single sales API row into the HistoryScreen row shape.
 */
export function transformTransaction(apiRow) {
  if (!apiRow) return null;

  return {
    transactionId: apiRow.transactionId ?? null,
    transactionDate: apiRow.transactionDate ?? null,
    storeCode: apiRow.storeCode ?? null,
    vertical: apiRow.vertical ?? null,
    storeFormat: '',
    employeeId: apiRow.employeeId ?? null,
    department: normaliseNullish(apiRow.department),
    articleCode: apiRow.articleCode ?? null,
    productFamilyCode: null,
    brand: normaliseNullish(apiRow.brand),
    productFamily: null,
    quantity: Number(apiRow.quantity) || 0,
    grossAmount: Number(apiRow.grossAmount) || 0,
    taxAmount: Number(apiRow.taxAmount) || 0,
    totalAmount: Number(apiRow.totalAmount) || 0,
    transactionType: apiRow.transactionType ?? null,
    channel: apiRow.channel ?? null,
    baseIncentive: null,
    multiplierApplied: null,
    finalIncentive: Number(apiRow.incentiveAmount) || 0,
    note: apiRow.status === 'Excluded' ? 'Excluded' : null,
  };
}

/**
 * Transform an array of sales API rows. Filters out nulls from bad input rows.
 */
export function transformTransactions(apiRows) {
  if (!Array.isArray(apiRows)) return [];
  return apiRows.map(transformTransaction).filter(Boolean);
}

export const MAX_GROUP_MEMBER_LOAN_TOTAL = 500_000;
/** Equal share cap: floor(500_000 / 3) — matches minimum group size of 3. */
export const MAX_MEMBER_LOAN_AMOUNT = Math.floor(MAX_GROUP_MEMBER_LOAN_TOTAL / 3);
export const MAX_MEMBER_LOAN_AMOUNT_MESSAGE = `Maximum allowed is ${MAX_MEMBER_LOAN_AMOUNT}`;
export const MAX_GROUP_LOAN_TOTAL_MESSAGE = `Total loan amount across all members must not exceed KES ${MAX_GROUP_MEMBER_LOAN_TOTAL.toLocaleString()}`;

export interface LoanAmountFieldValidation {
  field: string;
  amount: number;
}

export interface LoanAmountValidationError {
  field: string;
  message: string;
}

export function validateGroupMemberLoanAmounts(
  amounts: LoanAmountFieldValidation[],
): LoanAmountValidationError[] {
  const errors: LoanAmountValidationError[] = [];
  let total = 0;

  for (const { field, amount } of amounts) {
    if (amount > MAX_MEMBER_LOAN_AMOUNT) {
      errors.push({ field, message: MAX_MEMBER_LOAN_AMOUNT_MESSAGE });
    }
    total += amount;
  }

  if (total > MAX_GROUP_MEMBER_LOAN_TOTAL && amounts.length > 0) {
    for (const { field } of amounts) {
      errors.push({
        field,
        message: MAX_GROUP_LOAN_TOTAL_MESSAGE,
      });
    }
  }

  return errors;
}

export function loanAmountValidationToFieldErrors(
  errors: LoanAmountValidationError[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const { field, message } of errors) {
    result[field] ??= [];
    if (!result[field].includes(message)) {
      result[field].push(message);
    }
  }

  return result;
}

export interface MemberWithAmount {
  amount: number;
}

export interface MemberAmountAdjustment {
  index: number;
  name: string;
  originalAmount: number;
  adjustedAmount: number;
}

export interface AdjustLoanAmountsResult<T extends MemberWithAmount> {
  members: T[];
  wasAdjusted: boolean;
  originalTotal: number;
  newTotal: number;
  breakdown: MemberAmountAdjustment[];
}

function getMemberLabel<T extends MemberWithAmount>(
  member: T,
  index: number,
): string {
  if ('name' in member && typeof member.name === 'string') {
    const name = member.name.trim();
    if (name) {
      return name;
    }
  }

  return `Member ${index + 1}`;
}

/**
 * Redistribute member loan amounts when the total exceeds the group cap.
 * Matches the legacy administrator portal algorithm in LoanApplicationForm.js.
 */
export function adjustLoanAmounts<T extends MemberWithAmount>(
  members: T[],
  maxLoanAmount = MAX_GROUP_MEMBER_LOAN_TOTAL,
): AdjustLoanAmountsResult<T> {
  const originalTotal = members.reduce(
    (sum, member) => sum + (Number(member.amount) || 0),
    0,
  );

  const breakdown = members.map((member, index) => ({
    index,
    name: getMemberLabel(member, index),
    originalAmount: Number(member.amount) || 0,
    adjustedAmount: Number(member.amount) || 0,
  }));

  if (originalTotal <= maxLoanAmount) {
    return {
      members,
      wasAdjusted: false,
      originalTotal,
      newTotal: originalTotal,
      breakdown,
    };
  }

  const indexed = members.map((member, index) => ({
    index,
    requestedAmount: Number(member.amount) || 0,
  }));

  const sorted = [...indexed].sort(
    (a, b) => a.requestedAmount - b.requestedAmount,
  );

  const adjustedByIndex = new Map<number, number>();
  let remainingAmount = maxLoanAmount;

  sorted.forEach((entry, sortedIndex) => {
    const remainingCount = sorted.length - sortedIndex;
    const requestedAmount = entry.requestedAmount;

    if (requestedAmount <= remainingAmount / remainingCount) {
      const cappedAmount = Math.min(requestedAmount, MAX_MEMBER_LOAN_AMOUNT);
      adjustedByIndex.set(entry.index, cappedAmount);
      remainingAmount -= cappedAmount;
    } else {
      const equalShare = Math.min(
        Math.floor(remainingAmount / remainingCount),
        MAX_MEMBER_LOAN_AMOUNT,
      );
      adjustedByIndex.set(entry.index, equalShare);
      remainingAmount -= equalShare;
    }
  });

  if (remainingAmount > 0) {
    const sortedByAllocation = [...indexed].sort(
      (a, b) =>
        (adjustedByIndex.get(a.index) ?? 0) -
        (adjustedByIndex.get(b.index) ?? 0),
    );

    for (let i = 0; i < remainingAmount; i++) {
      const index = sortedByAllocation[i % sortedByAllocation.length]?.index;
      if (index == null) {
        continue;
      }

      adjustedByIndex.set(index, (adjustedByIndex.get(index) ?? 0) + 1);
    }
  }

  const adjustedMembers = members.map((member, index) => ({
    ...member,
    amount: adjustedByIndex.get(index) ?? 0,
  }));

  const adjustedBreakdown = members.map((member, index) => ({
    index,
    name: getMemberLabel(member, index),
    originalAmount: Number(member.amount) || 0,
    adjustedAmount: adjustedByIndex.get(index) ?? 0,
  }));

  const newTotal = adjustedMembers.reduce(
    (sum, member) => sum + Number(member.amount),
    0,
  );

  return {
    members: adjustedMembers,
    wasAdjusted: true,
    originalTotal,
    newTotal,
    breakdown: adjustedBreakdown,
  };
}

export function formatLoanAmount(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

export function buildAmountRedistributionMessage(
  originalTotal: number,
  newTotal: number,
  maxLoanAmount = MAX_GROUP_MEMBER_LOAN_TOTAL,
): string {
  return (
    `The total loan amount requested (KES ${originalTotal.toLocaleString()}) exceeds the maximum ` +
    `allowed limit of KES ${maxLoanAmount.toLocaleString()} for group member loans. ` +
    `Your member loan amounts have been automatically redistributed to fit within this limit. ` +
    `The new total is KES ${newTotal.toLocaleString()}.`
  );
}

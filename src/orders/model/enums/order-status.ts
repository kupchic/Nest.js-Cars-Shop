export enum OrderStatus {
  WAITING_DISCOUNT_APPROVAL,
  IN_PROGRESS,
  PURCHASED,
  DECLINED,
}

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_DISCOUNT_APPROVAL]: 'waiting for discount approval',
  [OrderStatus.IN_PROGRESS]: 'in progress',
  [OrderStatus.PURCHASED]: 'approved',
  [OrderStatus.DECLINED]: 'declined',
};

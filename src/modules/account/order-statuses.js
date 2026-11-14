export const orderStatuses = Object.freeze([
  { key: 'all', label: '全部订单', icon: 'bag' },
  { key: 'pending-payment', label: '待付款', icon: 'wallet' },
  { key: 'pending-shipment', label: '待发货', icon: 'box' },
  { key: 'pending-receipt', label: '待收货', icon: 'truck' },
  { key: 'pending-review', label: '待评价', icon: 'star' },
  { key: 'refund', label: '退款/售后', icon: 'return' },
])

export function resolveOrderStatus(value) {
  return orderStatuses.find((status) => status.key === value) ?? orderStatuses[0]
}

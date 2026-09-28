import { HttpTypes } from "@medusajs/types"

/** Where an order is, in words a shopper would use. */
export function getOrderStatusLabel(order: HttpTypes.StoreOrder) {
  if (order.status === "canceled") {
    return "Cancelled"
  }

  switch (order.fulfillment_status) {
    case "delivered":
    case "partially_delivered":
      return "Delivered"
    case "shipped":
    case "partially_shipped":
      return "On its way"
    case "fulfilled":
    case "partially_fulfilled":
      return "Packed"
    default:
      return "Being prepared"
  }
}

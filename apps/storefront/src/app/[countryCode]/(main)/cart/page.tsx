import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Your cart | LAYERD",
  description: "Review the pieces in your cart.",
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const [customer, shippingOptions] = await Promise.all([
    retrieveCustomer(),
    cart?.items?.length
      ? listCartOptions()
          .then(({ shipping_options }) => shipping_options)
          .catch(() => [])
      : [],
  ])

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      shippingOptions={shippingOptions}
    />
  )
}

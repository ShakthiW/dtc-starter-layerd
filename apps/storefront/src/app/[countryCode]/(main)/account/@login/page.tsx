import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in | LAYERD",
  description: "Sign in to your LAYERD account or create one.",
}

const PANEL_PRODUCT_HANDLE = "the-wave-lamp"

export default async function Login(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const panelImage = await listProducts({
    countryCode,
    queryParams: {
      handle: PANEL_PRODUCT_HANDLE,
      limit: 1,
      fields: "thumbnail",
    },
  })
    .then(({ response }) => response.products[0]?.thumbnail ?? null)
    .catch(() => null)

  return <LoginTemplate panelImage={panelImage} />
}

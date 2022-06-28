import { Page } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { QRCodeForm } from '../../components'

export default function ManageCode() {
  const breadcrumbs = [{content: 'Subscription Plans', url: '/' }]

  return (
    <Page>
      <TitleBar
        title="Create subscription plan"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <QRCodeForm />
    </Page>
  )
}


import { useState, useCallback } from 'react'
import {
  Banner,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  ChoiceList,
  Select,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
} from '@shopify/polaris'
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from '@shopify/app-bridge-react'
import { ImageMajor, AlertMinor } from '@shopify/polaris-icons'

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useShopifyQuery } from '../hooks'

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from '@shopify/react-form'

const NO_DISCOUNT_OPTION = { label: 'No discount', value: '' }

/*
  The discount codes available in the store.

  This variable will only have a value after retrieving discount codes from the API.
*/
const DISCOUNT_CODES = {}

export function QRCodeForm({ QRCode: InitialQRCode }) {
  const [QRCode, setQRCode] = useState(InitialQRCode)
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product)
  const navigate = useNavigate()
  const appBridge = useAppBridge()
  const fetch = useAuthenticatedFetch()
  const deletedProduct = QRCode?.product?.title === 'Deleted product'

  /*
    This is a placeholder function that is triggered when the user hits the "Save" button.

    It will be replaced by a different function when the frontend is connected to the backend.
  */
  const onSubmit = (body) => console.log('submit', body)

  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: QRCode?.title || '',
        validates: [notEmptyString('Please name your QR code')],
      }),
      productId: useField({
        value: deletedProduct ? 'Deleted product' : (QRCode?.product?.id || ''),
        validates: [notEmptyString('Please select a product')],
      }),
      variantId: useField(QRCode?.variantId || ''),
      handle: useField(QRCode?.handle || ''),
      destination: useField(
        QRCode?.destination ? [QRCode.destination] : ['product']
      ),
      discountId: useField(QRCode?.discountId || NO_DISCOUNT_OPTION.value),
      discountCode: useField(QRCode?.discountCode || ''),
    },
    onSubmit,
  })

  const QRCodeURL = QRCode ? new URL(
    `/qrcodes/${QRCode.id}/image`,
    location.toString()
  ).toString() : null

  /*
    This function is called with the selected product whenever the user clicks "Add" in the ResourcePicker.

    It takes the first item in the selection array and sets the selected product to an object with the properties from the "selection" argument.

    It updates the form state using the "onChange" methods attached to the form fields.

    Finally, closes the ResourcePicker.
  */
  const handleProductChange = useCallback(({ selection }) => {
    setSelectedProduct({
      title: selection[0].title,
      images: selection[0].images,
      handle: selection[0].handle,
    })
    productId.onChange(selection[0].id)
    variantId.onChange(selection[0].variants[0].id)
    handle.onChange(selection[0].handle)
    setShowResourcePicker(false)
  }, [])

  /*
    This function updates the form state whenever a user selects a new discount option.
  */
  const handleDiscountChange = useCallback((id) => {
    discountId.onChange(id)
    discountCode.onChange(DISCOUNT_CODES[id] || '')
  }, [])

  /*
    This function is called when a user clicks "Select product" or cancels the ProductPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  )

  /*
    This is a placeholder function that is triggered when the user hits the "Delete" button.

    It will be replaced by a different function when the frontend is connected to the backend.
  */
  const isDeleting = false
  const deleteQRCode = () => console.log('delete')

  /*
    This function runs when a user clicks the "Go to destination" button.

    It uses data from the App Bridge context as well as form state to construct destination URLs using the URL helpers you created.
  */
  const goToDestination = useCallback(() => {
    if (!selectedProduct) return
    const data = {
      host: appBridge.hostOrigin,
      productHandle: handle.value || selectedProduct.handle,
      discountCode: discountCode.value || undefined,
      variantId: variantId.value,
    }

    const targetURL = deletedProduct || destination.value[0] === 'product'
      ? productViewURL(data)
      : productCheckoutURL(data)

    window.open(targetURL, '_blank', 'noreferrer,noopener')
  }, [QRCode, selectedProduct, destination, discountCode, handle, variantId])

  /*
    This array is used in a select field in the form to manage discount options.

    It will be extended when the frontend is connected to the backend and the array is populated with discount data from the store.

    For now, it contains only the default value.
  */
  const isLoadingDiscounts = true;
  const discountOptions = [NO_DISCOUNT_OPTION]

  /*
    These variables are used to display product images, and will be populated when image URLs can be retrieved from the Admin.
  */
  const imageSrc = selectedProduct?.images?.edges?.[0]?.node?.url
  const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc
  const altText =
    selectedProduct?.images?.[0]?.altText || selectedProduct?.title

  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
    </Stack>
  )
}

/* Builds a URL to the selected product */
function productViewURL({ host, productHandle, discountCode }) {
  const url = new URL(host)
  const productPath = `/products/${productHandle}`

  /*
    If a discount is selected, then build a URL to the selected discount that redirects to the selected product: /discount/{code}?redirect=/products/{product}
  */
  if (discountCode) {
    url.pathname = `/discount/${discountCode}`
    url.searchParams.append('redirect', productPath)
  } else {
    url.pathname = productPath
  }

  return url.toString()
}

/* Builds a URL to a checkout that contains the selected product */
function productCheckoutURL({
  host,
  variantId,
  quantity = 1,
  discountCode,
}) {
  const url = new URL(host)
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    '$1'
  )

  url.pathname = `/cart/${id}:${quantity}`

  /*
    Builds a URL to a checkout that contains the selected product with a discount code applied
  */
  if (discountCode) {
    url.searchParams.append('discount', discountCode)
  }

  return url.toString()
}


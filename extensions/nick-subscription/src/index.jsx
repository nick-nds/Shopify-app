import React, {useState, useEffect, useMemo, useCallback} from 'react';
import CreateForm from './CreateForm'
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  InlineStack,
  StackItem,
  Select,
  Text,
  TextBlock,
  TextField,
  extend,
  render,
  useData,
  useContainer,
  useSessionToken,
  useLocale,
} from '@shopify/admin-ui-extensions-react';

const translations = {
  de: {
    hello: 'Guten Tag',
  },
  en: {
    hello: 'Hello',
  },
  fr: {
    hello: 'Bonjour',
  },
};

function Actions({onPrimary, onClose, title}) {
  return (
    <InlineStack inlineAlignment="trailing">
      <Button title="Cancel" onPress={onClose} />
      <Button title={title} onPress={onPrimary} kind="primary" />
    </InlineStack>
  );
}

// 'Add' mode should allow a user to add the current product to an existing selling plan
// [Shopify admin renders this mode inside a modal container]
function Add() {
  // Information about the product and/or plan your extension is editing.
  // Your extension receives different data in each mode.
  const data = useData();

  // The UI your extension renders inside
  const {close, done, setPrimaryAction, setSecondaryAction} = useContainer();

  // Information about the merchant's selected language. Use this to support multiple languages.
  const locale = useLocale();

  // Use locale to set translations with a fallback
  const localizedStrings = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  // Session token contains information about the current user. Use it to authenticate calls
  // from your extension to your app server.
  const {getSessionToken} = useSessionToken();

  const [selectedPlans, setSelectedPlans] = useState([]);
  const mockPlans = [
    {name: 'Subscription Plan A', id: 'a'},
    {name: 'Subscription Plan B', id: 'b'},
    {name: 'Subscription Plan C', id: 'c'},
  ];

  // Configure the extension container UI
  useEffect(() => {
    setPrimaryAction({
      content: 'Add to plan',
      onAction: async () => {
        // Get a fresh session token before every call to your app server.
        const token = await getSessionToken();

        // Here, send the form data to your app server to add the product to an existing plan.

        // Upon completion, call done() to trigger a reload of the resource page
        // and terminate the extension.
        done();
      },
    });

    setSecondaryAction({
      content: 'Cancel',
      onAction: () => close(),
    });
  }, [getSessionToken, close, done, setPrimaryAction, setSecondaryAction]);

  return (
    <>
      <TextBlock size="extraLarge">{localizedStrings.hello}!</TextBlock>
      <Text>
        Add Product id {data.productId} to an existing plan or existing plans
      </Text>

      <InlineStack>
        {mockPlans.map((plan) => (
          <Checkbox
            key={plan.id}
            label={plan.name}
            onChange={(checked) => {
              const plans = checked
                ? selectedPlans.concat(plan.id)
                : selectedPlans.filter((id) => id !== plan.id);
              setSelectedPlans(plans);
            }}
            checked={selectedPlans.includes(plan.id)}
          />
        ))}
      </InlineStack>
    </>
  );
}

// 'Create' mode should create a new selling plan, and add the current product to it
// [Shopify admin renders this mode inside an app overlay container]
function Create() {
  const data = useData();
  const {close, done} = useContainer();
  const locale = useLocale();
  const localizedStrings = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const {getSessionToken} = useSessionToken();

  // Mock plan settings
  const [planTitle, setPlanTitle] = useState('');
  const [percentageOff, setPercentageOff] = useState('');
  const [deliveryFrequency, setDeliveryFrequency] = useState('');

  const onPrimaryAction = useCallback(async () => {
    const token = await getSessionToken();
 
     // The product and variant IDs collected from the modal form
    let payload = {
      productId: data.productId,
      variantId: data.variantId,
    };

    // Send the form data to your app server to create the new plan.
    const response = await fetch('https://aebc-103-93-203-54.ngrok.io/api/subscription/new', {
      method: 'POST',
      headers: {
        'any-header-key': token || 'unknown token',
      },
      body: JSON.stringify(payload)
    });
    console.log(response);
    // If the server responds with an OK status, then refresh the UI and close the modal
    if (response.ok) {
      done();
    } else {
      console.log('Handle error.');
    }
    close();
  }, [getSessionToken, done]);

  const cachedActions = useMemo(
    () => (
      <Actions
        onPrimary={onPrimaryAction}
        onClose={close}
        title="Create plan"
      />
    ),
    [onPrimaryAction, close]
  );

  const deliveryOptions = [
    {
        label: 'Bill by cycle',
        value: 'bill-by-cycle'
    },
    {
        label: 'Bill by date',
        value: 'bill-by-date'
    },
    {
        label: 'Bill by relative date',
        value: 'bill-by-relative-date'
    },
  ];

  const offerOptions = [
    {
        label: 'Subscribe & Save',
        value: 'subscribe-and-save'
    },
    {
        label: 'Prepaid',
        value: 'prepaid'
    },
    {
        label: 'Custom Recurring',
        value: 'custom-recurring'
    },
  ];

  return (
    <>
      <BlockStack spacing="none">
        <TextBlock size="extraLarge">
          Create Unify subscription
        </TextBlock>
      </BlockStack>

      <CreateForm offerOptions={offerOptions} deliveryOptions={deliveryOptions} />

      {cachedActions}
    </>
  );
}

// 'Remove' mode should remove the current product from a selling plan.
// This should not delete the selling plan.
// [Shopify admin renders this mode inside a modal container]
function Remove() {
  const data = useData();
  const {close, done, setPrimaryAction, setSecondaryAction} = useContainer();
  const locale = useLocale();
  const localizedStrings = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const {getSessionToken} = useSessionToken();

  useEffect(() => {
    setPrimaryAction({
      content: 'Remove from plan',
      onAction: async () => {
        const token = await getSessionToken();

        // Here, send the form data to your app server to remove the product from the plan.

        done();
      },
    });

    setSecondaryAction({
      content: 'Cancel',
      onAction: () => close(),
    });
  }, [getSessionToken, close, done, setPrimaryAction, setSecondaryAction]);

  return (
    <>
      <TextBlock size="extraLarge">{localizedStrings.hello}!</TextBlock>
      <Text>
        Remove Product id {data.productId} from Plan group id{' '}
        {data.sellingPlanGroupId}
      </Text>
    </>
  );
}

// 'Edit' mode should modify an existing selling plan.
// Changes should affect other products that have this plan applied.
// [Shopify admin renders this mode inside an app overlay container]
function Edit() {
  const data = useData();
  const {close, done} = useContainer();
  const locale = useLocale();
  const localizedStrings = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const {getSessionToken} = useSessionToken();

  const [planTitle, setPlanTitle] = useState('Current plan');
  const [percentageOff, setPercentageOff] = useState('10');
  const [deliveryFrequency, setDeliveryFrequency] = useState('1');

  const onPrimaryAction = useCallback(async () => {
    const token = await getSessionToken();

    // Here, send the form data to your app server to modify the selling plan.

    done();
  }, [getSessionToken, done]);

  const cachedActions = useMemo(
    () => (
      <Actions onPrimary={onPrimaryAction} onClose={close} title="Edit plan" />
    ),
    [onPrimaryAction, close]
  );

  return (
    <>
      <BlockStack spacing="none">
        <TextBlock size="extraLarge">
          {localizedStrings.hello}! Edit subscription plan
        </TextBlock>
      </BlockStack>

      <Card
        title={`Edit subscription plan for Product id ${data.productId}`}
        sectioned
      >
        <TextField
          label="Plan title"
          value={planTitle}
          onChange={setPlanTitle}
        />
      </Card>

      <Card title="Delivery and discount" sectioned>
        <InlineStack>
          <TextField
            type="number"
            label="Delivery frequency (in weeks)"
            value={deliveryFrequency}
            onChange={setDeliveryFrequency}
          />
          <TextField
            type="number"
            label="Percentage off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </InlineStack>
      </Card>

      {cachedActions}
    </>
  );
}

// Your extension must render all four modes
extend(
  'Admin::Product::SubscriptionPlan::Add',
  render(() => <Add />)
);
extend(
  'Admin::Product::SubscriptionPlan::Create',
  render(() => <Create />)
);
extend(
  'Admin::Product::SubscriptionPlan::Remove',
  render(() => <Remove />)
);
extend(
  'Admin::Product::SubscriptionPlan::Edit',
  render(() => <Edit />)
);

import React, { useState } from 'react';
import {
  BlockStack,
  Card,
  InlineStack,
  StackItem,
  Select,
  Text,
  TextBlock,
  TextField,
  CardSection,
} from '@shopify/admin-ui-extensions-react';

export default class CreateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offer: 'subscribe-and-save',
            delivery: 'bill-by-cycle',
            planTitle: '',
            deliveryFrequency: '',
            percentageOff: '',
        };
        this.offerOptions = props.offerOptions;
        this.deliveryOptions = props.deliveryOptions;
    }

    handleChange(e) {
        console.log("event", e);
    }

    render () {

        return (
          <Card>
            <CardSection
              title={'Create new subscription offer'}
              sectioned
            >
                <InlineStack spacing="loose">
                    <StackItem fill>
                        <Select 
                            label="Subscription Offer Type"
                            options={this.offerOptions}
                            name="offer"
                            value={this.offer}
                            onChange={this.handleChange}
                        />
                        <TextBlock size="small"
                            role='description'
                            variation='subdued'
                        >
                            Bill and deliver to your customers with the same frequency
                        </TextBlock>
                    </StackItem>

                    <StackItem>
                        <Select 
                            label="Delivery Options"
                            options={this.deliveryOptions}
                            value={this.delivery}
                            onChange={(value) => this.setState({delivery: value})}
                        />
                        <TextBlock size="small"
                            subdued
                            role='description'
                            appearance='subdued'
                        >
                            Deliver to your consumers every 'X' number of periods
                        </TextBlock>
                    </StackItem>

                    <StackItem>
                        <TextField
                            label="Subscription Offer Name"
                            value={this.planTitle}
                            onChange={(value) => this.setState({planTitle: value})}
                        />
                        <Text size="extraSmall"
                            subdued
                            role='description'
                            appearance='subdued'
                        >
                            The Subscription Offer Name will be displayed to consumers on the product display page.
                        </Text>
                    </StackItem>
                </InlineStack>

            </CardSection>

            <CardSection title="Delivery and discount" sectioned>
                <InlineStack>
                    <TextField
                        type="number"
                        label="Delivery frequency (in weeks)"
                        value={this.deliveryFrequency}
                        onChange={(value) => this.setState({deliveryFrequency: value})}
                    />
                    <TextField
                        type="number"
                        label="Percentage off (%)"
                        value={this.percentageOff}
                        onChange={(value) => this.setState({percentageOff: value})}
                    />
                </InlineStack>
            </CardSection>
          </Card>
        );
    }
}

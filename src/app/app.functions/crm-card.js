const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { event } = context;

  const { hs_ticket_id, shipping } = context.propertiesToSend;

  const hs = new hubspot.Client({
    accessToken: context.secrets.PRIVATE_APP_ACCESS_TOKEN
  });

  if (event && event.type === 'SUBMIT') {
    const { product_name, ship_date } = event.payload.formState;

    const ticketObj = {
      properties: {
        product_name,
        shipping: 'expedited',
        ship_date,
      },
    }

    try {
      await hs.crm.tickets.basicApi.update(hs_ticket_id, ticketObj);

      sendResponse({
        message: {
          type: 'SUCCESS',
          body: `Request submitted. Creating deal for ${product_name}.`,
        },
      });
    } catch (error) {
      console.log("API error: ", error.message)
      sendResponse({
        message: {
          type: 'ERROR',
          body: `Request failed for ${product_name}.`,
        },
      });
    }
  }

  sendResponse({
    sections: [
      {
        type: 'text',
        text: "To request expedited shipping, fill out the form below.",
      },
      {
        type: 'form',
        content: [
          {
            type: 'input',
            name: 'product_name',
            inputType: 'text',
            label: 'Product name',
            readonly: true,
            initialValue: 'Credit card reader',
          },
          {
            type: 'input',
            name: 'ship_date',
            inputType: 'text',
            label: 'Ship by date',
            readonly: shipping === 'expedited',
            initialValue: '',
          },
          {
            type: 'button',
            text: 'Submit request',
            disabled: shipping === 'expedited',
            onClick: {
              type: 'SUBMIT',
              serverlessFunction: 'crm-card',
            },
          },
        ],
      },
    ],
  });
};

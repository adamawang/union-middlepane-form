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
      const updateRequest = await hs.crm.tickets.basicApi.update(hs_ticket_id, ticketObj);
      console.log("update request here: ", updateRequest)
      sendResponse({
        message: {
          type: 'SUCCESS',
          body: `Request submitted for ${product_name}.`,
        },
      });
    } catch (error) {
      console.log("error: ", error)
      sendResponse({
        message: {
          type: 'ERROR',
          body: `Request failed for ${product_name}. Error: ${error.message}`,
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
            readonly: shipping === 'expedited',
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

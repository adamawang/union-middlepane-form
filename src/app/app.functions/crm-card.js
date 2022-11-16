const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { event } = context;

  const { hs_contact_id, notes_last_contacted } = context.propertiesToSend;

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
      await hs.crm.tickets.basicApi.update(hs_contact_id, ticketObj);

      sendResponse({
        message: {
          type: 'SUCCESS',
          body: `Request submitted. Creating deal for ${product_name}.`,
        },
      });
    } catch (error) {

      sendResponse({
        message: {
          type: 'ERROR',
          body: `Request failed for ${product_name}.`,
        },
      });
    }
  }

  const lastContactDate = new Date(notes_last_contacted);
  const today = new Date();
  const dayInMs = 1000 * 60 * 60 * 24;
  const days = 0;
  const showVipCustomerAlert = lastContactDate.getTime() <= new Date(today.getTime() - (days * dayInMs)).getTime();

  const vipCustomerAlert = [
    {
      type: 'alert',
      title: "Outreach for VIP customer",
      body: "It's been 10+ days since we've last contacted this customer. Send a follow-up email.",
      variant: "error"
    },
    {
      type: 'divider',
      distance: 'medium',
    },
  ];

  const header = showVipCustomerAlert ? [...vipCustomerAlert] : [];

  sendResponse({
    sections: [
      ...header,
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
            initialValue: 'Credit card reader',
          },
          {
            type: 'input',
            name: 'ship_date',
            inputType: 'text',
            label: 'Ship by date',
            readonly: false,
            initialValue: '',
          },
          {
            type: 'button',
            text: 'Submit request',
            disabled: false,
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

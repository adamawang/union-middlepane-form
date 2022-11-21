const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { event } = context;

  const { hs_object_id, notes_last_contacted, firstname, lastname } = context.propertiesToSend;

  const hs = new hubspot.Client({
    accessToken: context.secrets.PRIVATE_APP_ACCESS_TOKEN
  });

  const today = new Date();
  const dayInMs = 1000 * 60 * 60 * 24;
  const days = 4;
  const showVipCustomerAlert = notes_last_contacted <= new Date(today.getTime() - (days * dayInMs)).getTime();

  const vipCustomerAlert = showVipCustomerAlert ? [
    {
      type: 'alert',
      title: "VIP customer",
      body: "This customer belongs to Union's VIP program.",
      variant: "error"
    },
    {
      type: 'divider',
      distance: 'medium',
    },
  ] : [];

  const header = [
    {
      type: 'heading',
      text: 'Expedited Shipping Request Form'
    },
  ]

  const sections = [
    ...vipCustomerAlert,
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
  ]

  if (event && event.type === 'SUBMIT') {
    const { product_name, ship_date } = event.payload.formState;

    const dealObj = {
      properties: {
        dealname: `${product_name} for ${firstname} ${lastname}`,
        closedate: new Date(ship_date).getTime(),
      },
    }

    try {
      const createDealResponse = await hs.crm.deals.basicApi.create(dealObj);
      const contactAssociationsResponse = await hs.crm.contacts.associationsApi.getAll(hs_object_id, 'companies')

      await hs.crm.deals.associationsApi.create(
        createDealResponse.id,
        'contacts',
        hs_object_id,
        'deal_to_contact',
      )

      await hs.crm.deals.associationsApi.create(
        createDealResponse.id,
        'companies',
        contactAssociationsResponse.results[0].id,
        'deal_to_company',
      )


      sendResponse({
        message: {
          type: 'SUCCESS',
          body: `Request successful. Deal created for ${product_name}.`,
        },
      });
    } catch (error) {
      console.log("error in api: ", error.message)
      return sendResponse({
        message: {
          type: 'ERROR',
          body: `Request failed for ${product_name}.`,
        },
      });
    }
  }

  sendResponse({
    sections,
  });
};

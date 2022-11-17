const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { event } = context;

  const { hs_object_id, notes_last_contacted, firstname, lastname } = context.propertiesToSend;

  const hs = new hubspot.Client({
    accessToken: context.secrets.PRIVATE_APP_ACCESS_TOKEN
  });

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

  const successComponent = [
    {
      type: 'text',
      text: "Thank you for submitting your request.",
    },
  ]

  const failureComponent = [
    {
      type: 'text',
      text: "Unable to submit your request.",
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
      console.log('create deal response: ', createDealResponse)
      const contactAssociationsResponse = await hs.crm.contacts.associationsApi.getAll(hs_object_id, 'companies')

      console.log('contact assoc: ', contactAssociationsResponse);

      const dealAssociationResponse1 = await hs.crm.deals.associationsApi.create(
        createDealResponse.id,
        'contacts',
        hs_object_id,
        'deal_to_contact',
      )
      console.log("created first one: ", dealAssociationResponse1)
      const dealAssociationResponse2 = await hs.crm.deals.associationsApi.create(
        createDealResponse.id,
        'companies',
        contactAssociationsResponse.results[0].id,
        'deal_to_company',
      )
      console.log("created second one: ", dealAssociationResponse2)

      sendResponse({
        message: {
          type: 'SUCCESS',
          body: `Request successful. Deal created for ${product_name}.`,
        },
        sections: [...vipCustomerAlert, ...header, ...successComponent]
      });
    } catch (error) {
      console.log("error in api: ", error.message)
      sendResponse({
        message: {
          type: 'ERROR',
          body: `Request failed for ${product_name}.`,
        },
        sections: [...vipCustomerAlert, ...header, ...failureComponent]
      });
    }
  }

  const lastContactDate = new Date(notes_last_contacted);
  const today = new Date();
  const dayInMs = 1000 * 60 * 60 * 24;
  const days = 0;
  const showVipCustomerAlert = lastContactDate.getTime() <= new Date(today.getTime() - (days * dayInMs)).getTime();

  sendResponse({
    sections,
  });
};

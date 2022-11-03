exports.main = async (context, sendResponse) => {
  const { event } = context;

  if (event && event.type === 'SUBMIT') {
    const { product_name,  } = event.payload.formState;
    sendResponse({
      message: {
        type: 'SUCCESS',
        body: `Request was successful. Deal created for ${product_name}`,
      },
    });
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
            initialValue: '',
          },
          {
            type: 'input',
            name: 'ship_date',
            inputType: 'text',
            label: 'Ship by date',
            initialValue: '',
          },
          {
            type: 'button',
            text: 'Submit request',
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

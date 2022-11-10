const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { event } = context;

  if (event && event.type === 'SUBMIT') {

    sendResponse({
      message: {
        type: 'SUCCESS',
        body: `Success!`,
      },
    });
  }

  sendResponse({
    sections: [
      {
        type: 'text',
        text: "Form example",
      },
      {
        type: 'form',
        content: [
          {
            type: 'input',
            name: 'name',
            inputType: 'text',
            label: 'Name',
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

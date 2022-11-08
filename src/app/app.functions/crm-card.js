exports.main = async (context = {}, sendResponse) => {
  sendResponse({
    sections: [
      {
        type: 'text',
        text: "This example displays a simple form with a text input and a submit button. Inputting data into the field and clicking the submit button shows a banner with the user's input.",
      },
      {
        type: 'form',
        content: [
          {
            type: 'input',
            name: 'example_input',
            inputType: 'text',
            label: 'Example input field',
            initialValue: 'Default value of the input field',
          },
          {
            type: 'button',
            text: 'Submit form',
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

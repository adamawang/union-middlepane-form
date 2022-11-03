exports.main = async (context, sendResponse) => {
  const { event } = context;

  if (event && event.type === 'SUBMIT') {
    const { product_name,  } = event.payload.formState;
    sendResponse({
      message: {
        type: 'SUCCESS',
        body: `Request processed for ${product_name}.`,
      },
    });
  }

  sendResponse({
    sections: [
      {
        type: 'text',
        text: "Sample card",
      },
    ],
  });
};

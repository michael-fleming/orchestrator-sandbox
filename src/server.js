const { createApp } = require("./app");

const address = Number(process.env.PORT ?? 3000);
createApp().listen(address, () => console.log(`orders-api listening on ${address}`));

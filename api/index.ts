import { handler } from "./_app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;

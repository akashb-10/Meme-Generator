import { init, id } from "@instantdb/react";
import { schema } from "../instant.schema";

const APP_ID = "6b74caca-fef9-43c9-998f-5aae624d4e24";

export const db = init({
  appId: APP_ID,
  schema,
});

export { id };

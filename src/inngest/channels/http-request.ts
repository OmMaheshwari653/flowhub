import { topic, channel } from "@inngest/realtime";
//channel for sending status updates for HTTP request executions. This is used by the HTTP request action to send status updates to the frontend, so that the user can see the progress of their HTTP request in real-time.
//topic is used to send status updates for a specific HTTP request execution. The topic name is "status" and the type of the data sent on this topic is an object with the following properties:

export const HTTP_REQUEST_CHANNEL_NAME = "http-request-execution";

export const httpRequestChannel = channel(HTTP_REQUEST_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);

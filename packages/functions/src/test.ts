import {Resource} from "sst";
import {Example} from "@vbdhub/core/example";
import middy from "@middy/core";
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler} from "aws-lambda";

const rawHandler: Handler<
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2<string>> = async (event): Promise<APIGatewayProxyResultV2<string>> => {
    return {
        statusCode: 200,
        body: `${Example.hello()} Linked to ${Resource.MyBucket.name}.`,
    };
};

export const handler = middy(rawHandler)
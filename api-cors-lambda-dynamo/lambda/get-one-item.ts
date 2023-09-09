import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any) => {
	const { itemId } = event.pathParameters;
	if (!itemId) {
		throw new Error('itemId is required');
	}
	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: itemId,
		}
	}

	try {
		const response = await db.get(params).promise();
		if (response.Item) {
			return {
				statusCode: 200,
				body: JSON.stringify(response.Item)
			}
		}
		return {
			statusCode: 404,
		}
	} catch (err) {
		return {
			statusCode: 500,
			body: JSON.stringify(err)
		}
	}
};
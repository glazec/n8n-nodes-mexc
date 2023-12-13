import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';
import * as MexcApi from 'mexc-api-sdk';

async function trade(
	symbol: string,
	side: string,
	type: string,
	timeInForce: string,
	quantity: number,
	price: number,
	apiKey: string,
	apiSecret: string,
) {
	const client = new MexcApi.Spot(apiKey, apiSecret);
	// const symbolInfo = await client.exchangeInfo(symbol);
	const options = {
		timeInForce,
		quantity,
		price,
	};
	const result = await client.newOrder(symbol, side, type, options);
	return result;
}
export class Mexc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mexc ',
		name: 'Mexc',
		icon: 'file:mexc-logo.svg',
		group: ['utility'],
		version: 1,
		description: 'Trade on Mexc',
		defaults: {
			name: 'Mexc',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mexcApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Token Trading Pair',
				name: 'symbol',
				type: 'string',
				default: 'BTCUSDT',
				required: true,
				description: 'The token trading pair on Binance',
			},
			{
				displayName: 'Trade Side',
				name: 'side',
				type: 'options',
				default: 'BUY',
				options: [
					{ name: 'Buy', value: 'BUY' },
					{ name: 'Sell', value: 'SELL' },
				],
			},
			{
				displayName: 'Order Type',
				name: 'type',
				type: 'options',
				default: 'LIMIT',
				options: [
					{ name: 'Limit', value: 'LIMIT' },
					// { name: 'Market', value: 'MARKET' },
				],
			},
			{
				displayName: 'Time in Force',
				name: 'timeInForce',
				type: 'options',
				default: 'GTC',
				options: [
					{ name: 'Good Till Cancel', value: 'GTC' },
					{ name: 'Immediate or Cancel', value: 'IOC' },
					{ name: 'Fill or Kill', value: 'FOK' },
				],
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
				description: 'The quantity of the order',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 1,
				description: 'The price of the order',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const apiKey: string = (await this.getCredentials('mexcApi')).mexcApiKey as string;
		const secretKey: string = (await this.getCredentials('mexcApi')).mexcSecretKey as string;
		const items = this.getInputData();
		const returnData = [];

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let i = 0; i < items.length; i++) {
			try {
				const data: IDataObject = {
					symbol: (this.getNodeParameter('symbol', i) as string).toUpperCase(),
					side: this.getNodeParameter('side', i) as string,
					type: this.getNodeParameter('type', i) as string,
					timeInForce: this.getNodeParameter('timeInForce', i) as string,
					quantity: this.getNodeParameter('quantity', i) as number,
					price: this.getNodeParameter('price', i) as number,
				};
				Object.assign(data);
				let orderResult = await trade(
					data.symbol as string,
					data.side as string,
					data.type as string,
					data.timeInForce as string,
					data.quantity as number,
					data.price as number,
					apiKey,
					secretKey,
				);
				returnData.push({
					json: orderResult,
				});
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}

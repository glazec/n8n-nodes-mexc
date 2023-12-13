import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MexcApi implements ICredentialType {
	name = 'mexcApi';
	displayName = 'MEXC API';
	documentationUrl = 'https://github.com/glazec/n8n-nodes-mexc';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'mexcApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API Key for MEXC',
		},
		{
			displayName: 'Secret Key',
			name: 'mexcSecretKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API Seceret for MEXC',
		},
	];
}

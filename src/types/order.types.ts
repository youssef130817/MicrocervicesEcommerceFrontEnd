export interface OrderItem {
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
}

export interface ShippingAddress {
	fullName: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phoneNumber: string;
}

export interface Order {
	status: number;
	totalAmount: number;
	items: OrderItem[];
	shippingAddress: ShippingAddress;
}

export interface CreateOrderResponse {
	id: string;
	status: number;
	message?: string;
}

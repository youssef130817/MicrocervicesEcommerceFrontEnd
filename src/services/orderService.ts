import { api } from "./api";

export interface OrderItem {
	productId: string;
	productName: string;
	unitPrice: number;
	quantity: number;
	imageUrl?: string;
}

export interface ShippingAddress {
	fullName: string;
	street: string;
	city: string;
	zipCode: string;
	phoneNumber: string;
}

export interface CreateOrderRequest {
	cartItems: OrderItem[];
	shippingAddress: Omit<ShippingAddress, "fullName" | "country">;
	paymentMethod: "card" | "à la livraison";
}

interface OrderApiRequest {
	status: number;
	totalAmount: number;
	items: OrderItem[];
	shippingAddress: ShippingAddress;
}

export interface Order {
	id: string;
	status: "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
	totalAmount: number;
	createdAt: string;
	updatedAt: string;
	items: OrderItem[];
	shippingAddress: ShippingAddress;
}

export interface OrdersResponse {
	orders: Order[];
	pagination: {
		currentPage: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	};
}

export interface TrackingInfo {
	id: string;
	status: string;
	trackingNumber: string;
	updatedAt: string;
}

export const orderService = {
	createOrder: (orderRequest: CreateOrderRequest) => {
		// Calculer le montant total
		const totalAmount = orderRequest.cartItems.reduce(
			(total, item) => total + item.unitPrice * item.quantity,
			0
		);

		// Transformer au format attendu par l'API
		const apiRequest: OrderApiRequest = {
			status: 0,
			totalAmount,
			items: orderRequest.cartItems,
			shippingAddress: {
				...orderRequest.shippingAddress,
				fullName: "Client", // À remplacer par le vrai nom quand disponible
			},
		};

		console.log(
			"orderService createOrder called with:",
			JSON.stringify(apiRequest, null, 2)
		);
		return api.post<Order>("/orders", apiRequest);
	},

	getOrders: (params?: { page?: number; pageSize?: number; status?: string }) =>
		api.get<OrdersResponse>("/orders", { params }),

	getOrder: (id: string) => api.get<Order>(`/orders/${id}`),

	cancelOrder: (id: string) =>
		api.put<{ message: string }>(`/orders/${id}/cancel`),

	getOrderTracking: (id: string) =>
		api.get<TrackingInfo>(`/orders/${id}/tracking`),
};

import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import defaultProductImage from "@/assets/default-product.svg";
import { useCart } from "@/hooks/useCart";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productService } from "@/services";
import { getImageUrl } from "@/utils/imageUtils";
import { orderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useState } from "react";
import { CreateOrderRequest } from "@/services/orderService";

export default function Cart() {
	const {
		cart,
		isLoading: cartLoading,
		updateQuantity,
		removeItem,
		clearCart,
	} = useCart();
	const { toast } = useToast();
	const navigate = useNavigate();

	const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
	const [shippingAddress, setShippingAddress] = useState({
		street: "",
		city: "",
		state: "",
		zipCode: "",
		phoneNumber: "",
	});

	const { data: products, isLoading: productsLoading } = useQuery({
		queryKey: ["cartProducts", cart.items],
		queryFn: async () => {
			const productPromises = cart.items.map(async (item) => {
				const response = await productService.getProduct(item.productId);
				return {
					...response.data,
					cartItemId: item.id,
					productId: item.productId,
					quantity: item.quantity,
				};
			});
			return Promise.all(productPromises);
		},
		enabled: cart.items.length > 0,
	});

	const createOrder = useMutation({
		mutationFn: async (orderRequest: CreateOrderRequest) => {
			try {
				const { street, city, state, zipCode, phoneNumber } =
					orderRequest.shippingAddress;
				if (!street || !city || !state || !zipCode || !phoneNumber) {
					throw new Error(
						"Veuillez remplir tous les champs de l'adresse de livraison"
					);
				}

				const response = await orderService.createOrder(orderRequest);
				console.log(
					"Order creation response:",
					JSON.stringify(response.data, null, 2)
				);
				return response.data;
			} catch (error) {
				console.error("Order creation error:", error);
				if (error.response) {
					console.error("Error response:", {
						status: error.response.status,
						data: error.response.data,
					});
				}
				throw error;
			}
		},
		onSuccess: () => {
			toast({
				title: "Commande passée avec succès",
				description: "Merci pour votre achat !",
			});
			setIsCheckoutModalOpen(false);
			clearCart.mutate();
			navigate("/products");
		},
		onError: (error) => {
			console.error("Mutation error handler:", error);
			toast({
				title: "Erreur",
				description:
					error.message || "Échec de la commande. Veuillez réessayer.",
				variant: "destructive",
			});
		},
	});

	const handleQuantityChange = (itemId: string, newQuantity: number) => {
		const product = products?.find((p) => p.cartItemId === itemId);
		if (!product) return;

		if (newQuantity < 1) {
			removeItem.mutate(product.productId);
			return;
		}
		updateQuantity.mutate({
			productId: product.productId,
			quantity: newQuantity,
		});
	};

	const handleRemoveItem = (itemId: string) => {
		const product = products?.find((p) => p.cartItemId === itemId);
		if (!product) return;
		removeItem.mutate(product.productId);
	};

	const handleCheckout = () => {
		setIsCheckoutModalOpen(true);
	};

	const handlePlaceOrder = () => {
		if (!shippingAddress) {
			toast.error("Please provide shipping address");
			return;
		}

		const orderRequest: CreateOrderRequest = {
			cartItems: products.map((product) => ({
				productId: product.id,
				productName: product.name,
				unitPrice: product.price,
				quantity: product.quantity,
				imageUrl: product.imageUrl,
			})),
			shippingAddress: {
				street: shippingAddress.street,
				city: shippingAddress.city,
				state: shippingAddress.state,
				zipCode: shippingAddress.zipCode,
				phoneNumber: shippingAddress.phoneNumber,
			},
			paymentMethod: "à la livraison",
		};

		createOrder.mutate(orderRequest);
	};

	const isLoading = cartLoading || productsLoading;

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 py-8">
					<div className="container">
						<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-40 bg-gray-200 rounded-lg mb-4" />
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
									<div className="h-4 bg-gray-200 rounded w-1/2" />
								</div>
							))}
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (!cart.items || cart.items.length === 0) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1 py-8">
					<div className="container">
						<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
						<div className="text-center py-12">
							<p className="text-gray-500 mb-4">Your cart is empty</p>
							<Button asChild>
								<Link to="/products">Continue Shopping</Link>
							</Button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-8">
				<div className="container">
					<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<div className="space-y-4">
								{products?.map((product) => (
									<Card key={product.productId}>
										<CardContent className="flex gap-4 p-4">
											<div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
												{product.images && product.images.length > 0 ? (
													<img
														src={getImageUrl(product.images[0].imageUrl)}
														alt={product.name}
														className="w-full h-full object-cover"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.src = defaultProductImage;
														}}
													/>
												) : (
													<img
														src={defaultProductImage}
														alt={product.name}
														className="w-full h-full object-cover"
													/>
												)}
											</div>
											<div className="flex-1">
												<Link
													to={`/products/${product.productId}`}
													className="font-medium hover:underline">
													{product.name}
												</Link>
												<p className="text-sm text-gray-500 mt-1">
													{product.price} MAD
												</p>
												<div className="flex items-center gap-4 mt-2">
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="icon"
															className="h-8 w-8"
															onClick={() =>
																handleQuantityChange(
																	product.cartItemId,
																	product.quantity - 1
																)
															}>
															-
														</Button>
														<Input
															type="number"
															min="1"
															value={product.quantity}
															onChange={(e) =>
																handleQuantityChange(
																	product.cartItemId,
																	parseInt(e.target.value) || 1
																)
															}
															className="w-16 h-8 text-center"
														/>
														<Button
															variant="outline"
															size="icon"
															className="h-8 w-8"
															onClick={() =>
																handleQuantityChange(
																	product.cartItemId,
																	product.quantity + 1
																)
															}>
															+
														</Button>
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="text-red-500 hover:text-red-600"
														onClick={() =>
															handleRemoveItem(product.cartItemId)
														}>
														Remove
													</Button>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium">
													{product.price * product.quantity} MAD
												</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
						<div>
							<Card>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
									<CardDescription>
										Review your order before proceeding to checkout
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>
											{products?.reduce(
												(total, product) =>
													total + product.price * product.quantity,
												0
											)}{" "}
											MAD
										</span>
									</div>
									<div className="flex justify-between font-bold">
										<span>Total</span>
										<span>
											{products?.reduce(
												(total, product) =>
													total + product.price * product.quantity,
												0
											)}{" "}
											MAD
										</span>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col gap-4">
									<Button className="w-full" size="lg" onClick={handleCheckout}>
										Proceed to Checkout
									</Button>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => clearCart.mutate()}>
										Clear Cart
									</Button>
								</CardFooter>
							</Card>
						</div>
					</div>
				</div>
			</main>
			<CheckoutModal
				open={isCheckoutModalOpen}
				onClose={() => setIsCheckoutModalOpen(false)}
				onSubmit={(shippingAddress) => {
					setShippingAddress(shippingAddress);
					handlePlaceOrder();
				}}
				isLoading={createOrder.isPending}
			/>
		</div>
	);
}

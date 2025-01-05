import { useState } from "react";
import { OrderService } from "../services/order.service";

export const OrderForm = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Exemple de données (à remplacer par les vraies données du panier)
	const exampleCartRequest = {
		cartItems: [
			{
				productId: "6773c310b60ca7c6aebcc462",
				productName: "iphone 14",
				unitPrice: 14999.99,
				quantity: 2,
			},
		],
		shippingAddress: {
			street: "Riad salam 111",
			city: "Mohammedia",
			state: "test",
			zipCode: "23550",
			phoneNumber: "0767458578",
		},
		paymentMethod: "à la livraison",
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await OrderService.createOrder(exampleCartRequest);
			console.log("Données de la commande créée:", response);
			setSuccess("Commande créée avec succès!");

			// Rediriger vers la page de confirmation ou afficher un message de succès
		} catch (err) {
			setError(err instanceof Error ? err.message : "Une erreur est survenue");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Passer une commande</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
					{success}
				</div>
			)}

			<div className="mb-4">
				<h3 className="font-bold mb-2">Détails de la commande :</h3>
				<pre className="bg-gray-100 p-4 rounded">
					{JSON.stringify(exampleCartRequest, null, 2)}
				</pre>
			</div>

			<button
				onClick={handleSubmit}
				disabled={loading}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				{loading ? "Envoi en cours..." : "Passer la commande"}
			</button>
		</div>
	);
};

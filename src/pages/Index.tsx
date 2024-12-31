import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { productService } from "@/services";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cart";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

interface Product {
	id: string;
	name: string;
	price: number;
	image?: string;
	category?: {
		id: string;
		name: string;
	};
}

export default function Index() {
	const { data } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const response = await productService.getAllProducts({});
			return response.data;
		},
	});

	const products = data?.products || [];
	const { toast } = useToast();
	const addItem = useCartStore((state) => state.addItem);
	const { cart } = useCart();

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1">
				<section className="py-24 bg-gradient-to-b from-white to-gray-50">
					<div className="container">
						<div className="text-center space-y-4">
							<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
								Bienvenue sur <span className="text-primary">MyStore</span>
							</h1>
							<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
								Découvrez notre collection de produits premium.
							</p>
							<div className="flex justify-center gap-4">
								<Button asChild size="lg">
									<Link to="/products" className="px-8">
										Acheter Maintenant
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

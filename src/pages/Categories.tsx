import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { productService } from "@/services";
import { Header } from "@/components/layout/Header";

interface Category {
	id: string;
	name: string;
	description: string;
	productCount?: number;
}

export default function Categories() {
	const { data: categories, isLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			try {
				const response = await productService.getCategories();
				console.log("Categories response:", response.data);
				return response.data;
			} catch (error) {
				console.error("Error fetching categories:", error);
				return [];
			}
		},
	});

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-8">
				<div className="container">
					<h1 className="text-3xl font-bold mb-8">Catégories</h1>
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
									<div className="h-4 bg-gray-200 rounded w-1/2" />
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{!categories?.length ? (
								<div className="col-span-full text-center py-12">
									<p className="text-gray-500">Aucune catégorie trouvée</p>
								</div>
							) : (
								categories.map((category: Category) => (
									<Link
										key={category.id}
										to={`/products?category=${encodeURIComponent(
											category.name
										)}`}
										className="block group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
										<div>
											<h2 className="text-lg font-medium text-gray-900">
												{category.name}
											</h2>
											{category.description && (
												<p className="mt-2 text-sm text-gray-500">
													{category.description}
												</p>
											)}
											{category.productCount !== undefined && (
												<p className="mt-2 text-sm text-primary">
													{category.productCount}{" "}
													{category.productCount === 1 ? "produit" : "produits"}
												</p>
											)}
										</div>
									</Link>
								))
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { productService, type ProductFilters } from "@/services";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/utils/imageUtils";
import defaultProductImage from "@/assets/default-product.svg";
import { useMemo, useState, useEffect } from "react";

export default function Products() {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = Number(searchParams.get("page")) || 1;
	const pageSize = Number(searchParams.get("pageSize")) || 12;
	const category = searchParams.get("category") || "";
	const search = searchParams.get("search") || "";
	const sortBy = searchParams.get("sortBy") || "";
	const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";
	const minPrice = Number(searchParams.get("minPrice")) || 1000;
	const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;

	useEffect(() => {
		if (!searchParams.has("minPrice")) {
			setSearchParams((prev) => {
				prev.set("minPrice", "1000");
				return prev;
			});
		}
	}, []);

	const { data, isLoading } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			try {
				const response = await productService.getAllProducts({});
				console.log("API Response:", response.data);
				return response.data;
			} catch (error) {
				console.error("Error fetching products:", error);
				throw error;
			}
		},
	});

	const filteredAndSortedProducts = useMemo(() => {
		if (!data?.products) return [];

		let filtered = data.products.filter((product) => {
			const matchesSearch = search
				? product.name.toLowerCase().includes(search.toLowerCase()) ||
				  product.category?.name.toLowerCase().includes(search.toLowerCase())
				: true;

			const matchesPrice =
				product.price >= minPrice &&
				(maxPrice === Infinity || product.price <= maxPrice);

			const matchesCategory = category
				? product.category?.name.toLowerCase() ===
				  decodeURIComponent(category).toLowerCase()
				: true;

			return matchesSearch && matchesPrice && matchesCategory;
		});

		// Tri des produits
		if (sortBy && sortOrder) {
			filtered.sort((a, b) => {
				let comparison = 0;
				if (sortBy === "name") {
					comparison = a.name.localeCompare(b.name);
				} else if (sortBy === "price") {
					comparison = a.price - b.price;
				}
				return sortOrder === "asc" ? comparison : -comparison;
			});
		}

		return filtered;
	}, [data?.products, search, minPrice, maxPrice, category, sortBy, sortOrder]);

	// Pagination côté client
	const paginatedProducts = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredAndSortedProducts.slice(startIndex, endIndex);
	}, [filteredAndSortedProducts, currentPage, pageSize]);

	// Calcul du nombre total de pages
	const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize);

	const { toast } = useToast();
	const { addToCart } = useCart();

	const handleAddToCart = (product: any) => {
		addToCart.mutate({
			productId: product.id,
			quantity: 1,
		});
	};

	const handleSearch = (value: string) => {
		setSearchParams((prev) => {
			if (value) {
				prev.set("search", value);
			} else {
				prev.delete("search");
			}
			prev.set("page", "1");
			return prev;
		});
	};

	const handlePriceFilter = (min: number, max: number) => {
		setSearchParams((prev) => {
			prev.set("minPrice", min.toString());
			if (max !== Infinity) {
				prev.set("maxPrice", max.toString());
			} else {
				prev.delete("maxPrice");
			}
			prev.set("page", "1");
			return prev;
		});
	};

	const handleSort = (value: string) => {
		const [sortBy, sortOrder] = value.split("-");
		setSearchParams((prev) => {
			if (sortBy && sortOrder) {
				prev.set("sortBy", sortBy);
				prev.set("sortOrder", sortOrder);
			} else {
				prev.delete("sortBy");
				prev.delete("sortOrder");
			}
			return prev;
		});
	};

	const handlePageChange = (page: number) => {
		setSearchParams((prev) => {
			prev.set("page", page.toString());
			return prev;
		});
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 py-8">
				<div className="container">
					<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
						<h1 className="text-3xl font-bold">Tous les Produits</h1>
						<div className="flex gap-4 w-full md:w-auto">
							<Input
								placeholder="Rechercher des produits..."
								value={search}
								onChange={(e) => handleSearch(e.target.value)}
								className="max-w-xs"
							/>
							<Select
								value={sortBy && sortOrder ? `${sortBy}-${sortOrder}` : ""}
								onValueChange={handleSort}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Trier par..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name-asc">Nom (A-Z)</SelectItem>
									<SelectItem value="name-desc">Nom (Z-A)</SelectItem>
									<SelectItem value="price-asc">Prix (Croissant)</SelectItem>
									<SelectItem value="price-desc">Prix (Décroissant)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="mb-6 flex gap-4">
						<Select
							value={`${minPrice}-${maxPrice}`}
							onValueChange={(value) => {
								const [min, max] = value.split("-").map(Number);
								handlePriceFilter(min, max);
							}}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Filtrer par prix" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0-1000">Moins de 1000 MAD</SelectItem>
								<SelectItem value="1000-5000">1000 - 5000 MAD</SelectItem>
								<SelectItem value="5000-10000">5000 - 10000 MAD</SelectItem>
								<SelectItem value="10000-Infinity">
									Plus de 10000 MAD
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{[...Array(12)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="aspect-square bg-gray-200 rounded-lg mb-4" />
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
									<div className="h-4 bg-gray-200 rounded w-1/2" />
								</div>
							))}
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{!paginatedProducts.length ? (
									<div className="col-span-full text-center py-12">
										<p className="text-gray-500">Aucun produit trouvé</p>
									</div>
								) : (
									paginatedProducts.map((product) => (
										<div key={product.id} className="group">
											<Link to={`/products/${product.id}`}>
												<div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
													<img
														src={getImageUrl(product.images[0]?.imageUrl)}
														alt={product.name}
														className="h-full w-full object-cover object-center hover:opacity-75"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.src = defaultProductImage;
														}}
													/>
												</div>
												<div className="mt-4">
													<h3 className="text-sm font-medium text-gray-900">
														{product.name}
													</h3>
													<p className="mt-1 text-sm text-gray-500">
														{product.category?.name}
													</p>
													<p className="mt-1 text-sm font-medium text-gray-900">
														{product.price} MAD
													</p>
												</div>
											</Link>
											<Button
												className="w-full"
												onClick={() => handleAddToCart(product)}>
												Ajouter au panier
											</Button>
										</div>
									))
								)}
							</div>

							{totalPages > 1 && (
								<div className="mt-8 flex justify-center gap-2">
									<Button
										variant="outline"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}>
										Précédent
									</Button>
									{[...Array(totalPages)].map((_, i) => (
										<Button
											key={i + 1}
											variant={currentPage === i + 1 ? "default" : "outline"}
											onClick={() => handlePageChange(i + 1)}>
											{i + 1}
										</Button>
									))}
									<Button
										variant="outline"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}>
										Suivant
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</main>
		</div>
	);
}

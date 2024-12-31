import { Link } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

export function Header() {
	const items = useCartStore((state) => state.items);
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<Button variant="ghost" size="icon" className="md:hidden">
					<Menu className="h-6 w-6" />
				</Button>
				<div className="flex flex-1">
					<Link to="/" className="font-heading text-xl font-bold">
						MyStore
					</Link>
					<nav className="mx-6 hidden items-center space-x-4 md:flex lg:space-x-6">
						<Link
							to="/categories"
							className="text-sm font-medium transition-colors hover:text-primary">
							Catégories
						</Link>
					</nav>
				</div>
				<div className="flex items-center space-x-4">
					<Link to="/cart">
						<Button variant="ghost" size="icon" className="relative">
							<ShoppingCart className="h-6 w-6" />
							{itemCount > 0 && (
								<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
									{itemCount}
								</span>
							)}
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}

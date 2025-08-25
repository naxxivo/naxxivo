import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { ProductWithCategory, Category } from '../types';
import ProductCard from './ProductCard';
import { useCart } from '../hooks/useCart';

const NaxStoreLogo: React.FC = () => (
    <h1 className="text-2xl font-bold tracking-tighter text-white">
        Nax<span className="text-gray-800">Store</span>
    </h1>
);

const SearchIcon: React.FC = () => <i className="fas fa-search text-gray-500"></i>;
const BellIcon: React.FC = () => <i className="fas fa-bell text-gray-800 text-lg"></i>;
const UserIcon: React.FC = () => <i className="fas fa-user-circle text-gray-800 text-2xl"></i>;
const LogoutIcon: React.FC = () => <i className="fas fa-sign-out-alt text-gray-500 group-hover:text-red-500"></i>;
const AdminIcon: React.FC = () => <i className="fas fa-cog text-gray-800 text-lg"></i>;
const CartIcon: React.FC = () => <i className="fas fa-shopping-cart text-gray-800 text-lg"></i>;

interface HeaderProps {
    onNavigateToProfile: () => void;
    onNavigateToAdmin: () => void;
    onNavigateToCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToProfile, onNavigateToAdmin, onNavigateToCart }) => {
    const { user, profile, signOut } = useAuth();
    const { cartItems } = useCart();
    
    const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <header className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-500 z-10 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <NaxStoreLogo />
                    
                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                className="block w-full bg-white/80 text-gray-800 placeholder-gray-500 border-transparent rounded-full py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-3">
                        {profile?.is_admin && (
                            <button onClick={onNavigateToAdmin} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Admin Panel">
                                <AdminIcon />
                            </button>
                        )}
                        <button onClick={onNavigateToCart} className="relative p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Shopping Cart">
                            <CartIcon />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                         <button className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Notifications">
                            <BellIcon />
                        </button>
                        <div className="relative group">
                            <button onClick={onNavigateToProfile} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Profile">
                                <UserIcon />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block animate-fade-in-up" style={{animationDuration: '0.2s'}}>
                                <div className="px-4 py-2 text-sm text-gray-700">Signed in as</div>
                                <div className="px-4 pb-2 text-sm font-semibold text-gray-800 max-w-[150px] truncate" title={user?.email}>{profile?.name || user?.email}</div>
                                <div className="border-t border-gray-100"></div>
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); signOut(); }} className="group flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-red-50 hover:text-red-600">
                                    <LogoutIcon />
                                    <span className="ml-2">Logout</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to load categories.');
    }
    return data;
};

interface CategoriesNavProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (categoryName: string) => void;
    isLoading: boolean;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ categories, activeCategory, onSelectCategory, isLoading }) => {
    const allCategories = [{ id: 'all-cat-id', name: 'All' } as Category, ...categories];

    if (isLoading) {
        return (
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-3 animate-pulse">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </nav>
        );
    }
    
    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-3">
                    {allCategories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.name)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                activeCategory === category.name
                                    ? 'bg-yellow-100 text-yellow-800 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

const ProductGridSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse mb-3"></div>
                    <div className="h-7 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
        ))}
    </div>
);

const fetchProducts = async (): Promise<ProductWithCategory[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to load products. Please try again later.');
    }
    return data as ProductWithCategory[];
};


interface HomeProps {
    onNavigateToProfile: () => void;
    onNavigateToAdmin: () => void;
    onNavigateToCart: () => void;
    onNavigateToCheckout: (productId: string) => void;
    onNavigateToDetail: (productId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToProfile, onNavigateToAdmin, onNavigateToCart, onNavigateToCheckout, onNavigateToDetail }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    
    const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
    
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (activeCategory === 'All') return products;
        return products.filter(product => product.categories?.name === activeCategory);
    }, [products, activeCategory]);

    const renderProductGrid = () => {
        if (isLoadingProducts) {
            return <ProductGridSkeleton />;
        }

        if (productsError) {
            return <p className="text-center text-red-500">{productsError.message}</p>;
        }
        
        if (categoriesError) {
             return <p className="text-center text-red-500">{categoriesError.message}</p>;
        }

        if (!filteredProducts || filteredProducts.length === 0) {
            return <p className="text-center text-gray-500 mt-8">No products found in this category.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} onNavigateToCheckout={onNavigateToCheckout} onNavigateToDetail={onNavigateToDetail} />
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in bg-gray-100 min-h-screen">
            <Header onNavigateToProfile={onNavigateToProfile} onNavigateToAdmin={onNavigateToAdmin} onNavigateToCart={onNavigateToCart} />
            <CategoriesNav
                categories={categories || []}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                isLoading={isLoadingCategories}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {activeCategory === 'All' ? 'New Arrivals' : activeCategory}
                    </h2>
                    <a href="#" className="text-sm font-medium text-yellow-600 hover:text-yellow-800">See all</a>
                </div>
                {renderProductGrid()}
            </main>
        </div>
    );
};

export default Home;

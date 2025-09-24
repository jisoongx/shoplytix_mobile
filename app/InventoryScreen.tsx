import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Image, FlatList } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

// --- HELPER FUNCTION ---
const formatPeso = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- INTERFACES ---
interface Product {
    prod_code: string;
    barcode: string;
    name: string;
    cost_price: number;
    selling_price: number;
    unit: string;
    stock: number;
    category_id: string;
    prod_image: string;
}

interface Category {
    category_id: string;
    category: string;
}

// --- MOCK DATA ---
const generateMockInventoryData = () => {
    const mockCategories: Category[] = [
        { category_id: 'cat1', category: 'Beverages' },
        { category_id: 'cat2', category: 'Canned Goods' },
        { category_id: 'cat3', category: 'Frozen Foods' },
        { category_id: 'cat4', category: 'Fresh Meat' },
    ];

    const mockProducts: Product[] = [
        { prod_code: 'bev001', barcode: '8881234567', name: 'Cola 1.5L Bottle', cost_price: 55.00, selling_price: 65.00, unit: 'pcs', stock: 45, category_id: 'cat1', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Cola' },
        { prod_code: 'can001', barcode: '8882345678', name: 'Canned Tuna in Oil', cost_price: 30.00, selling_price: 38.50, unit: 'pcs', stock: 120, category_id: 'cat2', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Tuna' },
        { prod_code: 'frz001', barcode: '8883456789', name: 'Chicken Nuggets 1kg', cost_price: 180.00, selling_price: 220.00, unit: 'kg', stock: 3, category_id: 'cat3', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Nuggets' },
        { prod_code: 'met001', barcode: '8884567890', name: 'Pork Chop (per kg)', cost_price: 320.00, selling_price: 380.00, unit: 'kg', stock: 15, category_id: 'cat4', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Pork' },
        { prod_code: 'bev002', barcode: '8885678901', name: 'Orange Juice 1L', cost_price: 70.00, selling_price: 85.00, unit: 'pcs', stock: 0, category_id: 'cat1', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Juice' },
        { prod_code: 'can002', barcode: '8886789012', name: 'Corned Beef 150g', cost_price: 45.00, selling_price: 52.00, unit: 'pcs', stock: 80, category_id: 'cat2', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Beef' },
        { prod_code: 'met002', barcode: '8887890123', name: 'Ground Beef (per kg)', cost_price: 350.00, selling_price: 410.00, unit: 'kg', stock: 8, category_id: 'cat4', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Meat' },
        { prod_code: 'frz002', barcode: '8888901234', name: 'Jumbo Hotdogs 500g', cost_price: 90.00, selling_price: 110.00, unit: 'pack', stock: 25, category_id: 'cat3', prod_image: 'https://placehold.co/100x100/EFEFEF/grey?text=Hotdog' },
    ];

    return { products: mockProducts, categories: mockCategories };
};

// --- MAIN INVENTORY SCREEN ---
const InventoryScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    useEffect(() => {
        const fetchData = () => {
            try {
                const mockData = generateMockInventoryData();
                setProducts(mockData.products);
                setFilteredProducts(mockData.products);
                setCategories(mockData.categories);
            } catch (error) {
                console.error("Failed to fetch inventory data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let tempProducts = [...products];
        if (activeCategory !== 'all') {
            tempProducts = tempProducts.filter(p => p.category_id === activeCategory);
        }
        if (searchTerm) {
            tempProducts = tempProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode.includes(searchTerm)
            );
        }
        setFilteredProducts(tempProducts);
    }, [searchTerm, activeCategory, products]);

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { text: 'Out of Stock', color: '#ef4444' };
        if (stock <= 5) return { text: 'Low Stock', color: '#f97316' };
        return { text: 'In Stock', color: '#10b981' };
    };

    const renderProductCard = ({ item }: { item: Product }) => {
        const stockStatus = getStockStatus(item.stock);
        return (
            <View style={styles.productCard}>
                <View style={styles.cardTopRow}>
                    <Image source={{ uri: item.prod_image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.productBarcode}>Barcode: {item.barcode}</Text>
                    </View>
                </View>
                <View style={styles.cardMiddleRow}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Selling Price</Text>
                        <Text style={styles.priceText}>{formatPeso(item.selling_price)}</Text>
                    </View>
                    <View style={styles.stockContainer}>
                        <Text style={styles.stockLabel}>Stock</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.stockIndicator, { backgroundColor: stockStatus.color }]} />
                            <Text style={[styles.stockText, { color: stockStatus.color }]}>{item.stock} {item.unit}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => alert(`Showing info for ${item.name}`)}>
                        <FontAwesome name="info-circle" size={22} color="#3b82f6" />
                        <Text style={styles.actionButtonText}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#b91c1c" /><Text style={styles.loadingText}>Loading inventory...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBarContainer}>
                <FontAwesome name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by name or barcode"
                    placeholderTextColor="#9ca3af"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>
            <View style={styles.categoryPillsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={activeCategory === 'all' ? styles.categoryPillActive : styles.categoryPill}
                        onPress={() => setActiveCategory('all')}
                    >
                        <Text style={activeCategory === 'all' ? styles.categoryPillTextActive : styles.categoryPillText}>All</Text>
                    </TouchableOpacity>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.category_id}
                            style={activeCategory === cat.category_id ? styles.categoryPillActive : styles.categoryPill}
                            onPress={() => setActiveCategory(cat.category_id)}
                        >
                            <Text style={activeCategory === cat.category_id ? styles.categoryPillTextActive : styles.categoryPillText}>{cat.category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={item => item.prod_code}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={styles.emptyTableText}>No products found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: '#6b7280',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
        marginTop: 12,
    },
    searchBar: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: '#1f2937',
    },
    searchIcon: {
        marginRight: 8,
    },
    categoryPillsContainer: {
        marginBottom: 16,
    },
    categoryPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginRight: 8,
    },
    categoryPillActive: {
        backgroundColor: '#b91c1c',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryPillText: {
        color: '#4b5563',
        fontWeight: '600',
    },
    categoryPillTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyTableText: {
        textAlign: 'center',
        paddingVertical: 40,
        color: '#6b7280',
        fontSize: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 5,
        borderLeftColor: '#b91c1c', // FIXED: All card borders are now red
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    productBarcode: {
        fontSize: 12,
        color: '#6b7280',
    },
    cardMiddleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        marginBottom: 12,
    },
    priceContainer: {},
    priceLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    stockContainer: {
        alignItems: 'flex-end',
    },
    stockLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    stockIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    stockText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        marginTop: 'auto',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    actionButtonText: {
        marginLeft: 6,
        color: '#3b82f6',
        fontWeight: '600',
    },
});

export default InventoryScreen;
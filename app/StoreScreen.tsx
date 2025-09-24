import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    TouchableOpacity, TextInput, Image, FlatList, Modal
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';

// --- SHARED TYPES & MOCKS ---
// Note: It's best practice to move these into a separate 'typesAndMocks.ts' file and import them.
const formatPeso = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface Product {
    prod_code: string;
    barcode: string;
    name: string;
    selling_price: number;
    stock: number;
    category_id: string;
    prod_image: string;
}
interface Category {
    category_id: string;
    category: string;
}
interface CartItem {
    product: Product;
    quantity: number;
    amount: number;
}
interface CartSummary {
    total_quantity: number;
    total_amount: number;
}
const generateMockBackendData = () => {
    const mockCategories: Category[] = [
        { category_id: 'cat1', category: 'Beverages' },
        { category_id: 'cat2', category: 'Canned Goods' },
        { category_id: 'cat3', category: 'Frozen Foods' },
        { category_id: 'cat4', category: 'Fresh Meat' },
    ];
    const mockProducts: Product[] = [
        { prod_code: 'bev001', barcode: '8881234567', name: 'Cola 1.5L Bottle', selling_price: 65.00, stock: 45, category_id: 'cat1', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Cola' },
        { prod_code: 'can001', barcode: '8882345678', name: 'Canned Tuna in Oil', selling_price: 38.50, stock: 120, category_id: 'cat2', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Tuna' },
        { prod_code: 'frz001', barcode: '8883456789', name: 'Chicken Nuggets 1kg', selling_price: 220.00, stock: 3, category_id: 'cat3', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Nuggets' },
        { prod_code: 'met001', barcode: '8884567890', name: 'Pork Chop (per kg)', selling_price: 380.00, stock: 15, category_id: 'cat4', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Pork' },
        { prod_code: 'bev002', barcode: '8885678901', name: 'Orange Juice 1L', selling_price: 85.00, stock: 0, category_id: 'cat1', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Juice' },
        { prod_code: 'can002', barcode: '8886789012', name: 'Corned Beef 150g', selling_price: 52.00, stock: 80, category_id: 'cat2', prod_image: 'https://placehold.co/150x150/EFEFEF/grey?text=Beef' },
    ];
    return { products: mockProducts, mockCategories };
};

// --- Reusable Modal Props ---
interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
}

// --- Product Card Component ---
const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void; }> = ({ product, onAddToCart }) => {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const cardStyle = isOutOfStock ? styles.productCardOutOfStock : isLowStock ? styles.productCardLowStock : styles.productCard;

    return (
        <TouchableOpacity style={cardStyle} onPress={() => onAddToCart(product)} disabled={isOutOfStock}>
            <Image
                source={{ uri: product.prod_image }}
                style={styles.productCardImage}
            />
            <View style={styles.productCardInfo}>
                <Text style={styles.productCardName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productCardPrice}>{formatPeso(product.selling_price)}</Text>
                <View style={styles.productCardStatus}>
                    <Text style={styles.productCardStock}>Stock: {product.stock}</Text>
                    {isOutOfStock && <Text style={[styles.statusBadge, styles.statusOutOfStock]}>Out of Stock</Text>}
                    {isLowStock && !isOutOfStock && <Text style={[styles.statusBadge, styles.statusLowStock]}>Low Stock</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// --- Cart Item Component (for the expanded cart view) ---
const CartItemComponent: React.FC<{ item: CartItem; onUpdateQuantity: (code: string, qty: number) => void; onRemoveItem: (code: string) => void; }> = ({ item, onUpdateQuantity, onRemoveItem }) => (
    <View style={styles.cartItem}>
        <View style={{ flex: 1 }}>
            <Text style={styles.cartItemName}>{item.product.name}</Text>
            <Text style={styles.cartItemPrice}>{formatPeso(item.product.selling_price)} each</Text>
        </View>
        <View style={styles.cartItemControls}>
            <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.quantityBtn} onPress={() => onUpdateQuantity(item.product.prod_code, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Text style={styles.quantityBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityDisplay}>{item.quantity}</Text>
                <TouchableOpacity style={styles.quantityBtn} onPress={() => onUpdateQuantity(item.product.prod_code, item.quantity + 1)}>
                    <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.cartItemTotal}>{formatPeso(item.amount)}</Text>
            <TouchableOpacity style={styles.removeBtn} onPress={() => onRemoveItem(item.product.prod_code)}>
                <FontAwesome name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    </View>
);

// --- MAIN SCREEN COMPONENT ---
const StoreScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartSummary, setCartSummary] = useState<CartSummary>({ total_quantity: 0, total_amount: 0 });
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartExpanded, setIsCartExpanded] = useState(false);

    useEffect(() => {
        const mockData = generateMockBackendData();
        setProducts(mockData.products);
        setCategories(mockData.mockCategories);
        setLoading(false);
    }, []);

    const filteredProducts = products
        .filter(p => activeCategory ? p.category_id === activeCategory : true)
        .filter(p => searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm) : true);

    useEffect(() => {
        const total_quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const total_amount = cartItems.reduce((sum, item) => sum + item.amount, 0);
        setCartSummary({ total_quantity, total_amount });
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems(prevItems => {
            const existing = prevItems.find(item => item.product.prod_code === product.prod_code);
            if (existing) {
                return prevItems.map(item =>
                    item.product.prod_code === product.prod_code
                        ? { ...item, quantity: item.quantity + 1, amount: item.amount + product.selling_price }
                        : item
                );
            }
            return [...prevItems, { product, quantity: 1, amount: product.selling_price }];
        });
    };

    const updateCartQuantity = (prod_code: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(prod_code);
            return;
        }
        setCartItems(prev => prev.map(item =>
            item.product.prod_code === prod_code
                ? { ...item, quantity: newQuantity, amount: item.product.selling_price * newQuantity }
                : item
        ));
    };

    const removeItem = (prod_code: string) => {
        setCartItems(prev => prev.filter(item => item.product.prod_code !== prod_code));
    };

    return (
        <View style={styles.storeContainer}>
            <View style={styles.header}>
                <View style={styles.searchBarContainer}>
                    <FontAwesome name="search" size={16} color="#9ca3af" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        onChangeText={setSearchTerm}
                        value={searchTerm}
                    />
                </View>
                <TouchableOpacity style={styles.scannerButton} onPress={() => alert('Scanner Tapped!')}>
                    <FontAwesome name="barcode" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPillsContainer}>
                    <TouchableOpacity style={activeCategory === '' ? styles.categoryPillActive : styles.categoryPill} onPress={() => setActiveCategory('')}>
                        <Text style={activeCategory === '' ? styles.categoryPillTextActive : styles.categoryPillText}>All</Text>
                    </TouchableOpacity>
                    {categories.map(cat => (
                        <TouchableOpacity key={cat.category_id} style={activeCategory === cat.category_id ? styles.categoryPillActive : styles.categoryPill} onPress={() => setActiveCategory(cat.category_id)}>
                            <Text style={activeCategory === cat.category_id ? styles.categoryPillTextActive : styles.categoryPillText}>{cat.category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#b91c1c" />
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => <ProductCard product={item} onAddToCart={addToCart} />}
                    keyExtractor={item => item.prod_code}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', gap: 10 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyListContainer}>
                            <FontAwesome name="search" size={40} color="#9ca3af" />
                            <Text style={styles.emptyListText}>No products found</Text>
                        </View>
                    )}
                />
            )}

            {cartItems.length > 0 && (
                <TouchableOpacity style={styles.cartSummaryBar} onPress={() => setIsCartExpanded(true)}>
                    <View style={styles.cartSummaryInfo}>
                        <FontAwesome name="shopping-cart" size={20} color="#fff" />
                        <Text style={styles.cartSummaryText}>{cartSummary.total_quantity} items</Text>
                    </View>
                    <Text style={styles.cartSummaryTotal}>{formatPeso(cartSummary.total_amount)}</Text>
                </TouchableOpacity>
            )}

            <Modal
                transparent={true}
                visible={isCartExpanded}
                animationType="slide"
                onRequestClose={() => setIsCartExpanded(false)}
            >
                <View style={styles.bottomSheetContainer}>
                    <TouchableOpacity style={styles.bottomSheetBackdrop} onPress={() => setIsCartExpanded(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.bottomSheetHeader}>
                            <Text style={styles.bottomSheetTitle}>Your Cart</Text>
                            <TouchableOpacity onPress={() => setIsCartExpanded(false)}>
                                <FontAwesome name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cartItems}
                            renderItem={({ item }) => <CartItemComponent item={item} onUpdateQuantity={updateCartQuantity} onRemoveItem={removeItem} />}
                            keyExtractor={item => item.product.prod_code}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyCartContainer}>
                                    <Text style={styles.emptyCartText}>Cart is empty</Text>
                                </View>
                            )}
                        />
                        <View style={styles.cartSummaryContainer}>
                            <View style={styles.cartSummaryRow}>
                                <Text style={styles.cartSummaryLabelTotal}>Total:</Text>
                                <Text style={styles.cartSummaryValueTotal}>{formatPeso(cartSummary.total_amount)}</Text>
                            </View>
                            <TouchableOpacity
                                style={cartItems.length === 0 ? styles.checkoutButtonDisabled : styles.checkoutButton}
                                onPress={() => alert('Proceeding to payment...')}
                                disabled={cartItems.length === 0}
                            >
                                <Text style={styles.checkoutButtonText}>Process Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


// --- STYLES ---
const styles = StyleSheet.create({
    storeContainer: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, alignItems: 'center' },
    searchBarContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', height: 44 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1f2937' },
    scannerButton: { backgroundColor: '#dc2626', padding: 10, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
    categoryPillsContainer: { paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 },
    categoryPill: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8 },
    categoryPillActive: { backgroundColor: '#b91c1c', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    categoryPillText: { color: '#4b5563', fontWeight: '500' },
    categoryPillTextActive: { color: '#fff', fontWeight: 'bold' },
    productCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 10, flex: 1, padding: 8 },
    productCardLowStock: { backgroundColor: '#fffbeb', borderColor: '#fbbf24', borderWidth: 1, borderRadius: 8, marginBottom: 10, flex: 1, padding: 8 },
    productCardOutOfStock: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, marginBottom: 10, flex: 1, padding: 8, opacity: 0.6 },
    productCardImage: { width: '100%', height: 100, borderRadius: 6, marginBottom: 8 },
    productCardInfo: { flex: 1 },
    productCardName: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
    productCardPrice: { fontSize: 14, color: '#dc2626', fontWeight: 'bold', marginVertical: 4 },
    productCardStatus: { flexDirection: 'row', alignItems: 'center' },
    productCardStock: { fontSize: 11, color: '#6b7280', flex: 1 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontSize: 10, fontWeight: 'bold', overflow: 'hidden' },
    statusOutOfStock: { backgroundColor: '#fee2e2', color: '#b91c1c' },
    statusLowStock: { backgroundColor: '#fffbeb', color: '#d97706' },
    emptyListContainer: { alignItems: 'center', marginTop: 50 },
    emptyListText: { color: '#6b7280', marginTop: 10 },
    cartSummaryBar: { position: 'absolute', bottom: 10, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937', padding: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
    cartSummaryInfo: { flexDirection: 'row', alignItems: 'center' },
    cartSummaryText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    cartSummaryTotal: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    bottomSheetContainer: { flex: 1, justifyContent: 'flex-end' },
    bottomSheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomSheet: { backgroundColor: '#f9fafb', height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 16 },
    bottomSheetTitle: { fontSize: 20, fontWeight: 'bold' },
    emptyCartContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyCartText: { color: '#6b7280' },
    cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
    cartItemControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
    cartItemName: { fontSize: 14, fontWeight: 'bold' },
    cartItemPrice: { fontSize: 12, color: '#6b7280' },
    quantityControls: { flexDirection: 'row', alignItems: 'center' },
    quantityBtn: { backgroundColor: '#dc2626', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    quantityBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    quantityDisplay: { marginHorizontal: 15, fontSize: 14, fontWeight: 'bold' },
    cartItemTotal: { fontSize: 14, fontWeight: 'bold', color: '#dc2626', width: 70, textAlign: 'right' },
    removeBtn: { padding: 5, marginLeft: 10 },
    cartSummaryContainer: { borderTopWidth: 1, borderTopColor: '#e5e7eb', padding: 16, backgroundColor: '#fff' },
    cartSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cartSummaryLabelTotal: { fontSize: 18, fontWeight: 'bold' },
    cartSummaryValueTotal: { fontSize: 18, fontWeight: 'bold', color: '#dc2626' },
    checkoutButton: { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
    checkoutButtonDisabled: { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 8, marginTop: 10, opacity: 0.5 },
    checkoutButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default StoreScreen;
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import DashboardScreen from './DashboardScreen';
import InventoryScreen from './InventoryScreen';
import StoreScreen from './StoreScreen';

// Data for our navigation tabs
const tabs = [
    { name: 'dashboard', label: 'Home', icon: 'home' },
    { name: 'inventory', label: 'Inventory', icon: 'archive' },
    { name: 'store', label: 'Store', icon: 'shopping-cart' },
];

export default function MainScreen() {
    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'inventory':
                return <InventoryScreen />;
            case 'store':
                return <StoreScreen />;
            default:
                return <DashboardScreen />;
        }
    };

    const getNavTitle = () => {
        const activeTab = tabs.find(tab => tab.name === currentScreen);
        return activeTab ? activeTab.label : 'Dashboard';
    };

    // 👇 CORRECTED LOGOUT LOGIC
    const handleLogout = () => {
        setIsProfileMenuVisible(false);
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: () => {
                        // Replace the current screen ('/main') with the '/(tabs)' route group.
                        // Since 'index.tsx' is the default screen in that group, it will load.
                        router.replace('/(tabs)');
                    }
                }
            ]
        );
    };

    const handleTabPress = (tabName: string) => {
        setCurrentScreen(tabName);
    };

    return (
        <View style={styles.outerContainer}>
            {/* Profile Menu Modal */}
            <Modal
                transparent={true}
                visible={isProfileMenuVisible}
                animationType="fade"
                onRequestClose={() => setIsProfileMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsProfileMenuVisible(false)}>
                    <View style={styles.profileMenu}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setIsProfileMenuVisible(false); alert('Profile page goes here!') }}>
                            <FontAwesome name="user" size={16} color="#4b5563" />
                            <Text style={styles.menuItemText}>Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <FontAwesome name="sign-out" size={16} color="#ef4444" />
                            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Top Navigation Bar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => alert('Menu pressed!')}>
                    <FontAwesome name="bars" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{getNavTitle()}</Text>
                <TouchableOpacity onPress={() => setIsProfileMenuVisible(true)}>
                    <FontAwesome name="user-circle" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Screen Content */}
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = currentScreen === tab.name;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.tabButton}
                            onPress={() => handleTabPress(tab.name)}
                        >
                            <FontAwesome
                                name={tab.icon as any}
                                size={20}
                                color={isActive ? '#b91c1c' : '#6b7280'}
                            />
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 16,
        backgroundColor: '#b91c1c',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    navTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
        color: '#6b7280',
    },
    activeTabText: {
        color: '#b91c1c',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
    },
    profileMenu: {
        position: 'absolute',
        top: 80,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
        width: 150,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#374151',
    },
});
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Pressable
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      // NOTE: Replace with your actual PC's IP address
      const res = await fetch("http://192.168.100.20/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Navigate to the main screen on successful login
        router.replace("/main");
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network request failed. Please check your connection and IP address.");
    } finally {
      // Ensure the loading spinner stops, regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/logo.png')} // Make sure this path is correct
          style={styles.logo}
        />
        <Text style={styles.title}>SHOPLYTIX</Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.inputField}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
          cursorColor="#b91c1c"
          selectionColor="rgba(225, 29, 72, 0.2)"
          underlineColorAndroid="transparent"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.inputField}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor="#9ca3af"
          cursorColor="#b91c1c"
          selectionColor="rgba(225, 29, 72, 0.2)"
          underlineColorAndroid="transparent"
        />
        {password.length > 0 && (
          <Pressable
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <FontAwesome
              name={isPasswordVisible ? 'eye' : 'eye-slash'}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        )}
      </View>

      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signupLinkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff"
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e11d48",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    height: 50,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 15,
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#e11d48",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    height: 50,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signupLinkText: {
    color: '#e11d48',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
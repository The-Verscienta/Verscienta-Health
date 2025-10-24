# Verscienta Health - Mobile App Development Guide

This guide explains how to develop mobile apps (iOS, Android, Windows) for Verscienta Health using the shared API and type system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Using the API Client](#using-the-api-client)
4. [Authentication](#authentication)
5. [Offline Support](#offline-support)
6. [Push Notifications](#push-notifications)
7. [Image Optimization](#image-optimization)
8. [React Native Setup](#react-native-setup)
9. [Flutter Setup](#flutter-setup)
10. [Best Practices](#best-practices)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Apps                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ iOS (Swift)  │  │Android(Kt/RN)│  │ Windows      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │  @verscienta/api-client │
                │  (TypeScript)            │
                └───────────┬─────────────┘
                            │
                ┌───────────▼───────────┐
                │  @verscienta/api-types │
                │  (Shared Types)         │
                └───────────┬─────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼──────┐                      ┌────────▼────────┐
│  Next.js App │                      │  Payload CMS    │
│  (REST API)  │                      │  (Headless CMS) │
└──────────────┘                      └─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Access to Verscienta monorepo

### Install Shared Packages

The monorepo includes two packages for mobile development:

1. **@verscienta/api-types** - TypeScript type definitions
2. **@verscienta/api-client** - Type-safe API client

```bash
# Install dependencies for shared packages
cd packages/api-types && pnpm install && pnpm build
cd ../api-client && pnpm install && pnpm build
```

---

## Using the API Client

The API client is platform-agnostic and works with React Native, Expo, or can be adapted for Flutter.

### Installation in Mobile App

```bash
# If using within the monorepo
pnpm add @verscienta/api-client @verscienta/api-types

# If using outside the monorepo (publish to npm or use as git submodule)
npm install @verscienta/api-client
```

### Basic Usage

```typescript
import { VerslientaClient } from '@verscienta/api-client'

// Initialize the client
const api = new VerslientaClient({
  baseURL: 'https://verscienta.com',
  timeout: 30000,
  onTokenExpired: () => {
    // Handle token expiration (redirect to login)
    navigation.navigate('Login')
  },
  onError: (error) => {
    // Handle API errors globally
    console.error('API Error:', error)
    showToast(error.message)
  },
})

// Make API calls
async function fetchHerbs() {
  try {
    const response = await api.herbs.list({
      page: 1,
      limit: 20,
      temperature: 'Warm',
    })
    console.log(`Found ${response.totalDocs} herbs`)
    return response.docs
  } catch (error) {
    console.error('Failed to fetch herbs:', error)
  }
}
```

### All Available Methods

```typescript
// Authentication
await api.auth.login({ email, password })
await api.auth.register({ email, password, firstName, lastName })
await api.auth.logout()
await api.auth.getSession()
await api.auth.forgotPassword(email)
await api.auth.resetPassword(token, newPassword)

// Herbs
await api.herbs.list({ page: 1, limit: 20 })
await api.herbs.get(slug)

// Formulas
await api.formulas.list({ page: 1, limit: 20 })
await api.formulas.get(slug)

// Conditions
await api.conditions.list({ page: 1, limit: 20 })
await api.conditions.get(slug)

// Practitioners
await api.practitioners.list({ page: 1, limit: 20 })
await api.practitioners.get(slug)
await api.practitioners.searchByLocation({
  latitude: 37.7749,
  longitude: -122.4194,
  radius: 50, // km
})

// Search
await api.search({ q: 'ginseng', type: 'herbs' })

// AI Symptom Analysis (requires auth)
await api.ai.analyzeSymptoms({
  symptoms: 'persistent cough with clear phlegm',
  age: 35,
  gender: 'female',
})

// Mobile-specific
await api.mobile.getConfig()
await api.mobile.sync({
  lastSyncedAt: '2024-01-01T00:00:00Z',
  collections: ['herbs', 'formulas'],
})
await api.mobile.registerDevice(deviceToken, 'ios')
await api.mobile.unregisterDevice(deviceToken)
```

---

## Authentication

### Login Flow

```typescript
async function handleLogin(email: string, password: string) {
  try {
    const response = await api.auth.login({ email, password })

    // Store token in secure storage
    await SecureStore.setItemAsync('auth_token', response.session.token)

    // Set token for subsequent requests
    api.setToken(response.session.token)

    // Navigate to home
    navigation.navigate('Home')
  } catch (error) {
    showError('Invalid credentials')
  }
}
```

### Token Persistence

```typescript
// On app startup, restore token
async function initializeAuth() {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) {
    api.setToken(token)

    // Verify token is still valid
    const session = await api.auth.getSession()
    if (!session) {
      // Token expired, clear it
      await SecureStore.deleteItemAsync('auth_token')
      navigation.navigate('Login')
    }
  }
}
```

### OAuth Social Login

The backend supports Google and GitHub OAuth. For mobile:

1. Use a WebView to open the OAuth URL
2. Listen for redirect callback
3. Extract token from redirect URL

```typescript
// Example with React Native WebView
import { WebView } from 'react-native-webview'

function SocialLogin() {
  const handleNavigationStateChange = (navState: any) => {
    // Check if redirected back with token
    if (navState.url.includes('/auth/callback')) {
      const url = new URL(navState.url)
      const token = url.searchParams.get('token')
      if (token) {
        api.setToken(token)
        // Store and navigate
      }
    }
  }

  return (
    <WebView
      source={{ uri: 'https://verscienta.com/api/auth/google' }}
      onNavigationStateChange={handleNavigationStateChange}
    />
  )
}
```

---

## Offline Support

### Syncing Data

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

async function syncData() {
  // Get last sync timestamp
  const lastSynced = await AsyncStorage.getItem('last_synced')

  // Fetch updates
  const response = await api.mobile.sync({
    lastSyncedAt: lastSynced || undefined,
    collections: ['herbs', 'formulas', 'conditions'],
  })

  // Store data locally
  await AsyncStorage.setItem('herbs', JSON.stringify(response.herbs))
  await AsyncStorage.setItem('formulas', JSON.stringify(response.formulas))
  await AsyncStorage.setItem('conditions', JSON.stringify(response.conditions))

  // Update last synced timestamp
  await AsyncStorage.setItem('last_synced', response.syncedAt)
}

// Sync on app startup and periodically
useEffect(() => {
  syncData()

  // Sync every 6 hours
  const interval = setInterval(syncData, 6 * 60 * 60 * 1000)
  return () => clearInterval(interval)
}, [])
```

### Offline-First Architecture

For better offline support, consider using:

- **WatermelonDB** - Offline-first reactive database for React Native
- **Redux Persist** - Persist Redux state to AsyncStorage
- **React Query** - Automatic caching and background sync

---

## Push Notifications

### iOS Setup (APNs)

```typescript
import * as Notifications from 'expo-notifications'

async function registerForPushNotifications() {
  // Request permission
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  // Get push token
  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Register with backend
  await api.mobile.registerDevice(token, 'ios')
}
```

### Android Setup (FCM)

```typescript
import messaging from '@react-native-firebase/messaging'

async function registerForPushNotifications() {
  // Request permission (Android 13+)
  const authStatus = await messaging().requestPermission()
  if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED) return

  // Get FCM token
  const token = await messaging().getToken()

  // Register with backend
  await api.mobile.registerDevice(token, 'android')
}
```

### Handling Notifications

```typescript
// Foreground notifications
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification)
  // Show in-app notification
})

// Background/clicked notifications
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data
  // Navigate to relevant screen
  navigation.navigate('HerbDetail', { slug: data.herbSlug })
})
```

---

## Image Optimization

Mobile apps should use optimized images to reduce bandwidth and improve performance.

### Using the Image API

```typescript
import { Image } from 'react-native'

function OptimizedImage({ url, width, height }: Props) {
  // Get optimized image URL
  const optimizedUrl = api.media.getOptimizedImage(url, {
    width,
    height,
    quality: 80,
    format: 'webp',
  })

  return <Image source={{ uri: optimizedUrl }} style={{ width, height }} />
}

// Usage
<OptimizedImage url="https://cdn.verscienta.com/herbs/ginseng.jpg" width={400} height={300} />
```

### Recommended Sizes

- **Thumbnails**: 150x150, quality 70
- **List Items**: 300x300, quality 75
- **Detail View**: 800x600, quality 85
- **Full Screen**: 1200x900, quality 90

---

## React Native Setup

### 1. Create New React Native App

```bash
# Using Expo (recommended for beginners)
npx create-expo-app verscienta-mobile
cd verscienta-mobile

# Or using React Native CLI
npx react-native init VersientaMobile
cd VersientaMobile
```

### 2. Install Dependencies

```bash
# API client (if published to npm or linked)
npm install @verscienta/api-client

# Essential dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-safe-area-context react-native-screens
npm install @react-native-async-storage/async-storage
npm install expo-secure-store # For token storage

# Optional but recommended
npm install @tanstack/react-query # For API caching
npm install zustand # For state management
```

### 3. Project Structure

```
verscienta-mobile/
├── src/
│   ├── api/
│   │   └── client.ts          # API client instance
│   ├── screens/
│   │   ├── Home.tsx
│   │   ├── HerbList.tsx
│   │   ├── HerbDetail.tsx
│   │   └── Login.tsx
│   ├── components/
│   │   ├── HerbCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useHerbs.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── utils/
│       └── storage.ts
├── App.tsx
└── package.json
```

### 4. Example Implementation

```typescript
// src/api/client.ts
import { VerslientaClient } from '@verscienta/api-client'
import * as SecureStore from 'expo-secure-store'

export const api = new VerslientaClient({
  baseURL: 'https://verscienta.com',
  onTokenExpired: async () => {
    await SecureStore.deleteItemAsync('auth_token')
    // Navigate to login - implement in App.tsx
  },
})

// src/hooks/useHerbs.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useHerbs(page = 1) {
  return useQuery({
    queryKey: ['herbs', page],
    queryFn: () => api.herbs.list({ page, limit: 20 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// src/screens/HerbList.tsx
export function HerbListScreen() {
  const { data, isLoading, error } = useHerbs()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <FlatList
      data={data?.docs}
      renderItem={({ item }) => <HerbCard herb={item} />}
      keyExtractor={(item) => item.id}
    />
  )
}
```

---

## Flutter Setup

For Flutter apps, you'll need to create a Dart wrapper around the API client.

### 1. Create Flutter Project

```bash
flutter create verscienta_mobile
cd verscienta_mobile
```

### 2. Install Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  json_annotation: ^4.8.1
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1

dev_dependencies:
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
```

### 3. Create Dart API Client

```dart
// lib/api/client.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class VerslientaClient {
  final String baseUrl;
  String? _token;

  VerslientaClient({required this.baseUrl});

  void setToken(String? token) {
    _token = token;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: _getHeaders(),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Map<String, String> _getHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('API Error: ${response.statusCode}');
  }

  // Herb methods
  Future<Map<String, dynamic>> getHerbs({int page = 1, int limit = 20}) {
    return get('/api/herbs?page=$page&limit=$limit');
  }

  Future<Map<String, dynamic>> getHerb(String slug) {
    return get('/api/herbs/$slug');
  }

  // Auth methods
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await post('/api/auth/sign-in', {
      'email': email,
      'password': password,
    });
    if (response['session']?['token'] != null) {
      setToken(response['session']['token']);
    }
    return response;
  }
}
```

---

## Best Practices

### 1. **Error Handling**

Always handle errors gracefully:

```typescript
try {
  const herbs = await api.herbs.list()
  setHerbs(herbs.docs)
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limited
    showToast('Too many requests. Please wait.')
  } else if (error.statusCode === 401) {
    // Unauthorized
    navigation.navigate('Login')
  } else {
    // Generic error
    showToast('Something went wrong. Please try again.')
  }
}
```

### 2. **Loading States**

Show loading indicators for better UX:

```typescript
const [loading, setLoading] = useState(false)

async function loadData() {
  setLoading(true)
  try {
    const data = await api.herbs.list()
    setHerbs(data.docs)
  } finally {
    setLoading(false)
  }
}
```

### 3. **Caching with React Query**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useHerbs() {
  return useQuery({
    queryKey: ['herbs'],
    queryFn: () => api.herbs.list(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
  })
}
```

### 4. **Rate Limiting Awareness**

Respect rate limits by:
- Implementing request queuing
- Showing "retry after" messages
- Using appropriate cache times

### 5. **Security**

- Store tokens in **secure storage** (never AsyncStorage)
- Use HTTPS only
- Implement certificate pinning for production
- Don't log sensitive data

### 6. **Performance**

- Use pagination (don't load all data at once)
- Implement virtual lists for long lists
- Use optimized images
- Enable gzip compression

---

## Monorepo Integration

To add a mobile app to the Verscienta monorepo:

### 1. Add to Workspace

```json
// package.json (root)
{
  "workspaces": ["apps/*", "packages/*", "mobile/*"]
}
```

### 2. Create Mobile App Directory

```bash
mkdir mobile
cd mobile
npx create-expo-app verscienta-mobile
```

### 3. Link Shared Packages

```json
// mobile/verscienta-mobile/package.json
{
  "dependencies": {
    "@verscienta/api-client": "workspace:*",
    "@verscienta/api-types": "workspace:*"
  }
}
```

### 4. Update Turbo Config

```json
// turbo.json
{
  "pipeline": {
    "dev": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    }
  }
}
```

---

## Support & Resources

- **API Documentation**: https://verscienta.com/api-docs
- **Type Definitions**: `packages/api-types/src/index.ts`
- **API Client Source**: `packages/api-client/src/index.ts`
- **Example Usage**: See web app in `apps/web`

For questions, contact the development team or open an issue in the repository.

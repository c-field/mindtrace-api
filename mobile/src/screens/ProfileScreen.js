import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setName(userData.username || '');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
            onLogout();
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your thoughts and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/thoughts`, {
                method: 'DELETE',
              });
              if (response.ok) {
                Alert.alert('Success', 'All thoughts have been deleted');
              } else {
                Alert.alert('Error', 'Failed to delete thoughts');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open link')
    );
  };

  const mentalHealthResources = [
    {
      title: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: '24/7 crisis support',
    },
    {
      title: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free 24/7 crisis support via text',
    },
    {
      title: 'NAMI National',
      url: 'https://nami.org',
      description: 'Mental health advocacy and support',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Profile</Text>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="#0f766e" />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setIsEditing(false);
                    Alert.alert('Profile Updated', 'Your profile has been updated');
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="#16a34a" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setIsEditing(false);
                    setName(user?.username || '');
                  }}
                >
                  <Ionicons name="close" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!isEditing ? (
            <View style={styles.profileInfo}>
              <View style={styles.infoField}>
                <Text style={styles.fieldLabel}>Name</Text>
                <Text style={styles.fieldValue}>{name || 'Add your name'}</Text>
              </View>
              <View style={styles.infoField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{user?.username}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (Cannot be changed)</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user?.username}
                  editable={false}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
            <View style={styles.actionRowContent}>
              <Ionicons name="log-out" size={20} color="#6b7280" />
              <Text style={styles.actionText}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.cardTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dangerActionRow} onPress={handleClearData}>
            <View style={styles.actionRowContent}>
              <Ionicons name="trash" size={20} color="#dc2626" />
              <Text style={styles.dangerActionText}>Clear All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <Text style={styles.dangerWarning}>
            This will permanently delete all your thoughts and cannot be undone.
          </Text>
        </View>

        <View style={styles.resourcesCard}>
          <Text style={styles.cardTitle}>Mental Health Resources</Text>
          <Text style={styles.resourcesSubtitle}>
            If you're in crisis or need immediate support, please reach out:
          </Text>
          
          {mentalHealthResources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceRow}
              onPress={() => {
                if (resource.phone) {
                  Linking.openURL(`tel:${resource.phone.replace(/\D/g, '')}`);
                } else if (resource.url) {
                  openURL(resource.url);
                }
              }}
            >
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
                {resource.phone && (
                  <Text style={styles.resourceContact}>{resource.phone}</Text>
                )}
              </View>
              <Ionicons name="open" size={20} color="#0f766e" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  profileInfo: {
    gap: 16,
  },
  infoField: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  actionRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
  },
  dangerActionText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  dangerWarning: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  resourcesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  resourcesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resourceContact: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
  },
});
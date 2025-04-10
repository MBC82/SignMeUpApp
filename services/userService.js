import { authService, firestoreService } from '../config/firebase';

export const UserService = {
  createNewUser: async (email, password, userData) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await authService.createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Create user profile in Firestore
      await firestoreService.collection('users').doc(userId).set({
        ...userData,
        createdAt: firestoreService.FieldValue.serverTimestamp(),
        lastLogin: firestoreService.FieldValue.serverTimestamp()
      });

      return userId;
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  },

  updateUserProfile: async (userId, profileData) => {
    try {
      await firestoreService.collection('users').doc(userId).update({
        ...profileData,
        updatedAt: firestoreService.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      const userDoc = await firestoreService.collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  getUserEvents: async (userId) => {
    try {
      const eventsSnapshot = await firestoreService
        .collection('events')
        .where('participants', 'array-contains', userId)
        .get();

      const events = [];
      eventsSnapshot.forEach(doc => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return events;
    } catch (error) {
      console.error('Error getting user events:', error);
      throw error;
    }
  },

  getUserInvitations: async (userId) => {
    try {
      const invitationsSnapshot = await firestoreService
        .collectionGroup('invitations')
        .where('userId', '==', userId)
        .where('status', '==', 'pending')
        .get();

      const invitations = [];
      invitationsSnapshot.forEach(doc => {
        invitations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return invitations;
    } catch (error) {
      console.error('Error getting user invitations:', error);
      throw error;
    }
  },

  inviteUserToEvent: async (eventId, invitedUserId, adminUsername) => {
    try {
      const eventRef = firestoreService.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        throw new Error('Event not found');
      }
      
      // Add the invitation to the event's invitations subcollection
      await eventRef.collection('invitations').add({
        invitedUserId,
        invitedBy: adminUsername,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('Error inviting user to event:', error);
      throw error;
    }
  }
}; 
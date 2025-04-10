import { FirebaseFirestoreTypes, Timestamp } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import { firestoreService } from '../config/firebase';
import { ChatMessage, ChatRoom, ChatParticipant } from '../types/chat';

export const ChatService = {
  async searchUsers(searchTerm: string): Promise<ChatParticipant[]> {
    try {
      const usersSnapshot = await firestoreService
        .collection('users')
        .orderBy('username')
        .startAt(searchTerm.toLowerCase())
        .endAt(searchTerm.toLowerCase() + '\uf8ff')
        .limit(10)
        .get();

      return usersSnapshot.docs.map(doc => ({
        userId: doc.id,
        userName: doc.data().username || doc.data().name || 'Unknown User',
        userPhotoURL: doc.data().profileImage || doc.data().photoURL,
        lastSeen: doc.data().lastSeen || Timestamp.now()
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  async createChat(creatorId: string, participantIds: string[]): Promise<string> {
    try {
      // Get all participants' data
      const participantsData = await Promise.all(
        [...participantIds, creatorId].map(async (userId) => {
          const userDoc = await firestoreService.collection('users').doc(userId).get();
          return {
            userId,
            userName: userDoc.data()?.name || 'Unknown User',
            userPhotoURL: userDoc.data()?.photoURL,
            lastSeen: Timestamp.now()
          };
        })
      );

      // Create the chat room
      const chatRef = await firestoreService.collection('chats').add({
        participants: participantsData,
        createdAt: Timestamp.now(),
        createdBy: creatorId,
        lastMessage: null,
        lastMessageTime: null
      });

      // Add chat reference to all participants
      await Promise.all(
        participantsData.map(participant =>
          firestoreService
            .collection('users')
            .doc(participant.userId)
            .update({
              chats: firestore.FieldValue.arrayUnion(chatRef.id)
            })
        )
      );

      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  async sendMessage(eventId: string, userId: string, userName: string, userPhotoURL: string | undefined, text: string): Promise<void> {
    const eventRef = firestoreService.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    if (!eventData?.participants?.includes(userId)) {
      throw new Error('User is not a participant in this event');
    }

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      eventId,
      userId,
      userName,
      userPhotoURL,
      text
    };

    await firestoreService.collection('events').doc(eventId).collection('messages').add({
      ...message,
      timestamp: Timestamp.now()
    });
  },

  subscribeToMessages(eventId: string, callback: (messages: ChatMessage[]) => void): () => void {
    return firestoreService
      .collection('events')
      .doc(eventId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatMessage));
        callback(messages);
      });
  },

  async getEventParticipants(eventId: string): Promise<ChatParticipant[]> {
    const eventDoc = await firestoreService.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    const participants = eventData?.participants || [];
    
    const participantPromises = participants.map(async (userId: string) => {
      const userDoc = await firestoreService.collection('users').doc(userId).get();
      const userData = userDoc.data();
      return {
        userId,
        userName: userData?.name || 'Unknown User',
        userPhotoURL: userData?.photoURL,
        lastSeen: Timestamp.now()
      } as ChatParticipant;
    });

    return Promise.all(participantPromises);
  },

  async canAccessChat(eventId: string, userId: string): Promise<boolean> {
    const eventDoc = await firestoreService.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return false;
    }

    const eventData = eventDoc.data();
    return eventData?.participants?.includes(userId) || false;
  },

  getEventDetails: async (eventId: string) => {
    try {
      const eventDoc = await firestoreService.collection('events').doc(eventId).get();
      
      if (!eventDoc.exists) {
        return null;
      }
      
      return eventDoc.data();
    } catch (error) {
      console.error('Error getting event details:', error);
      throw error;
    }
  },

  async addParticipant(eventId: string, userId: string, userData: any): Promise<boolean> {
    const eventRef = firestoreService.collection('events').doc(eventId);
    
    await eventRef.update({
      participants: firestore.FieldValue.arrayUnion(userId)
    });
    
    await firestoreService.collection('events').doc(eventId).collection('participants').doc(userId).set({
      ...userData,
      joinedAt: Timestamp.now()
    });
    
    return true;
  },

  async inviteUserToEvent(eventId: string, userId: string, inviterId: string): Promise<boolean> {
    await firestoreService.collection('events').doc(eventId).collection('invitations').doc(userId).set({
      invitedBy: inviterId,
      invitedAt: Timestamp.now(),
      status: 'pending'
    });
    
    return true;
  }
}; 
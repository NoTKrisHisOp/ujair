import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [conversations, setConversations] = useState([]);

  const currentUserId = auth.currentUser?.uid;
  const selectedUser = useMemo(() => users.find(u => u.id === recipient), [users, recipient]);
  const conversationKey = useMemo(() => {
    if (!currentUserId || !selectedUser?.uid) return '';
    const a = currentUserId;
    const b = selectedUser.uid;
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }, [currentUserId, selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      // Remove current user from the list
      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList.filter(user => user.uid !== auth.currentUser.uid));
    };

    fetchUsers();
  }, []);

  // Build conversations list (dedup by conversationKey, show last message)
  useEffect(() => {
    if (!currentUserId) return;
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', currentUserId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const seen = new Set();
      const convs = [];
      for (const d of snap.docs) {
        const m = { id: d.id, ...d.data() };
        if (seen.has(m.conversationKey)) continue;
        seen.add(m.conversationKey);
        const otherId = (m.participants || []).find((p) => p !== currentUserId);
        const otherUser = users.find(u => u.uid === otherId);
        convs.push({
          conversationKey: m.conversationKey,
          otherUserId: otherId,
          otherName: otherUser?.name || otherUser?.displayName || otherUser?.email || 'User',
          lastText: m.text,
          lastAt: m.createdAt,
        });
      }
      setConversations(convs);
    });
    return () => unsub();
  }, [currentUserId, users]);

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  };

  useEffect(() => {
    if (!conversationKey) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationKey', '==', conversationKey),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationKey]);

  // Auto-scroll to latest message
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (newMessage.trim() === '' || !recipient) {
      return;
    }

    try {
      if (!selectedUser?.uid || !conversationKey) {
        alert('Please select a user to chat with.');
        return;
      }

      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        conversationKey,
        participants: [currentUserId, selectedUser.uid],
        senderId: currentUserId,
        recipientId: selectedUser.uid,
        senderDisplayName: auth.currentUser.displayName || 'User',
        senderPhotoURL: auth.currentUser.photoURL || '',
        status: 'sent',
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      const code = err?.code || 'unknown';
      const msg = err?.message || String(err);
      alert(`Error sending message (code: ${code}).\n${msg}`);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationKey) return;
    const ok = window.confirm('Delete entire conversation for both participants?');
    if (!ok) return;
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('conversationKey', '==', conversationKey));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'messages', d.id))));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar: conversations */}
      <div className="w-72 border-r bg-gray-50 p-3 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 mb-2">Conversations</div>
        <div className="space-y-1">
          {conversations.map(c => (
            <button
              key={c.conversationKey}
              onClick={() => setRecipient((users.find(u => u.uid === c.otherUserId)?.id) || '')}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${selectedUser?.uid === c.otherUserId ? 'bg-gray-100' : ''}`}
            >
              <div className="text-sm font-medium text-gray-900">{c.otherName}</div>
              <div className="text-xs text-gray-500 truncate">{c.lastText}</div>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 mb-1">Start new chat</div>
          <select
            id="recipient"
            value={recipient}
            onChange={handleRecipientChange}
            className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a user…</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.displayName || user.name || user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
          <h1 className="font-semibold">{selectedUser ? (selectedUser.displayName || selectedUser.name || selectedUser.email) : 'Direct Messages'}</h1>
          {recipient && (
            <button onClick={handleDeleteConversation} className="text-sm text-red-600 hover:text-red-700">Delete chat</button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
        {!recipient ? (
          <div className="h-full flex items-center justify-center text-gray-500">Select someone to start chatting</div>
        ) : (
          <div className="space-y-2">
            {messages.map(message => {
              const isMine = message.senderId === currentUserId;
              const ts = message.createdAt?.toDate ? message.createdAt.toDate() : null;
              const time = ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow text-sm ${isMine ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {!isMine && (
                      <div className="font-semibold mb-0.5">{message.senderDisplayName}</div>
                    )}
                    <div>{message.text}</div>
                    <div className={`mt-1 text-[10px] ${isMine ? 'text-indigo-100' : 'text-gray-500'}`}>{time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
        </div>

        {/* Composer */}
        <div className="p-4 border-t bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleNewMessageChange}
              placeholder={recipient ? 'Type a message…' : 'Select a user to chat'}
              disabled={!recipient}
              className="flex-1 border rounded-md py-2 px-3 text-gray-700 focus:outline-none disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!recipient || newMessage.trim() === ''}
              className="btn btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
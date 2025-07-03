import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const GET_CONVERSATION = gql`
  query GetConversation($id: String!) {
    conversation(id: $id) {
      id
      name
      isGroup
      participants {
        id
        username
      }
      messages {
        id
        content
        senderId
        createdAt
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($sendMessageInput: SendMessageInput!) {
    sendMessage(sendMessageInput: $sendMessageInput) {
      id
      content
      senderId
      createdAt
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageSent($conversationId: String!) {
    messageSent(conversationId: $conversationId) {
      id
      content
      senderId
      createdAt
    }
  }
`;

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Participant {
  id: string;
  username: string;
}

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: Participant[];
  messages: Message[];
}

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { loading, error, data } = useQuery(GET_CONVERSATION, {
    variables: { id },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { conversationId: id },
    onData: ({ data }) => {
      // Apollo Cache will automatically update with the new message
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        variables: {
          sendMessageInput: {
            content: newMessage,
            conversationId: id,
            senderId: currentUser.id,
          },
        },
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          Error: {error.message}
        </Typography>
      </Container>
    );
  }

  const conversation: Conversation = data.conversation;

  return (
    <Container
      sx={{
        height: '100%',
        padding: '0 !important',
        maxWidth: 'none !important',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AvatarGroup 
              max={3}
              sx={{
                '& .MuiAvatar-root': {
                  width: 40,
                  height: 40,
                  fontSize: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {conversation.participants.map((participant: Participant) => (
                <Avatar
                  key={participant.id}
                  sx={{ bgcolor: stringToColor(participant.username) }}
                >
                  {participant.username.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                {conversation.name || conversation.participants.map(p => p.username).join(', ')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {conversation.participants.length} participants
                <Typography 
                  component="span" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 'inherit',
                  }}
                >
                  ({conversation.participants.map((p: Participant) => p.username).join(', ')})
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>

        <List
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            p: 2,
          }}
        >
          <div ref={messagesEndRef}>
            {conversation.messages.map((message: Message) => {
              const isCurrentUser = message.senderId === currentUser.id;
              const sender = conversation.participants.find(p => p.id === message.senderId);

              return (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                    p: 0,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: isCurrentUser ? 'primary.main' : 'grey.300',
                      color: isCurrentUser ? 'white' : 'text.primary',
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    {!isCurrentUser && (
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                        {sender?.username}
                      </Typography>
                    )}
                    <Typography>{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </div>
        </List>

        <Divider />

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
} 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';

const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
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
        createdAt
      }
    }
  }
`;

interface Participant {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: Participant[];
  messages: Message[];
}

export default function ConversationList() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const { loading, error, data } = useQuery(GET_CONVERSATIONS);

  const handleCreateConversation = () => {
    // TODO: Implement conversation creation mutation
    setIsDialogOpen(false);
    setNewConversationName('');
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

  return (
    <Container
      sx={{
        height: '100%',
        position: 'relative',
        padding: '24px',
        paddingBottom: '80px', // Pour laisser de l'espace pour le bouton fixe
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Conversations
      </Typography>
      <List>
        {data.conversations.map((conversation: Conversation) => (
          <ListItem
            key={conversation.id}
            button
            onClick={() => navigate(`/conversations/${conversation.id}`)}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <GroupIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={conversation.name || conversation.participants.map(p => p.username).join(', ')}
              secondary={
                conversation.messages.length > 0
                  ? `Latest: ${conversation.messages[conversation.messages.length - 1].content}`
                  : 'No messages yet'
              }
            />
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => setIsDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: '240px' }, // Responsive pour la sidebar
          right: 0,
          height: 64,
          borderRadius: 0,
          fontSize: '1.1rem',
          textTransform: 'none',
          zIndex: 1000
        }}
      >
        Create Conversation
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Name"
            fullWidth
            value={newConversationName}
            onChange={(e) => setNewConversationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateConversation} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
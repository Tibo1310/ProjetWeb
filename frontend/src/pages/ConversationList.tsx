import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
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
  Autocomplete,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { Group as GroupIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
    }
  }
`;

const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(createConversationInput: $input) {
      id
      name
      participants {
        id
        username
      }
    }
  }
`;

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

const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($input: UpdateConversationInput!) {
    updateConversation(updateConversationInput: $input) {
      id
      name
      participants {
        id
        username
      }
    }
  }
`;

const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: String!) {
    deleteConversation(id: $id)
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

interface User {
  id: string;
  username: string;
}

export default function ConversationList() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  const { loading: loadingConversations, error: errorConversations, data: conversationsData } = useQuery(GET_CONVERSATIONS);
  const { loading: loadingUsers, data: usersData } = useQuery(GET_USERS);
  
  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const [updateConversation] = useMutation(UPDATE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const handleCreateOpen = () => {
    setOpen(true);
    setName('');
    setSelectedUsers([]);
  };

  const handleEditOpen = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setName(conversation.name);
    setSelectedUsers(conversation.participants.map(({ id, username }) => ({ id, username })));
    setEditOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditOpen(false);
    setSelectedConversation(null);
  };

  const handleCreateSave = async () => {
    if (!name || selectedUsers.length === 0) return;
    
    try {
      await createConversation({
        variables: {
          input: {
            name,
            participantIds: selectedUsers.map(user => user.id),
          },
        },
      });
      
      handleClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleEditSave = async () => {
    if (!selectedConversation) return;

    try {
      await updateConversation({
        variables: {
          input: {
            id: selectedConversation.id,
            name,
            participantIds: selectedUsers.map(user => user.id),
          },
        },
      });
      handleClose();
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation({
          variables: { id },
        });
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  if (loadingConversations) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (errorConversations) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          Error: {errorConversations.message}
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
        paddingBottom: '80px',
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Conversations
      </Typography>
      <List>
        {conversationsData.conversations.map((conversation: Conversation) => (
          <ListItem
            key={conversation.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Box
              onClick={() => navigate(`/conversation/${conversation.id}`)}
              sx={{ flexGrow: 1 }}
            >
              <ListItemText
                primary={conversation.name}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {`${conversation.participants.length} participants (${conversation.participants.map(p => p.username).join(', ')})`}
                  </Typography>
                }
              />
            </Box>
            <Box>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditOpen(conversation);
                }}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(conversation.id);
                }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleCreateOpen}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: '240px' },
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

      <Dialog 
        open={open || editOpen} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editOpen ? 'Edit Conversation' : 'Create New Conversation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={usersData?.users || []}
            getOptionLabel={(option: User) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Select Users"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={editOpen ? handleEditSave : handleCreateSave} 
            variant="contained"
            disabled={!name || selectedUsers.length === 0}
          >
            {editOpen ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
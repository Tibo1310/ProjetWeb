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
} from '@mui/material';
import { Group as GroupIcon, Search as SearchIcon } from '@mui/icons-material';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  const { loading: loadingConversations, error: errorConversations, data: conversationsData } = useQuery(GET_CONVERSATIONS);
  const { loading: loadingUsers, data: usersData } = useQuery(GET_USERS);
  
  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const handleCreateConversation = async () => {
    if (!newConversationName || selectedUsers.length === 0) return;
    
    try {
      await createConversation({
        variables: {
          input: {
            name: newConversationName,
            participantIds: selectedUsers.map(user => user.id),
          },
        },
      });
      
      setIsDialogOpen(false);
      setNewConversationName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
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
              primary={conversation.name}
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {conversation.participants.map(p => p.username).join(', ')}
                </Typography>
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
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Name"
            fullWidth
            value={newConversationName}
            onChange={(e) => setNewConversationName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={usersData?.users || []}
            getOptionLabel={(option: User) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Users"
                placeholder="Type to search users"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value: User[], getTagProps) =>
              value.map((option: User, index: number) => (
                <Chip
                  label={option.username}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setNewConversationName('');
            setSelectedUsers([]);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateConversation} 
            variant="contained"
            disabled={!newConversationName || selectedUsers.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
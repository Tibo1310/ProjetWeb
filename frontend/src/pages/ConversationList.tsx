import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Box,
  Avatar,
  AvatarGroup,
  Skeleton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

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

  if (errorConversations) return <div>Error: {errorConversations.message}</div>;
  if (loadingConversations) return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff', mb: 3, borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Conversations
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '4px' }} />
      </Typography>
      <List sx={{ gap: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        {[1, 2, 3].map((index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              pl: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              </Box>
              <Skeleton variant="circular" width={24} height={24} sx={{ ml: 1 }} />
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  if (!conversationsData || !conversationsData.conversations) return <div>No conversations found</div>;

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600,
          color: '#fff',
          mb: 3,
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Conversations
        <Button
          variant="contained"
          onClick={handleCreateOpen}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: 'rgba(25, 118, 210, 0.15)',
            borderColor: 'rgba(25, 118, 210, 0.3)',
            color: '#64b5f6',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.25)',
            },
          }}
        >
          New Chat
        </Button>
      </Typography>

      <List sx={{ gap: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        {conversationsData.conversations.map((conversation: Conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          
          return (
            <ListItem
              key={`conversation-${conversation.id}`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                },
                position: 'relative',
                overflow: 'hidden',
                pl: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
              onClick={() => navigate(`/conversations/${conversation.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <AvatarGroup 
                  max={3}
                  sx={{
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {conversation.participants.map((participant) => (
                    <Avatar
                      key={`${conversation.id}-${participant.id}`}
                      sx={{ bgcolor: stringToColor(participant.username) }}
                    >
                      {participant.username.charAt(0).toUpperCase()}
                    </Avatar>
                  ))}
                </AvatarGroup>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '1rem',
                    }}
                  >
                    {conversation.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {lastMessage 
                      ? `${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`
                      : 'No messages yet'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOpen(conversation);
                    }}
                    size="small"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        color: '#fff',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conversation.id);
                    }}
                    size="small"
                    sx={{
                      color: '#ff4d4d',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255, 77, 77, 0.15)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                }}
              >
                {conversation.participants.length} participants
              </Typography>
            </ListItem>
          );
        })}
      </List>

      <Dialog 
        open={open || editOpen} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e',
            color: '#fff',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {editOpen ? 'Edit Conversation' : 'Create New Conversation'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
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
                label="Select Users"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            )}
            sx={{
              '& .MuiChip-root': {
                bgcolor: 'rgba(25, 118, 210, 0.15)',
                color: '#64b5f6',
                borderColor: 'rgba(25, 118, 210, 0.3)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#fff',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={editOpen ? handleEditSave : handleCreateSave}
            variant="contained"
            disabled={!name || selectedUsers.length === 0}
            sx={{
              bgcolor: 'rgba(25, 118, 210, 0.15)',
              color: '#64b5f6',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.25)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {editOpen ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      isOnline
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
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

export default function UserList() {
  const { loading, error, data } = useQuery(GET_USERS, {
    pollInterval: 5000,
  });
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser({
          variables: { id },
        });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading...</div>;
  if (!data || !data.users) return <div>No users found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: '#fff',
          mb: 3,
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 2
        }}
      >
        Users
      </Typography>
      <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        {data.users.map((user: User) => (
          <ListItem
            key={user.id}
            sx={{
              bgcolor: user.isOnline ? 'rgba(25, 118, 210, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              border: '1px solid',
              borderColor: user.isOnline ? 'rgba(25, 118, 210, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                borderColor: user.isOnline ? 'rgba(25, 118, 210, 0.5)' : 'rgba(255, 255, 255, 0.2)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: user.isOnline ? '#1976d2' : 'rgba(255, 255, 255, 0.3)',
                transition: 'background-color 0.3s ease',
              },
              pl: 3,
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: stringToColor(user.username),
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  {user.username}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                  }}
                >
                  {user.email}
                </Typography>
              }
            />
            <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              {user.id !== currentUserId && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(user.id)}
                  color="error"
                  size="small"
                  sx={{
                    opacity: 0.7,
                    color: '#ff4d4d',
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255, 77, 77, 0.15)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <Chip
                label={user.isOnline ? 'Online' : 'Offline'}
                size="small"
                sx={{
                  color: user.isOnline ? '#64b5f6' : 'rgba(255, 255, 255, 0.7)',
                  bgcolor: user.isOnline ? 'rgba(25, 118, 210, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  height: '24px',
                  '& .MuiChip-label': {
                    fontWeight: user.isOnline ? 600 : 500,
                    px: 1.5,
                  },
                  border: '1px solid',
                  borderColor: user.isOnline ? 'rgba(25, 118, 210, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 